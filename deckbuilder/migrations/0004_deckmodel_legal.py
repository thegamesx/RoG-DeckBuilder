# Generated by Django 5.1.4 on 2025-02-07 16:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deckbuilder', '0003_deckmodel_last_modified_deckmodel_published_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='deckmodel',
            name='legal',
            field=models.BooleanField(default=True),
        ),
    ]
