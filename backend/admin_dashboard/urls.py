from django.urls import path, include
from . import views

urlpatterns = [
    # Authentification admin
    path('auth/login/', views.admin_login_view, name='admin_login'),
    path('auth/logout/', views.admin_logout_view, name='admin_logout'),
    path('auth/me/', views.admin_current_user_view, name='admin_current_user'),

    # Dashboard et statistiques
    path('dashboard/stats/', views.admin_dashboard_stats_view, name='admin_dashboard_stats'),
    path('dashboard/charts/', views.get_chart_data, name='admin_chart_data'),

    # Gestion des auto-écoles
    path('driving-schools/', views.DrivingSchoolAdminListView.as_view(), name='admin_driving_schools'),
    path('driving-schools/<int:pk>/', views.DrivingSchoolAdminDetailView.as_view(), name='admin_driving_school_detail'),
    path('driving-schools/<int:pk>/approve/', views.approve_driving_school_view, name='admin_approve_driving_school'),
    path('driving-schools/<int:pk>/suspend/', views.suspend_driving_school_view, name='admin_suspend_driving_school'),
    path('driving-schools/<int:pk>/reactivate/', views.reactivate_driving_school_view, name='admin_reactivate_driving_school'),

    # Gestion des utilisateurs
    path('users/', views.UserAdminListView.as_view(), name='admin_users'),
    path('users/<int:pk>/', views.UserAdminDetailView.as_view(), name='admin_user_detail'),
    path('users/<int:pk>/activate/', views.activate_user_view, name='admin_activate_user'),
    path('users/<int:pk>/deactivate/', views.deactivate_user_view, name='admin_deactivate_user'),
    path('users/<int:pk>/reset-password/', views.reset_user_password_view, name='admin_reset_user_password'),

    # Gestion des formulaires de contact
    path('contact-forms/', views.ContactFormAdminListView.as_view(), name='admin_contact_forms'),
    path('contact-forms/<uuid:pk>/', views.ContactFormAdminDetailView.as_view(), name='admin_contact_form_detail'),

    # Endpoint public pour les formulaires de contact
    path('public/contact/', views.PublicContactFormView.as_view(), name='public_contact_form'),

    # Gestion des paiements/demandes de mise à niveau
    path('payments/', views.PaymentAdminListView.as_view(), name='admin_payments'),
    path('payments/<uuid:pk>/', views.PaymentAdminDetailView.as_view(), name='admin_payment_detail'),
    path('payments/<uuid:pk>/approve/', views.approve_payment_view, name='admin_approve_payment'),
    path('payments/<uuid:pk>/reject/', views.reject_payment_view, name='admin_reject_payment'),

    # Logs et monitoring
    path('logs/', views.AdminActionLogListView.as_view(), name='admin_logs'),

    # Paramètres système
    path('settings/', views.SystemSettingsListView.as_view(), name='admin_settings'),
    path('settings/<str:key>/', views.SystemSettingsDetailView.as_view(), name='admin_setting_detail'),

    # Annonces système
    path('announcements/', views.SystemAnnouncementListView.as_view(), name='admin_announcements'),
    path('announcements/<uuid:pk>/', views.SystemAnnouncementDetailView.as_view(), name='admin_announcement_detail'),

    # Notifications système
    path('notifications/send/', views.send_system_notification_view, name='admin_send_notification'),

    # Coupons
    path('coupons/', views.coupon_list_create_view, name='admin_coupons'),
    path('coupons/<int:pk>/', views.coupon_detail_view, name='admin_coupon_detail'),
    path('coupons/validate/', views.validate_coupon_admin, name='admin_validate_coupon'),

    # Notifications admin
    path('notifications/', views.admin_notifications_list_view, name='admin_notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read_view, name='admin_mark_notification_read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read_view, name='admin_mark_all_notifications_read'),
    path('notifications/<int:notification_id>/dismiss/', views.dismiss_notification_view, name='admin_dismiss_notification'),

    # Support public (pour les auto-écoles)
    path('support/submit/', views.submit_support_request, name='submit_support_request'),
    path('support/tickets/', views.get_support_tickets, name='get_support_tickets'),

    # Messagerie admin utilise directement les endpoints de messaging/
]
