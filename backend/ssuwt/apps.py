from django.apps import AppConfig


class SsuwtConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ssuwt'
    verbose_name = 'Научная библиотека СГУВТ'

    def ready(self):
        import ssuwt.signals

class BaseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "base"

    def ready(self):
        from .signals import create_profile, save_profile        