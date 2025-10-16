from django.db import models
from django.utils.translation import gettext_lazy as _
from employees.models import Employee
from datetime import datetime, time, timedelta
from django.db.models import Q, QuerySet


class Visit(models.Model):
    class VisitStatus(models.TextChoices):
        SCHEDULED = "مجدولة", _("مجدولة")
        COMPLETED = "مكتملة", _("مكتملة")

    location = models.ForeignKey(
        "projects.Location",
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

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("تاريخ استكمال التقرير"),
        help_text=_("تاريخ ووقت اكتمال تقرير الزيارة")
    )

    class Meta:
        verbose_name = _("زيارة")
        verbose_name_plural = _("الزيارات")

        # ### manual uniqueness check; because period logix may shift the visits date
        # unique_together = ("location", "employee", "date", "time")

        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.location} - {self.date}"


class VisitReport(models.Model):
    class EvaluationChoices(models.TextChoices):
        GOOD = "جيد", _("جيد")
        NEEDS_ATTENTION = "يحتاج إلى معالجة", _("يحتاج إلى معالجة")
        NOT_AVAILABLE = "غير متوفر", _("غير متوفر")

    visit = models.OneToOneField(
        "Visit",
        on_delete=models.CASCADE,
        related_name="report",
        verbose_name=_("الزيارة")
    )

    # Evaluation fields with optional note + attachment
    guard_presence = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("تواجد الحارس في موقعه")
    )
    guard_presence_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة تواجد الحارس")
    )
    guard_presence_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق تواجد الحارس")
    )

    uniform_cleanliness = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("نظافة الزي الرسمي")
    )
    uniform_cleanliness_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة نظافة الزي")
    )
    uniform_cleanliness_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق نظافة الزي")
    )

    attendance_records = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("سجلات الحضور والانصراف والسجلات الخاصة بالموقع")
    )
    attendance_records_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة السجلات")
    )
    attendance_records_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق السجلات")
    )

    shift_handover = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("الانضباط في تسليم واستلام الورديات")
    )
    shift_handover_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة الورديات")
    )
    shift_handover_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق الورديات")
    )

    lighting = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("الإضاءة حول محيط الموقع")
    )
    lighting_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة الإضاءة")
    )
    lighting_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق الإضاءة")
    )

    cameras = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("كاميرات المراقبة")
    )
    cameras_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة الكاميرات")
    )
    cameras_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق الكاميرات")
    )

    security_vehicles = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("السيارات الأمنية")
    )
    security_vehicles_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة السيارات الأمنية")
    )
    security_vehicles_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق السيارات الأمنية")
    )

    radio_devices = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("عمل أجهزة الاتصال اللاسلكي")
    )
    radio_devices_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة الأجهزة اللاسلكية")
    )
    radio_devices_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق الأجهزة اللاسلكية")
    )
    other = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("أخرى")
    )
    other_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظة أخرى")
    )
    other_attachment = models.FileField(
        upload_to="visit_reports/",
        null=True, blank=True,
        verbose_name=_("مرفق أخرى")
    )

    # Global notes
    client_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("توجيهات أو توصيات من العميل")
    )

    # Location fields
    latitude = models.FloatField(
        null=True, blank=True,
        verbose_name=_("إحداثيات خط العرض للمشرف")
    )
    longitude = models.FloatField(
        null=True, blank=True,
        verbose_name=_("إحداثيات خط الطول للمشرف")
    )
    location_accuracy = models.FloatField(
        null=True, blank=True,
        verbose_name=_("دقة تحديد الموقع (بالمتر)")
    )

    supervisor_notes = models.TextField(
        null=True, blank=True,
        verbose_name=_("ملاحظات المشرف")
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("تاريخ الإنشاء")
    )

    class Meta:
        verbose_name = _("تقرير الزيارة")
        verbose_name_plural = _("تقارير الزيارات")

    def __str__(self):
        return f"تقرير زيارة {self.visit}"

    def delete(self, using=None, keep_parents=False):
        """Delete attachments as well."""
        for field in self._meta.fields:
            if isinstance(field, models.FileField):
                file = getattr(self, field.name)
                if file:
                    file.delete(save=False)
        super().delete(using=using, keep_parents=keep_parents)


class Violation(models.Model):
    class ViolationType(models.TextChoices):
        LATE = "تأخير عن الدوام", _("تأخير عن الدوام")
        SMOKING = "التدخين بالموقع أثناء العمل", _("التدخين بالموقع أثناء العمل")
        UNIFORM = "عدم الالتزام بالزي الرسمي", _("عدم الالتزام بالزي الرسمي")
        ABSENT = "غياب", _("غياب")
        LEFT_SITE = "ترك الموقع (انسحاب)", _("ترك الموقع (انسحاب)")
        GATHERING = "التجمع في منطقة العمل", _("التجمع في منطقة العمل")
        CLIENT_COMPLAINT = "الشكوى من العميل", _("الشكوى من العميل")
        DISRESPECT = "عدم احترام الرئيس المباشر", _("عدم احترام الرئيس المباشر")
        PHONE_USE = "استخدام الجوال أثناء العمل", _("استخدام الجوال أثناء العمل")
        OTHER = "أخرى", _("أخرى")

    class SeverityLevel(models.TextChoices):
        LOW = "منخفضة", _("منخفضة")
        MEDIUM = "متوسطة", _("متوسطة")
        HIGH = "عالية", _("عالية")

    location = models.ForeignKey(
        "projects.Location",
        on_delete=models.CASCADE,
        related_name="violation",
        verbose_name=_("الموقع")
    )

    security_guard = models.ForeignKey(
        "employees.SecurityGuard",
        on_delete=models.CASCADE,
        related_name="violation",
        verbose_name=_("الموظف المخالف")
    )

    violation_type = models.CharField(
        max_length=50,
        choices=ViolationType.choices,
        verbose_name=_("نوع المخالفة"),
    )

    severity = models.CharField(
        max_length=10,
        choices=SeverityLevel.choices,
        verbose_name=_("درجة الخطورة"),
    )

    details = models.TextField(
        verbose_name=_("وصف تفصيلي للمخالفة"),
        help_text=_("يرجى كتابة تفاصيل المخالفة"),
    )

    supervisor_explanation = models.TextField(
        blank=True,
        verbose_name=_("شرح البيان من المشرف"),
    )

    violation_image = models.ImageField(
        upload_to="violations/",
        blank=True,
        null=True,
        verbose_name=_("تصوير فوري للمخالفة"),
    )

    action = models.TextField(
        blank=True,
        verbose_name=_("الإجراء"),
    )

    guidance = models.TextField(
        blank=True,
        verbose_name=_("التوجيه"),
    )

    penalty = models.TextField(
        blank=True,
        verbose_name=_("الجزاء المطبق للائحة"),
    )

    confirmed_by_monitoring = models.BooleanField(
        default=False,
        verbose_name=_("التأكيد من قسم المتابعة والحفظ"),
    )

    date = models.DateField(verbose_name=_("تاريخ المخالفة"), blank=True, null=True)

    time = models.TimeField(
        verbose_name=_("وقت المخالفة"),
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("اخر تعديل"))

    created_by = models.ForeignKey(Employee, on_delete=models.CASCADE)

    class Meta:
        verbose_name = _("مخالفة")
        verbose_name_plural = _("المخالفات")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.violation_type} - {self.created_at.strftime('%Y-%m-%d')} - location: {self.location.id}"

    def delete(self, using=None, keep_parents=False):
        if self.violation_image:
            self.violation_image.delete()
        super().delete(using, keep_parents=keep_parents)


def filter_visits_by_period(queryset, day: datetime.date, period: str) -> QuerySet[Visit]:
    """
    Filters visits for a given day and period (morning or evening).

    Morning: 09:00 (day) → 20:59 (day)
    Evening: 21:00 (day) → 08:59 (next day)
    """
    if period == "morning":
        start_time = time(9, 0)  # 09:00 AM
        end_time = time(20, 59)  # 08:59 PM
        return queryset.filter(
            date=day,
            time__range=(start_time, end_time),
        )

    elif period == "evening":
        start_time = time(21, 0)  # 09:00 PM (same day)
        end_time = time(8, 59)  # 08:59 AM (next day)

        next_day = day + timedelta(days=1)

        return queryset.filter(
            Q(date=day, time__gte=start_time) | Q(date=next_day, time__lte=end_time)
        )

    return queryset.none()
