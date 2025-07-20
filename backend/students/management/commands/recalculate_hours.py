from django.core.management.base import BaseCommand
from django.db.models import Sum
from students.models import Student
from schedules.models import Schedule


class Command(BaseCommand):
    help = 'Recalcule les heures de formation de tous les candidats basé sur leurs séances terminées'

    def handle(self, *args, **options):
        students = Student.objects.all()
        updated_count = 0
        
        for student in students:
            # Calculer les heures de code terminées
            theory_schedules = Schedule.objects.filter(
                student=student,
                session_type='theory',
                status='completed'
            )
            
            theory_hours = 0
            for schedule in theory_schedules:
                duration_hours = round(schedule.duration_minutes / 60 * 2) / 2
                theory_hours += duration_hours
            
            # Calculer les heures de conduite terminées
            practical_schedules = Schedule.objects.filter(
                student=student,
                session_type='practical',
                status='completed'
            )
            
            practical_hours = 0
            for schedule in practical_schedules:
                duration_hours = round(schedule.duration_minutes / 60 * 2) / 2
                practical_hours += duration_hours
            
            # Mettre à jour le candidat
            old_theory = student.theory_hours_completed
            old_practical = student.practical_hours_completed
            
            student.theory_hours_completed = theory_hours
            student.practical_hours_completed = practical_hours
            student.save()
            
            if old_theory != theory_hours or old_practical != practical_hours:
                updated_count += 1
                self.stdout.write(
                    f"✅ {student.full_name}: Code {old_theory}h → {theory_hours}h, "
                    f"Conduite {old_practical}h → {practical_hours}h"
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Recalcul terminé ! {updated_count} candidat(s) mis à jour.'
            )
        )
