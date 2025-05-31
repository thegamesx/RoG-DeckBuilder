from django.contrib import admin
from deckbuilder.models import *

# Register your models here.

class DeckModelAdmin(admin.ModelAdmin):
    readonly_fields = ('published_date', 'last_modified')

admin.site.register(DeckModel, DeckModelAdmin)