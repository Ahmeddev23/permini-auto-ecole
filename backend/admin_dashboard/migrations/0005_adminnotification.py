# Generated manually for AdminNotification model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_dashboard', '0004_coupon'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdminNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('driving_school_registration', 'Inscription auto-école'), ('payment_received', 'Paiement reçu'), ('upgrade_request', 'Demande de mise à niveau'), ('contact_form', 'Formulaire de contact'), ('system_alert', 'Alerte système')], max_length=50, verbose_name='Type de notification')),
                ('title', models.CharField(max_length=200, verbose_name='Titre')),
                ('message', models.TextField(verbose_name='Message')),
                ('priority', models.CharField(choices=[('low', 'Faible'), ('medium', 'Moyen'), ('high', 'Élevé'), ('urgent', 'Urgent')], default='medium', max_length=20, verbose_name='Priorité')),
                ('related_driving_school_id', models.UUIDField(blank=True, null=True, verbose_name='Auto-école liée')),
                ('related_payment_id', models.UUIDField(blank=True, null=True, verbose_name='Paiement lié')),
                ('related_user_id', models.IntegerField(blank=True, null=True, verbose_name='Utilisateur lié')),
                ('is_read', models.BooleanField(default=False, verbose_name='Lu')),
                ('is_dismissed', models.BooleanField(default=False, verbose_name='Ignoré')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('read_at', models.DateTimeField(blank=True, null=True, verbose_name='Date de lecture')),
            ],
            options={
                'verbose_name': 'Notification admin',
                'verbose_name_plural': 'Notifications admin',
                'db_table': 'admin_notifications',
                'ordering': ['-created_at'],
            },
        ),
    ]
