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

def register(request):
    return render(request, "users/registration-form.html")