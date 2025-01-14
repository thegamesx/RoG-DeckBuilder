from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse

def index(request):
    cardlist = ["carta1","carta2","carta3"] #Temp, cambiar por una llamada a la DB luego
    context = {
        'cardlist': cardlist
    }
    return render(request, "deckbuilder/index.html", context)