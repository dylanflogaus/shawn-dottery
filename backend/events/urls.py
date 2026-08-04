from django.urls import path

from . import views

urlpatterns = [
    path("rsvp/", views.rsvp_create, name="rsvp-create"),
]
