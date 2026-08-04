import csv

from django.contrib import admin, messages
from django.http import HttpResponse

from .export import export_events_to_json
from .models import Event, RSVP


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "start_at",
        "location",
        "is_published",
        "is_featured",
    )
    list_filter = ("category", "is_published", "is_featured", "start_at")
    search_fields = ("title", "location", "description", "slug")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "start_at"
    actions = ("export_events_to_site",)

    @admin.action(description="Export events to site")
    def export_events_to_site(self, request, queryset):
        # Action ignores selection; export always uses all published upcoming events.
        path = export_events_to_json()
        self.message_user(
            request,
            f"Exported published upcoming events to {path}.",
            messages.SUCCESS,
        )


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "event", "phone", "created_at")
    list_filter = ("event", "created_at")
    search_fields = ("name", "email", "phone", "event__title")
    readonly_fields = ("created_at",)
    actions = ("export_as_csv",)

    @admin.action(description="Export selected RSVPs as CSV")
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="rsvps.csv"'
        writer = csv.writer(response)
        writer.writerow(["Event", "Name", "Email", "Phone", "Created at"])
        for rsvp in queryset.select_related("event"):
            writer.writerow(
                [
                    rsvp.event.title,
                    rsvp.name,
                    rsvp.email,
                    rsvp.phone,
                    rsvp.created_at.isoformat(),
                ]
            )
        return response
