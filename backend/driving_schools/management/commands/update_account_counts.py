from django.core.management.base import BaseCommand
from driving_schools.models import DrivingSchool


class Command(BaseCommand):
    help = 'Met à jour le compteur de comptes pour toutes les auto-écoles'

    def handle(self, *args, **options):
        driving_schools = DrivingSchool.objects.all()
        updated_count = 0
        
        for driving_school in driving_schools:
            old_count = driving_school.current_accounts
            new_count = driving_school.update_current_accounts()
            
            if old_count != new_count:
                self.stdout.write(
                    f"Auto-école '{driving_school.name}': {old_count} -> {new_count} comptes"
                )
                updated_count += 1
            else:
                self.stdout.write(
                    f"Auto-école '{driving_school.name}': {new_count} comptes (inchangé)"
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Mise à jour terminée. {updated_count} auto-écoles mises à jour.'
            )
        )
