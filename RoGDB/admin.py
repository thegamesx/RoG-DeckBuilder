from django.contrib import admin
from RoGDB.models import *

# Register your models here.

admin.site.register(Card)
admin.site.register(CardSet)
admin.site.register(Format)
admin.site.register(CardVersion)
admin.site.register(FormatFollows)