from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentification
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),  # Ancien endpoint (compatibilité)
    path('login/driving-school/', views.login_driving_school, name='login_driving_school'),
    path('login/student/', views.login_student, name='login_student'),
    path('login/instructor/', views.login_instructor, name='login_instructor'),
    path('logout/', views.logout_view, name='logout'),
    
    # Profil
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # Vérification email
    path('send-verification-code/', views.send_verification_code_view, name='send_verification_code'),
    path('verify-code/', views.verify_code_before_registration_view, name='verify_code'),
    path('verify-email/', views.verify_email_view, name='verify_email'),
    path('resend-verification/', views.resend_verification_view, name='resend_verification'),

    # Validation en temps réel
    path('check-email/', views.check_email_availability, name='check_email'),
    path('check-cin/', views.check_cin_availability, name='check_cin'),

    # Upload de documents
    path('upload-documents/', views.upload_documents_view, name='upload_documents'),
]
