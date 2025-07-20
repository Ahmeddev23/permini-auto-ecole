from django.urls import path
from . import views

app_name = 'vehicles'

urlpatterns = [
    # Véhicules
    path('', views.VehicleListCreateView.as_view(), name='vehicle_list'),
    path('<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle_detail'),
    path('available/', views.available_vehicles_view, name='available_vehicles'),
    path('<int:pk>/stats/', views.vehicle_stats_view, name='vehicle_stats'),
    path('<int:pk>/upload-photo/', views.upload_vehicle_photo, name='upload_vehicle_photo'),
    path('<int:pk>/assign-instructor/', views.assign_vehicle_instructor, name='assign_vehicle_instructor'),
    path('<int:pk>/update-dates/', views.update_vehicle_dates, name='update_vehicle_dates'),
]
