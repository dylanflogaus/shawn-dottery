from django.db import models
from django.utils.text import slugify


class Event(models.Model):
    class Category(models.TextChoices):
        MEET_GREET = "Meet & Greet", "Meet & Greet"
        COMMUNITY = "Community", "Community"
        VOLUNTEER = "Volunteer", "Volunteer"
        FUNDRAISER = "Fundraiser", "Fundraiser"
        GOTV = "GOTV", "GOTV"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.CharField(
        max_length=40,
        choices=Category.choices,
        default=Category.MEET_GREET,
    )
    start_at = models.DateTimeField()
    location = models.CharField(max_length=200)
    description = models.TextField()
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Show on the homepage featured events section (up to 3).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "event"
            slug = base
            counter = 2
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class RSVP(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvps")
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["event", "email"],
                name="unique_rsvp_per_event_email",
            )
        ]
        verbose_name = "RSVP"
        verbose_name_plural = "RSVPs"

    def __str__(self):
        return f"{self.name} → {self.event.title}"
