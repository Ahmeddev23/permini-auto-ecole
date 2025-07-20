from django.urls import path
from admin_dashboard.views import PublicContactFormView

urlpatterns = [
    # Formulaire de contact public
    path('contact/', PublicContactFormView.as_view(), name='public_contact_form'),
]
