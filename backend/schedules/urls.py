from django.urls import path
from . import views

app_name = 'schedules'

urlpatterns = [
    # Emplois du temps
    path('', views.ScheduleListCreateView.as_view(), name='schedule_list'),
    path('<int:pk>/', views.ScheduleDetailView.as_view(), name='schedule_detail'),
    path('<int:pk>/status/', views.update_schedule_status_view, name='update_status'),
    
    # Calendrier et disponibilité
    path('calendar/', views.calendar_events_view, name='calendar_events'),
    path('check-availability/', views.check_availability_view, name='check_availability'),
]
