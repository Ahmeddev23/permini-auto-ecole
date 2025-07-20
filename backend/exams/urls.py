from django.urls import path
from . import views

app_name = 'exams'

urlpatterns = [
    # Examens
    path('', views.ExamListCreateView.as_view(), name='exam_list'),
    path('<int:pk>/', views.ExamDetailView.as_view(), name='exam_detail'),
    path('stats/', views.exam_stats_view, name='exam_stats'),
    
    # Sessions d'examen
    path('sessions/', views.ExamSessionListCreateView.as_view(), name='session_list'),
    path('sessions/<int:pk>/', views.ExamSessionDetailView.as_view(), name='session_detail'),
    path('sessions/<int:session_id>/register/', views.register_for_exam_view, name='register_exam'),
]
