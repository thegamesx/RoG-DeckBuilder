from django.urls import path
from . import views

urlpatterns = [
    path("builder/", views.deckbuilder_page, name="deckbuilder_page"),
    path("builder/<int:deck_id>", views.deckbuilder_page, name="deckbuilder_page"),
    path("builder/saveDeck", views.save_deck, name="save_deck"),
    path("builder/search/<str:query>", views.card_list_query, name="card_query"),
    path("view/<int:deck_id>", views.view_deck, name="view_deck"),
    path("search/", views.DeckSearch.as_view(), name="search_all_decks"),
    path("search/<str:user_query>", views.DeckSearch.as_view(), name="search_decks"),
    path("user/<str:profile_name>/", views.UserDecks.as_view(), name="user_decks"),
    path("user/<str:profile_name>/delete/<int:deck_id>", views.delete_deck, name="delete_deck"),
]
