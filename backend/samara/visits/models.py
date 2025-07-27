from django.db import models
from django.utils.translation import gettext_lazy as _
from employees.models import Employee


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


class Visit(models.Model):
    class VisitStatus(models.TextChoices):
        SCHEDULED = "scheduled", _("مجدولة")
        COMPLETED = "completed", _("مكتملة")

    location = models.ForeignKey(
        "Location",
        on_delete=models.CASCADE,
        related_name="visits",
        verbose_name=_("الموقع"),
    )
    date = models.DateField(verbose_name=_("تاريخ الزيارة"))
    time = models.TimeField(verbose_name=_("وقت الزيارة"))
    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visits",
        verbose_name=_("الموظف المسؤول"),
    )
    # gps_coordinates = gis_models.PointField(
    #     geography=True,
    #     verbose_name=_("إحداثيات GPS"),
    #     help_text=_("تحديد الموقع الجغرافي باستخدام إحداثيات GPS"),
    # )
    purpose = models.TextField(
        verbose_name=_("الهدف من الزيارة"),
        help_text=_("صف الهدف من الزيارة"),
    )
    status = models.CharField(
        max_length=20,
        choices=VisitStatus.choices,
        default=VisitStatus.SCHEDULED,
        verbose_name=_("حالة الزيارة"),
    )

    class Meta:
        verbose_name = _("زيارة")
        verbose_name_plural = _("الزيارات")
        unique_together = ("location", "employee", "date")

    def __str__(self):
        return f"{self.location} - {self.date}"
