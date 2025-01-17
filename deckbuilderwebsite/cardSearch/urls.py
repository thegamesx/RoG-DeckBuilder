from django.urls import path
from . import views

urlpatterns = [
    path("card/<set_id>/<int:card_id>", views.specific_card_info, name="specific_card_info"),
    path("card/<int:db_card_id>", views.generic_card_info, name="generic_card_info"),
]
