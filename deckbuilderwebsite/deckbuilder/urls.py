from django.urls import path
from . import views

urlpatterns = [
    path("", views.deckbuilder_page, name="deckbuilder_page"),
    path("search/<str:query>", views.card_list_query, name="card_query"),
]
