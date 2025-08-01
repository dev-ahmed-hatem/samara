from django.db import models
from django.utils.translation import gettext_lazy as _


class Project(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_("اسم المشروع"),
        help_text=_("أدخل اسم المشروع"),
    )

    class Meta:
        verbose_name = _("مشروع")
        verbose_name_plural = _("المشاريع")

    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_("اسم الموقع"),
        help_text=_("أدخل اسم الموقع"),
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="locations",
        verbose_name=_("المشروع"),
    )

    class Meta:
        verbose_name = _("موقع")
        verbose_name_plural = _("المواقع")

    def __str__(self):
        return f"{self.name} ({self.project.name})"
