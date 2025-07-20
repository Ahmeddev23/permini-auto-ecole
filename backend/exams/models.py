from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Exam(models.Model):
    """
    Modèle pour les examens
    """
    EXAM_TYPES = (
        ('theory', _('Code de la route')),
        ('practical_circuit', _('Circuit')),
        ('practical_park', _('Parking')),
    )

    EXAM_RESULTS = (
        ('pending', _('En attente')),
        ('passed', _('Réussi')),
        ('failed', _('Échoué')),
        ('absent', _('Absent')),
    )

    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='exams',
        verbose_name=_('Auto-école')
    )

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='exams',
        verbose_name=_('Candidat')
    )

    instructor = models.ForeignKey(
        'instructors.Instructor',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='supervised_exams',
        verbose_name=_('Moniteur superviseur')
    )

    # Informations de l'examen
    exam_type = models.CharField(
        max_length=20,
        choices=EXAM_TYPES,
        verbose_name=_('Type d\'examen')
    )

    exam_date = models.DateTimeField(
        verbose_name=_('Date et heure d\'examen')
    )

    exam_location = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('Lieu d\'examen')
    )

    # Résultats
    result = models.CharField(
        max_length=20,
        choices=EXAM_RESULTS,
        default='pending',
        verbose_name=_('Résultat')
    )

    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('Score')
    )

    max_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('Score maximum')
    )

    # Notes et commentaires
    examiner_notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes de l\'examinateur')
    )

    student_feedback = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Commentaires du candidat')
    )

    # Informations administratives
    registration_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_('Numéro d\'inscription')
    )

    exam_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('Frais d\'examen')
    )

    is_paid = models.BooleanField(
        default=False,
        verbose_name=_('Payé')
    )

    # Tentative
    attempt_number = models.IntegerField(
        default=1,
        verbose_name=_('Numéro de tentative')
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
        verbose_name = _('Examen')
        verbose_name_plural = _('Examens')
        ordering = ['-exam_date']

    def __str__(self):
        return f"{self.student} - {self.get_exam_type_display()} - {self.exam_date.strftime('%d/%m/%Y')}"

    @property
    def is_passed(self):
        """Vérifie si l'examen est réussi"""
        return self.result == 'passed'

    @property
    def percentage_score(self):
        """Calcule le pourcentage du score"""
        if self.score and self.max_score and self.max_score > 0:
            return (self.score / self.max_score) * 100
        return None

    def save(self, *args, **kwargs):
        # Mettre à jour le compteur de tentatives du student
        if self.pk is None:  # Nouvel examen
            if self.exam_type == 'theory':
                self.student.theory_exam_attempts += 1
            else:
                self.student.practical_exam_attempts += 1
            self.student.save()

        super().save(*args, **kwargs)


class ExamSession(models.Model):
    """
    Modèle pour les sessions d'examens (groupées)
    """
    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='exam_sessions',
        verbose_name=_('Auto-école')
    )

    # Informations de la session
    session_name = models.CharField(
        max_length=200,
        verbose_name=_('Nom de la session')
    )

    exam_type = models.CharField(
        max_length=20,
        choices=Exam.EXAM_TYPES,
        verbose_name=_('Type d\'examen')
    )

    session_date = models.DateTimeField(
        verbose_name=_('Date de la session')
    )

    location = models.CharField(
        max_length=200,
        verbose_name=_('Lieu')
    )

    max_candidates = models.IntegerField(
        default=20,
        verbose_name=_('Nombre maximum de candidats')
    )

    registration_deadline = models.DateTimeField(
        verbose_name=_('Date limite d\'inscription')
    )

    # Statut
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    class Meta:
        verbose_name = _('Session d\'examen')
        verbose_name_plural = _('Sessions d\'examens')
        ordering = ['-session_date']

    def __str__(self):
        return f"{self.session_name} - {self.session_date.strftime('%d/%m/%Y')}"

    @property
    def registered_candidates_count(self):
        """Nombre de candidats inscrits"""
        return self.exams.count()

    @property
    def available_spots(self):
        """Places disponibles"""
        return self.max_candidates - self.registered_candidates_count
