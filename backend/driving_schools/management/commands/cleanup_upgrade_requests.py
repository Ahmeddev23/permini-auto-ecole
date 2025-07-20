from django.core.management.base import BaseCommand
from django.utils import timezone
from driving_schools.models import DrivingSchool, UpgradeRequest


class Command(BaseCommand):
    help = 'Nettoie les demandes de mise à niveau obsolètes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Affiche ce qui serait fait sans effectuer les changements',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('Mode DRY RUN - Aucun changement ne sera effectué'))
        
        # Trouver les demandes en attente qui ne correspondent plus au plan actuel
        obsolete_requests = []
        
        for driving_school in DrivingSchool.objects.all():
            pending_requests = driving_school.upgrade_requests.filter(status='pending')
            
            for request in pending_requests:
                # Si la demande est pour un plan que l'auto-école a déjà
                if request.requested_plan == driving_school.current_plan:
                    obsolete_requests.append(request)
                    continue
                
                # Si c'est un renouvellement mais le plan a changé
                if request.is_renewal and request.current_plan != driving_school.current_plan:
                    obsolete_requests.append(request)
                    continue
                
                # Si c'est une mise à niveau vers un plan inférieur au plan actuel
                plan_hierarchy = {'free': 0, 'standard': 1, 'premium': 2}
                current_level = plan_hierarchy.get(driving_school.current_plan, 0)
                requested_level = plan_hierarchy.get(request.requested_plan, 0)
                
                if requested_level <= current_level and not request.is_renewal:
                    obsolete_requests.append(request)
        
        if not obsolete_requests:
            self.stdout.write(self.style.SUCCESS('Aucune demande obsolète trouvée.'))
            return
        
        self.stdout.write(f'Trouvé {len(obsolete_requests)} demande(s) obsolète(s):')
        
        for request in obsolete_requests:
            message = f'- {request.driving_school.name}: {request.current_plan} → {request.requested_plan}'
            if request.is_renewal:
                message += ' (renouvellement)'
            self.stdout.write(f'  {message}')
        
        if not dry_run:
            # Annuler les demandes obsolètes
            for request in obsolete_requests:
                request.status = 'cancelled'
                request.admin_notes = 'Annulé automatiquement - Demande devenue obsolète (plan déjà atteint ou changé)'
                request.processed_at = timezone.now()
                request.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Annulé {len(obsolete_requests)} demande(s) obsolète(s).')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Utilisez sans --dry-run pour effectuer les changements.')
            )
