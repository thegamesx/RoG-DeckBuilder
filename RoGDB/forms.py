from django import forms
from .models import CardSet, Format

class AdvancerSearchForm(forms.Form):

    TYPE = [
        ("","---"),
        ("Criatura","Criatura"),
        ("Sigilo","Sigilo"),
        ("Magia Lenta","Magia Lenta"),
        ("Magia Rapida","Magia Rapida"),
        ("Artefacto","Artefacto"),
        ("Terreno","Terreno"),
        ("Estructura","Estructura"),
        ("Token","Token"),
    ]

    FACTION = [
        ("","---"),
        ("Neptuno","Neptuno"),
        ("Pluton","Pluton"),
        ("Jupiter","Jupiter"),
        ("Saturno","Saturno"),
        ("Marte","Marte"),
    ]

    RARITY = [
        ("","---"),
        ("Comun","Comun"),
        ("Rara","Rara"),
        ("Epica","Epica"),
        ("Legendaria","Legendaria"),
    ]

    OPERATORS = [
        ("=", "Igual a"),
        (">", "Mayor a"),
        (">=", "Mayor o igual a"),
        ("<", "Menor a"),
        ("<=", "Menor o igual a"),
        ("!=", "Diferente a"),
    ]

    LEGALITY = [
        ("legal", "Legal"),
        ("banned", "Prohibida"),
    ]

    card_name = forms.CharField(label="Nombre", max_length=200, required=False)
    text_box = forms.CharField(label="Habilidad", max_length=2000, required=False)
    card_type = forms.ChoiceField(label="Tipo", choices=TYPE, required=False)
    faction = forms.ChoiceField(label="Facción", choices=FACTION, required=False)
    cost = forms.CharField(label="Coste", max_length=20, required=False)
    cc_operator = forms.ChoiceField(choices=OPERATORS, required=False)
    converted_cost = forms.IntegerField(label="Costo total", required=False)
    a_operator = forms.ChoiceField(choices=OPERATORS, required=False)
    attack = forms.IntegerField(label="Ataque", required=False)
    h_operator = forms.ChoiceField(choices=OPERATORS, required=False)
    health = forms.IntegerField(label="Vida", required=False)
    rarity = forms.ChoiceField(label="Rareza", choices=RARITY, required=False)
    set_dropdown = forms.ChoiceField(label="Expansion", choices=CardSet.get_list_of_sets(), required=False)
    legality = forms.ChoiceField(label="Legal", choices=LEGALITY, required=False)
    format = forms.ChoiceField(label="Formato", choices=Format.get_list_of_formats(), required=False)
