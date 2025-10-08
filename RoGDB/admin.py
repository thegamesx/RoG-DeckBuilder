from django.contrib import admin
from RoGDB.models import *

# Register your models here.

class CardLegalityInline(admin.TabularInline):
    model = Card.card_legality.through
    extra = 1

class CardVersionInline(admin.StackedInline):
    model = CardVersion
    extra = 1
    fieldsets = [
        (None,
            {'fields': [
                'set_id',
                'serial_number',
                'flavor_text',
                'artist',
                'card_art',
            ]}),
        ('Avanzado',
         {'classes': ['collapse'],
          'fields': [
              'is_skin',
              'label',
          ]}),
    ]

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    # Esta es la pagina para agregar una carta nueva, que no sea una reimpresion
    fieldsets = [
        (None, 
         {'fields': [
             'card_name', 
             'faction', 
             'card_type', 
             'rarity', 
             'cost', 
             ('attack', 'health'),
             'text_box',
         ]}),
        ('Avanzado',
         {'classes': ['collapse'],
          'fields': [
              'related_cards',
              'rules_explanation',
          ]}),
    ]

    inlines = [CardVersionInline, CardLegalityInline]

    exclude = ('card_legality',)

    list_display = ('card_name', 'faction', 'card_type', 'rarity')
    list_filter = ('faction', 'card_type', 'rarity')
    search_fields = ('card_name',)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        card = form.instance

        if not card.card_legality.exists():
            standard_format = Format.objects.get(name='Eterno')
            card.card_legality.add(standard_format)

@admin.register(FormatFollows)
class FormatFollowsAdmin(admin.ModelAdmin):
    list_display = ('card_id', 'format_id', 'legality')
    list_filter = ('format_id', 'legality')
    search_fields = ('card_id__card_name', 'format_id__format_name')

    #TODO: Agregar una forma de cambiar la legalidad de varias cartas a la vez

@admin.register(CardVersion)
class CardVersionAdmin(admin.ModelAdmin):
    list_display = ('card_id', 'faction', 'set_id', 'set_name', 'serial_number', 'is_skin')
    list_select_related = ('card_id', 'set_id')
    list_filter = ('set_id', 'is_skin')
    search_fields = ('card_id__card_name', 'set_id__set_name', 'set_id', 'serial_number', 'label')

    def faction(self, obj):
        return obj.card_id.faction
    faction.short_description = 'Facción'

    def set_name(self, obj):
        return obj.set_id.set_name
    set_name.short_description = 'Nombre del Set'

@admin.register(CardSet)
class CardSetAdmin(admin.ModelAdmin):
    list_display = ('set_code', 'set_name', 'set_type', 'released_date', 'total_cards', 'is_visible')
    list_filter = ('set_type',)
    search_fields = ('set_name', 'set_type', 'set_code')

@admin.register(Format)
class FormatAdmin(admin.ModelAdmin):
    list_display = ('format_name', 'format_desc')
    search_fields = ('format_name',)