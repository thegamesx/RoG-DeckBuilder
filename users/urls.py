from django.urls import path
from . import views

urlpatterns = [
    # path("user/<str:profile_name>/", views.register, name="register"),
    path("decks/<str:profile_name>/", views.UserDecks.as_view(), name="user_decks"),
]
