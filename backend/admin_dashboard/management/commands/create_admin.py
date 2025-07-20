from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from admin_dashboard.models import AdminUser


class Command(BaseCommand):
    help = 'Créer un utilisateur administrateur'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Nom d\'utilisateur admin')
        parser.add_argument('--email', type=str, help='Email admin')
        parser.add_argument('--password', type=str, help='Mot de passe admin')
        parser.add_argument('--superadmin', action='store_true', help='Créer un super admin')

    def handle(self, *args, **options):
        username = options.get('username') or 'admin'
        email = options.get('email') or 'admin@permini.com'
        password = options.get('password') or 'admin123'
        is_superadmin = options.get('superadmin', False)

        # Vérifier si l'admin existe déjà
        if AdminUser.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'L\'administrateur {username} existe déjà')
            )
            return

        # Créer l'admin
        admin_user = AdminUser.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            first_name='Admin',
            last_name='Permini',
            is_superadmin=is_superadmin,
            can_manage_driving_schools=True,
            can_manage_users=True,
            can_view_logs=True,
            can_manage_system=is_superadmin,
            can_send_notifications=True
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Administrateur créé avec succès:\n'
                f'Username: {username}\n'
                f'Email: {email}\n'
                f'Password: {password}\n'
                f'Super Admin: {is_superadmin}'
            )
        )
