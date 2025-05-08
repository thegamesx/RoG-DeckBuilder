from django.shortcuts import render
from django.views.generic import ListView
from django.shortcuts import get_list_or_404
from deckbuilder.models import DeckModel

class UserDecks(ListView):
    model = DeckModel
    paginate_by = 30
    template_name = "users/my-decks.html"
    context_object_name = "deck_list"
    ordering = ['-published_date']

    def get_queryset(self):
        profile_name = self.kwargs['profile_name']
        return get_list_or_404(DeckModel.get_all_decks_from_user(profile_name, self.request.user))