# Generated by Django 5.1.4 on 2025-02-12 15:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('RoGDB', '0024_format_card_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='card',
            old_name='legality',
            new_name='card_legality',
        ),
    ]
