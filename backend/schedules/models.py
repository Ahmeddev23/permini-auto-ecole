from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.utils import timezone


class Schedule(models.Model):
    """
    Modèle pour l'emploi du temps
    """
    DAYS_OF_WEEK = (
        (0, _('Lundi')),
        (1, _('Mardi')),
        (2, _('Mercredi')),
        (3, _('Jeudi')),
        (4, _('Vendredi')),
        (5, _('Samedi')),
        (6, _('Dimanche')),
    )

    SESSION_TYPES = (
        ('theory', _('Code')),
        ('practical', _('Conduite')),
        ('exam_theory', _('Examen Code')),
        ('exam_practical_circuit', _('Examen Circuit')),
        ('exam_practical_park', _('Examen Parking')),
    )

    SESSION_STATUS = (
        ('scheduled', _('Programmé')),
        ('completed', _('Terminé')),
        ('cancelled', _('Annulé')),
        ('no_show', _('Absent')),
    )

    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name=_('Auto-école')
    )

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name=_('Candidat')
    )

    instructor = models.ForeignKey(
        'instructors.Instructor',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='schedules',
        verbose_name=_('Moniteur')
    )

    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='schedules',
        verbose_name=_('Véhicule')
    )

    # Informations de la séance
    session_type = models.CharField(
        max_length=25,
        choices=SESSION_TYPES,
        verbose_name=_('Type de séance')
    )

    date = models.DateField(
        verbose_name=_('Date')
    )

    start_time = models.TimeField(
        verbose_name=_('Heure de début')
    )

    end_time = models.TimeField(
        verbose_name=_('Heure de fin')
    )

    # Statut et notes
    status = models.CharField(
        max_length=20,
        choices=SESSION_STATUS,
        default='scheduled',
        verbose_name=_('Statut')
    )

    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes')
    )

    cancellation_reason = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Raison d\'annulation')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )

    class Meta:
        verbose_name = _('Séance')
        verbose_name_plural = _('Séances')
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.student} - {self.get_session_type_display()} - {self.date} {self.start_time}"

    def clean(self):
        """Validation personnalisée"""
        # Vérifier que l'heure de fin est après l'heure de début
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError(_('L\'heure de fin doit être après l\'heure de début'))

        # Pour les cours de conduite, un moniteur et un véhicule sont requis
        if self.session_type == 'practical' and not self.instructor:
            raise ValidationError(_('Un moniteur est requis pour les cours de conduite'))

        if self.session_type == 'practical' and not self.vehicle:
            raise ValidationError(_('Un véhicule est requis pour les cours de conduite'))

        # Vérifier que le moniteur est disponible à cette heure
        if self.instructor:
            conflicting_schedules = Schedule.objects.filter(
                instructor=self.instructor,
                date=self.date,
                start_time__lt=self.end_time,
                end_time__gt=self.start_time,
                status='scheduled'
            ).exclude(pk=self.pk)

            if conflicting_schedules.exists():
                raise ValidationError(_('Le moniteur n\'est pas disponible à cette heure'))

    @property
    def duration_minutes(self):
        """Retourne la durée de la séance en minutes"""
        if self.start_time and self.end_time:
            start_datetime = timezone.datetime.combine(timezone.now().date(), self.start_time)
            end_datetime = timezone.datetime.combine(timezone.now().date(), self.end_time)
            return int((end_datetime - start_datetime).total_seconds() / 60)
        return 0
