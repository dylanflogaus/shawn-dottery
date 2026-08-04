from django.core.management.base import BaseCommand

from events.export import export_events_to_json


class Command(BaseCommand):
    help = "Export published upcoming events to the static site JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            dest="path",
            default=None,
            help="Optional override path for events.json",
        )

    def handle(self, *args, **options):
        path = export_events_to_json(options["path"])
        self.stdout.write(self.style.SUCCESS(f"Exported events to {path}"))
