from django.urls import path
from . import views

urlpatterns = [
    path("decks/<str:profile_name>/", views.UserDecks.as_view(), name="user_decks"),
    path('logout/', views.custom_logout_view, name='logout'),
    path("register/", views.register, name="register"),
]
