from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import Event


SEED_EVENTS = [
    {
        "title": "Coffee with Shawn",
        "slug": "coffee-with-shawn",
        "category": Event.Category.MEET_GREET,
        "start_at": datetime(2026, 9, 12, 9, 0),
        "location": "Wilmington",
        "description": (
            "Morning conversation at a local cafe. Come say hello and share "
            "what matters in your neighborhood."
        ),
        "is_featured": True,
    },
    {
        "title": "District Listening Session",
        "slug": "district-listening-session",
        "category": Event.Category.COMMUNITY,
        "start_at": datetime(2026, 9, 27, 18, 30),
        "location": "3rd District",
        "description": (
            "An open forum on cost of living and public safety. Your stories "
            "help shape the work ahead."
        ),
        "is_featured": True,
    },
    {
        "title": "Door Knocking Kickoff",
        "slug": "door-knocking-kickoff",
        "category": Event.Category.VOLUNTEER,
        "start_at": datetime(2026, 10, 4, 10, 0),
        "location": "Wilmington",
        "description": (
            "Join the team for our first neighborhood canvass. Training "
            "provided. Comfortable shoes recommended."
        ),
        "is_featured": False,
    },
    {
        "title": "Founding 100 Dinner",
        "slug": "founding-100-dinner",
        "category": Event.Category.FUNDRAISER,
        "start_at": datetime(2026, 10, 10, 18, 0),
        "location": "Private venue",
        "description": (
            "Join early supporters for an evening that launches the next "
            "stretch of the campaign."
        ),
        "is_featured": True,
    },
    {
        "title": "Saturday with Seniors",
        "slug": "saturday-with-seniors",
        "category": Event.Category.MEET_GREET,
        "start_at": datetime(2026, 10, 18, 11, 0),
        "location": "Community center",
        "description": (
            "Conversation on fixed incomes, neighborhood safety, and what "
            "dignity in retirement should look like."
        ),
        "is_featured": False,
    },
    {
        "title": "Get Out the Vote Rally",
        "slug": "get-out-the-vote-rally",
        "category": Event.Category.GOTV,
        "start_at": datetime(2026, 11, 1, 14, 0),
        "location": "3rd District",
        "description": (
            "Final weekend push before Election Day. Signs, phones, and "
            "neighbors ready to turn out the vote."
        ),
        "is_featured": False,
    },
]


class Command(BaseCommand):
    help = "Seed the six campaign events currently shown on the static site."

    def handle(self, *args, **options):
        tz = timezone.get_current_timezone()
        created = 0
        updated = 0

        for item in SEED_EVENTS:
            start_at = timezone.make_aware(item["start_at"], tz)
            obj, was_created = Event.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "category": item["category"],
                    "start_at": start_at,
                    "location": item["location"],
                    "description": item["description"],
                    "is_published": True,
                    "is_featured": item["is_featured"],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded events: {created} created, {updated} updated."
            )
        )
