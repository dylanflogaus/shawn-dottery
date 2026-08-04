"""Serialize published events to the static-site JSON file."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.utils import timezone

from .models import Event


def serialize_event(event: Event) -> dict:
    local = timezone.localtime(event.start_at)
    return {
        "slug": event.slug,
        "title": event.title,
        "category": event.category,
        "start_at": local.isoformat(),
        "month_abbr": local.strftime("%b"),
        "day": local.day,
        "time_display": local.strftime("%-I:%M %p"),
        "location": event.location,
        "description": event.description,
        "featured": event.is_featured,
    }


def build_export_payload() -> dict:
    now = timezone.now()
    events = (
        Event.objects.filter(is_published=True, start_at__gte=now)
        .order_by("start_at")
    )
    return {
        "exported_at": datetime.now(tz=timezone.get_current_timezone()).isoformat(),
        "events": [serialize_event(event) for event in events],
    }


def export_events_to_json(path: str | Path | None = None) -> Path:
    export_path = Path(path or settings.EVENTS_EXPORT_PATH)
    export_path.parent.mkdir(parents=True, exist_ok=True)
    payload = build_export_payload()
    export_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return export_path
