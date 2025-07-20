from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Paiements candidats
    path('', views.PaymentListCreateView.as_view(), name='payment_list'),
    path('<int:pk>/', views.PaymentDetailView.as_view(), name='payment_detail'),
    path('<int:pk>/mark-paid/', views.mark_payment_paid_view, name='mark_paid'),
    path('stats/', views.payment_stats_view, name='payment_stats'),
    path('methods-stats/', views.payment_methods_stats_view, name='payment_methods_stats'),
    
    # Paiements abonnements
    path('subscriptions/', views.SubscriptionPaymentListCreateView.as_view(), name='subscription_list'),
    path('subscriptions/<int:pk>/', views.SubscriptionPaymentDetailView.as_view(), name='subscription_detail'),

    # Paiements instantanés
    path('card/', views.process_card_payment, name='card_payment'),
    path('flouci/', views.process_flouci_payment, name='flouci_payment'),
]
