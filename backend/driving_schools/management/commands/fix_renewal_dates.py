from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from driving_schools.models import DrivingSchool

class Command(BaseCommand):
    help = 'Corriger les dates d\'expiration incorrectes dues au bug de renouvellement'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Recherche des auto-écoles avec des dates d'expiration suspectes...")
        
        # Chercher les auto-écoles avec plus de 100 jours restants (suspect)
        today = timezone.now().date()
        suspicious_schools = []
        
        for school in DrivingSchool.objects.all():
            if school.plan_end_date:
                days_remaining = (school.plan_end_date.date() - today).days
                if days_remaining > 100:  # Plus de 100 jours = suspect
                    suspicious_schools.append({
                        'school': school,
                        'days_remaining': days_remaining,
                        'end_date': school.plan_end_date
                    })
        
        if not suspicious_schools:
            self.stdout.write(self.style.SUCCESS("✅ Aucune date suspecte trouvée"))
            return
        
        self.stdout.write(f"⚠️  Trouvé {len(suspicious_schools)} auto-école(s) avec des dates suspectes:")
        
        for item in suspicious_schools:
            school = item['school']
            days_remaining = item['days_remaining']
            self.stdout.write(f"  - {school.name}: {days_remaining} jours restants (expire le {school.plan_end_date.date()})")
        
        # Corriger automatiquement
        for item in suspicious_schools:
            school = item['school']
            days_remaining = item['days_remaining']
            
            # Calculer la date correcte
            if days_remaining > 300:  # Très suspect, probablement 365 au lieu de 35
                correct_days = days_remaining - 330  # Enlever ~330 jours
                correct_end_date = today + timedelta(days=correct_days)
            else:
                # Pour d'autres cas, supposer 30 jours à partir d'aujourd'hui
                correct_end_date = today + timedelta(days=30)
            
            old_date = school.plan_end_date
            school.plan_end_date = correct_end_date
            school.save()
            
            self.stdout.write(self.style.SUCCESS(f"✅ {school.name}: {old_date.date()} → {correct_end_date}"))
        
        self.stdout.write(self.style.SUCCESS(f"\n🎉 Correction terminée pour {len(suspicious_schools)} auto-école(s)"))
