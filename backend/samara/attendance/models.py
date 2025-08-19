from django.db import models
from django.utils.translation import gettext_lazy as _

from employees.models import Shift, SecurityGuard, Employee
from projects.models import Location


class ShiftAttendance(models.Model):
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name="shifts",
        verbose_name=_("الموقع"),
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name="attendances",
        verbose_name=_("الوردية"),
    )
    date = models.DateField(verbose_name=_("تاريخ الوردية"))
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("location", "shift", "date")
        verbose_name = _("حضور وردية")
        verbose_name_plural = _("حضور الورديات")

    def __str__(self):
        return f"{self.location.name} - {self.shift.get_name_display()} - {self.date.strftime('%d/%m/%Y')}"

    @property
    def security_guards(self):
        return SecurityGuardAttendance.objects.filter(shift=self,)


class SecurityGuardAttendance(models.Model):
    class AttendanceStatus(models.TextChoices):
        PRESENT = "حاضر", _("حاضر")
        LATE = "متأخر", _("متأخر")
        ABSENT = "غائب", _("غائب")

    security_guard = models.ForeignKey(
        SecurityGuard,
        on_delete=models.CASCADE,
        related_name="attendances",
        verbose_name=_("حارس الأمن"),
    )
    shift = models.ForeignKey(
        ShiftAttendance,
        on_delete=models.CASCADE,
        related_name="guards",
        verbose_name=_("الوردية"),
    )
    status = models.CharField(
        max_length=10,
        choices=AttendanceStatus.choices,
        verbose_name=_("الحالة"),
    )
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("ملاحظات"),
    )

    class Meta:
        verbose_name = _("تسجيل حضور")
        verbose_name_plural = _("تسجيلات الحضور")

    def __str__(self):
        return f"{self.security_guard.name} - {self.get_status_display()}"
