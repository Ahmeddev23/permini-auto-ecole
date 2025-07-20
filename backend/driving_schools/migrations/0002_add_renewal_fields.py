# Generated manually for renewal fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('driving_schools', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='drivingschool',
            name='renewal_count',
            field=models.IntegerField(default=0, verbose_name='Nombre de renouvellements'),
        ),
        migrations.AddField(
            model_name='upgraderequest',
            name='is_renewal',
            field=models.BooleanField(default=False, verbose_name='Renouvellement'),
        ),
    ]
