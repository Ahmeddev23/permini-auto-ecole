from django.urls import path
from . import views

app_name = 'students'

urlpatterns = [
    # Candidats
    path('', views.StudentListCreateView.as_view(), name='student_list'),
    path('<int:pk>/', views.StudentDetailView.as_view(), name='student_detail'),
    path('<int:pk>/progress/', views.StudentProgressView.as_view(), name='student_progress'),
    path('<int:pk>/stats/', views.student_stats_view, name='student_stats'),

    # Validation en temps réel
    path('validate-email/', views.validate_email, name='validate_email'),
    path('validate-cin/', views.validate_cin, name='validate_cin'),

    # Planning avec examens
    path('<int:student_id>/schedule-with-exams/', views.student_schedule_with_exams_view, name='student_schedule_with_exams'),

    # Planning simple (séances seulement)
    path('<int:student_id>/schedule/', views.student_schedule_view, name='student_schedule'),

    # Examens de l'étudiant
    path('<int:student_id>/exams/', views.student_exams_view, name='student_exams'),

    # Gestion des paiements
    path('<int:pk>/setup-pricing/', views.setup_student_pricing, name='setup_student_pricing'),
    path('<int:pk>/add-payment/', views.add_payment, name='add_payment'),
    path('<int:pk>/payment-logs/', views.get_payment_logs, name='get_payment_logs'),

    # Historique
    path('<int:pk>/payments/', views.student_payments_view, name='student_payments'),
    path('<int:pk>/exams/', views.student_exams_view, name='student_exams'),
    path('<int:pk>/sessions/', views.student_sessions_view, name='student_sessions'),

    # Informations de l'auto-école pour l'étudiant connecté
    path('my-driving-school-info/', views.student_driving_school_info_view, name='student_driving_school_info'),
    path('subscription-info/', views.student_subscription_info_view, name='student_subscription_info'),
]
