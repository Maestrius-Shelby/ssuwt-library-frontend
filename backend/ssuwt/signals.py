from .models import ScientificMaterials
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.core.files.storage import default_storage
from django.db.models.signals import post_save #Import a post_save signal when a user is created
from django.contrib.auth.models import User # Import the built-in User model, which is a sender
from .models import Human


@receiver(post_delete, sender=ScientificMaterials)
def delete_media_file(sender, instance, **kwargs):
    # Удалите файл, если он существует
    if instance.attached_file and default_storage.exists(instance.attached_file.path):
        default_storage.delete(instance.attached_file.path)
