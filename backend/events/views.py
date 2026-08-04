import json

from django.conf import settings
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django_ratelimit.decorators import ratelimit

from .models import Event, RSVP


def _json_error(message, status=400):
    return JsonResponse({"ok": False, "error": message}, status=status)


@csrf_exempt
@require_POST
@ratelimit(key="ip", rate="20/m", block=True)
def rsvp_create(request):
    if not settings.RSVP_API_ENABLED:
        return _json_error("RSVP API is disabled.", status=503)

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body.")

    event_slug = (payload.get("event_slug") or "").strip()
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    phone = (payload.get("phone") or "").strip()

    if not event_slug:
        return _json_error("event_slug is required.")
    if not name:
        return _json_error("name is required.")
    if not email or "@" not in email:
        return _json_error("A valid email is required.")

    try:
        event = Event.objects.get(slug=event_slug, is_published=True)
    except Event.DoesNotExist:
        return _json_error("Event not found.", status=404)

    try:
        rsvp = RSVP.objects.create(
            event=event,
            name=name[:120],
            email=email[:254],
            phone=phone[:40],
        )
    except IntegrityError:
        return _json_error("You have already RSVP'd to this event.", status=409)

    return JsonResponse(
        {
            "ok": True,
            "message": "RSVP saved – we'll confirm by email.",
            "rsvp_id": rsvp.pk,
        },
        status=201,
    )
