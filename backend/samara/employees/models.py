from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User
from projects.models import Location


class Employee(models.Model):
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("رقم الموظف"),
        error_messages={
            "unique": _("رقم الموظف مستخدم من قبل."),
            "blank": _("يرجى إدخال رقم الموظف."),
            "null": _("رقم الموظف لا يمكن أن يكون فارغًا."),
        },
    )
    name = models.CharField(
        max_length=100,
        verbose_name=_("الاسم الكامل"),
        error_messages={
            "blank": _("يرجى إدخال الاسم الكامل."),
            "null": _("الاسم الكامل لا يمكن أن يكون فارغًا."),
        },
    )
    phone = models.CharField(
        max_length=15,
        verbose_name=_("رقم الجوال"),
        error_messages={
            "blank": _("يرجى إدخال رقم الجوال."),
            "null": _("رقم الجوال لا يمكن أن يكون فارغًا."),
        },
    )
    national_id = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_("رقم الهوية"),
        error_messages={
            "unique": _("رقم الهوية مستخدم من قبل."),
            "blank": _("يرجى إدخال رقم الهوية."),
            "null": _("رقم الهوية لا يمكن أن يكون فارغًا."),
        },
    )
    email = models.EmailField(
        verbose_name=_("البريد الإلكتروني"),
        blank=True,
        null=True,
        error_messages={
            "invalid": _("يرجى إدخال بريد إلكتروني صالح."),
        },
    )
    position = models.CharField(
        max_length=100,
        verbose_name=_("المسمى الوظيفي"),
        blank=True,
        null=True,
    )

    birthdate = models.DateField(
        verbose_name=_("تاريخ الميلاد"),
        blank=True,
        null=True,
    )
    date_joined = models.DateField(
        auto_now_add=True,
        verbose_name=_("تاريخ الانضمام"),
    )

    image = models.ImageField(_("الصورة"), upload_to="employees/photos/", blank=True, null=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_("أُضيف بواسطة"))

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name=_("الحساب المرتبط"),
        related_name="employee_profile"
    )

    class Meta:
        verbose_name = _("موظف")
        verbose_name_plural = _("الموظفون")

    def __str__(self):
        return f"{self.name} ({self.employee_id})"

    def delete(self, using=None, keep_parents=False):
        if self.image:
            self.image.delete()
        return super().delete(using, keep_parents)


class Shift(models.Model):
    class ShiftChoices(models.TextChoices):
        FIRST = "الوردية الأولى", _("الوردية الأولى")
        SECOND = "الوردية الثانية", _("الوردية الثانية")
        THIRD = "الوردية الثالثة", _("الوردية الثالثة")

    name = models.CharField(max_length=20, choices=ShiftChoices.choices, unique=True)

    def __str__(self):
        return self.get_name_display()


class SecurityGuard(models.Model):
    name = models.CharField(max_length=100, verbose_name=_("الاسم"))
    employee_id = models.IntegerField(
        unique=True,
        verbose_name=_("الرقم الوظيفي")
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.employee_id} - {self.name}"

    class Meta:
        verbose_name = _("حارس أمن")
        verbose_name_plural = _("حراس الأمن")


class SecurityGuardLocationShift(models.Model):
    guard = models.ForeignKey(
        "SecurityGuard", on_delete=models.CASCADE, related_name="location_shifts"
    )
    location = models.ForeignKey(
        "projects.Location", on_delete=models.CASCADE, related_name="guard_shifts"
    )
    shift = models.ForeignKey(
        "Shift", on_delete=models.CASCADE, related_name="guard_locations"
    )

    class Meta:
        verbose_name = _("وردية في موقع")
        verbose_name_plural = _("ورديات المواقع")
        unique_together = ["guard", "location", "shift"]

    def __str__(self):
        return f"{self.guard.name} - {self.location.name} - {self.shift.name}"
