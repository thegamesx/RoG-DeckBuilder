# Generated by Django 5.1.4 on 2025-02-06 14:09

import multiselectfield.db.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('RoGDB', '0021_alter_card_rarity'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='faction',
            field=multiselectfield.db.fields.MultiSelectField(blank=True, choices=[('J', 'Jupiter'), ('M', 'Marte'), ('N', 'Neptuno'), ('P', 'Pluton'), ('S', 'Saturno')], max_length=9),
        ),
        migrations.AlterField(
            model_name='card',
            name='rarity',
            field=models.IntegerField(choices=[(0, 'Token'), (1, 'Común'), (2, 'Rara'), (3, 'Épica'), (4, 'Legendaria')]),
        ),
    ]
