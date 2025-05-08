from django.urls import path
from . import views

urlpatterns = [
    # path("user/<str:profile_name>/", views.register, name="register"),
    path("<str:profile_name>/decks/", views.UserDecks.as_view(), name="user_decks"),
]
