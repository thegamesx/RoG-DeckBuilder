from django.shortcuts import render
from django.views.generic import ListView
from django.shortcuts import get_list_or_404, redirect
from django.contrib.auth import logout
from django.contrib import messages
from deckbuilder.models import DeckModel
from django.http import HttpResponseRedirect

def custom_logout_view(request):
    logout(request)
    messages.success(request, "Cuenta cerrada con éxito.")
    return HttpResponseRedirect('/user/login')  # o la URL que quieras redirigir

def register(request, profile_name):
    return render(request, "users/register.html", {"profile_name": profile_name})

class UserDecks(ListView):
    model = DeckModel
    paginate_by = 30
    template_name = "users/my-decks.html"
    context_object_name = "deck_list"
    ordering = ['-published_date']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['profile_name'] = self.kwargs['profile_name']
        return context

    def get_queryset(self):
        profile_name = self.kwargs['profile_name']
        return get_list_or_404(DeckModel.get_all_decks_from_user(profile_name, self.request.user))