# Generated manually to remove VehicleExpense model

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='VehicleExpense',
        ),
    ]
