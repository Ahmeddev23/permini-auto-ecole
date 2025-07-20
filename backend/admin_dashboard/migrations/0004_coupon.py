# Generated manually for Coupon model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('admin_dashboard', '0003_alter_adminactionlog_target_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Coupon',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Code unique du coupon (ex: REDUCTION20)', max_length=50, unique=True, verbose_name='Code du coupon')),
                ('name', models.CharField(help_text='Nom descriptif du coupon', max_length=200, verbose_name='Nom du coupon')),
                ('description', models.TextField(blank=True, help_text='Description détaillée du coupon', verbose_name='Description')),
                ('discount_percentage', models.DecimalField(decimal_places=2, help_text='Pourcentage de réduction (ex: 20.00 pour 20%)', max_digits=5, verbose_name='Pourcentage de réduction')),
                ('valid_from', models.DateTimeField(help_text='Date et heure de début de validité', verbose_name='Valide à partir de')),
                ('valid_until', models.DateTimeField(help_text='Date et heure de fin de validité', verbose_name="Valide jusqu'à")),
                ('max_uses', models.PositiveIntegerField(default=1, help_text="Nombre maximum de fois que le coupon peut être utilisé", verbose_name="Nombre maximum d'utilisations")),
                ('current_uses', models.PositiveIntegerField(default=0, help_text='Nombre de fois que le coupon a été utilisé', verbose_name='Utilisations actuelles')),
                ('status', models.CharField(choices=[('active', 'Actif'), ('inactive', 'Inactif'), ('expired', 'Expiré'), ('used_up', 'Épuisé')], default='active', max_length=20, verbose_name='Statut')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Date de modification')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_coupons', to=settings.AUTH_USER_MODEL, verbose_name='Créé par')),
            ],
            options={
                'verbose_name': 'Coupon',
                'verbose_name_plural': 'Coupons',
                'db_table': 'coupons',
                'ordering': ['-created_at'],
            },
        ),
    ]
