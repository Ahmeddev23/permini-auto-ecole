from django.urls import path
from . import views

app_name = 'instructors'

urlpatterns = [
    # Moniteurs
    path('', views.InstructorListCreateView.as_view(), name='instructor_list'),
    path('<int:pk>/', views.InstructorDetailView.as_view(), name='instructor_detail'),
    path('<int:pk>/schedule/', views.instructor_schedule_view, name='instructor_schedule'),
    path('<int:pk>/stats/', views.instructor_stats_view, name='instructor_stats'),

    # Validation en temps réel
    path('validate-email/', views.validate_instructor_email, name='validate_instructor_email'),
    path('validate-cin/', views.validate_instructor_cin, name='validate_instructor_cin'),

    # Liste avec auto-école
    path('with-driving-school/', views.instructors_with_driving_school_view, name='instructors_with_driving_school'),

    # Informations d'abonnement pour moniteurs
    path('subscription-info/', views.instructor_subscription_info_view, name='instructor_subscription_info'),

    # Statistiques et planning du moniteur connecté
    path('my-stats/', views.my_instructor_stats_view, name='my_instructor_stats'),
    path('my-recent-schedule/', views.my_today_schedule_view, name='my_recent_schedule'),
    path('my-driving-school-info/', views.instructor_driving_school_info_view, name='instructor_driving_school_info'),
]
