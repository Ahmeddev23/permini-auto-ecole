from django.urls import path
from . import views

app_name = 'driving_schools'

urlpatterns = [
    # Auto-école
    path('create/', views.DrivingSchoolCreateView.as_view(), name='create'),
    path('profile/', views.DrivingSchoolDetailView.as_view(), name='profile'),

    # Statistiques et abonnement
    path('dashboard/stats/', views.dashboard_stats_view, name='dashboard_stats'),
    path('recent-activities/', views.recent_activities_view, name='recent_activities'),
    path('upcoming-events/', views.upcoming_events_view, name='upcoming_events'),
    path('subscription/', views.subscription_info_view, name='subscription_info'),
    path('upgrade-plan/', views.upgrade_plan_view, name='upgrade_plan'),
    path('upgrade-request/', views.submit_upgrade_request_view, name='submit_upgrade_request'),
    path('upgrade-requests/', views.get_upgrade_requests_view, name='get_upgrade_requests'),

    # Vérification du statut d'approbation
    path('status/', views.get_driving_school_status_view, name='get_driving_school_status'),



    # Gestion des dépenses véhicules et comptabilité (Premium)
    path('vehicle-expenses/', views.vehicle_expenses_view, name='vehicle_expenses'),
    path('accounting-entries/', views.accounting_entries_view, name='accounting_entries'),
    path('financial-summary/', views.financial_summary_view, name='financial_summary'),
    path('import-accounting-data/', views.import_existing_data_to_accounting, name='import_accounting_data'),
    path('sync-accounting-data/', views.sync_accounting_data, name='sync_accounting_data'),
    path('debug-students-payments/', views.debug_students_payments, name='debug_students_payments'),

    path('settings/', views.driving_school_profile_view, name='driving_school_settings'),
    
    # Dépenses (Premium)
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expense_list'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense_detail'),
    
    # Revenus (Premium)
    path('revenues/', views.RevenueListCreateView.as_view(), name='revenue_list'),
    path('revenues/<int:pk>/', views.RevenueDetailView.as_view(), name='revenue_detail'),
]
