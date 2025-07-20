from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from students.models import Student
from instructors.models import Instructor


@receiver(post_save, sender=Student)
def update_accounts_on_student_create(sender, instance, created, **kwargs):
    """Met à jour le compteur de comptes quand un candidat est créé"""
    if created and instance.driving_school:
        instance.driving_school.update_current_accounts()


@receiver(post_delete, sender=Student)
def update_accounts_on_student_delete(sender, instance, **kwargs):
    """Met à jour le compteur de comptes quand un candidat est supprimé"""
    if instance.driving_school:
        instance.driving_school.update_current_accounts()


@receiver(post_save, sender=Instructor)
def update_accounts_on_instructor_create(sender, instance, created, **kwargs):
    """Met à jour le compteur de comptes quand un moniteur est créé"""
    if created and instance.driving_school:
        instance.driving_school.update_current_accounts()


@receiver(post_delete, sender=Instructor)
def update_accounts_on_instructor_delete(sender, instance, **kwargs):
    """Met à jour le compteur de comptes quand un moniteur est supprimé"""
    if instance.driving_school:
        instance.driving_school.update_current_accounts()
