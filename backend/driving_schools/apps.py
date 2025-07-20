from django.apps import AppConfig


class DrivingSchoolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'driving_schools'

    def ready(self):
        import driving_schools.signals
