from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Shift


@receiver(post_migrate)
def create_default_shifts(sender, **kwargs):
    if sender.name == "attendance":
        Shift.objects.get_or_create(name="الوردية الأولى")
        Shift.objects.get_or_create(name="الوردية الثانية")
        Shift.objects.get_or_create(name="الوردية الثالثة")
