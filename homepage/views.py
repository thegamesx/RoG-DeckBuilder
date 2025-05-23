from django.http import HttpResponseRedirect
from django.shortcuts import render
from .forms import SearchForm

def homepage(request):
    if request.method == 'POST':
        search_form = SearchForm(request.POST)
        if search_form.is_valid():
            return HttpResponseRedirect(f"/{search_form.cleaned_data['search_category']}/search/{search_form.cleaned_data['query']}")
    else:
        search_form = SearchForm()
    return render (request, "homepage/home.html", {"form": search_form})

def register(request):
    return render (request, "homepage/register.html")
