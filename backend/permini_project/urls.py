"""
URL configuration for permini_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from admin_dashboard.views import validate_coupon_public

urlpatterns = [
    path('admin/', admin.site.urls),

    # API URLs
    path('api/auth/', include('accounts.urls')),
    path('api/driving-schools/', include('driving_schools.urls')),
    path('api/students/', include('students.urls')),
    path('api/instructors/', include('instructors.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/schedules/', include('schedules.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/notifications/', include('notifications.urls')),

    # Admin URLs
    path('api/admin/', include('admin_dashboard.urls')),

    # Coupons publics
    path('api/coupons/validate/', validate_coupon_public, name='validate_coupon_public'),
]

# Servir les fichiers media et statiques en développement
import os
if settings.DEBUG or os.environ.get('DOCKER_ENV'):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
