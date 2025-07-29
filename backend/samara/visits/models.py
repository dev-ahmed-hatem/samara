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
        SCHEDULED = "مجدولة", _("مجدولة")
        COMPLETED = "مكتملة", _("مكتملة")

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

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("تاريخ استكمال التقرير"),
        help_text=_("تاريخ ووقت اكتمال تقرير الزيارة")
    )

    class Meta:
        verbose_name = _("زيارة")
        verbose_name_plural = _("الزيارات")
        unique_together = ("location", "employee", "date")

    def __str__(self):
        return f"{self.location} - {self.date}"


class VisitReport(models.Model):
    class EvaluationChoices(models.TextChoices):
        GOOD = "جيد", _("جيد")
        NEEDS_ATTENTION = "يحتاج إلى معالجة", _("يحتاج إلى معالجة")

    visit = models.OneToOneField(
        "Visit",
        on_delete=models.CASCADE,
        related_name="report",
        verbose_name=_("الزيارة")
    )

    guard_presence = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("تواجد الحارس في موقعه")
    )
    uniform_cleanliness = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("نظافة الزي الرسمي")
    )
    attendance_records = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("سجلات الحضور والانصراف والسجلات الخاصة بالموقع")
    )
    shift_handover = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("الانضباط في تسليم واستلام الورديات")
    )
    lighting = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("الإضاءة حول محيط الموقع")
    )
    cameras = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("كاميرات المراقبة")
    )
    security_vehicles = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("السيارات الأمنية")
    )
    radio_devices = models.CharField(
        max_length=20,
        choices=EvaluationChoices.choices,
        verbose_name=_("عمل أجهزة الاتصال اللاسلكي")
    )

    notes = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("توجيهات أو توصيات من العميل")
    )
    attachment = models.FileField(
        upload_to="visit_reports/",
        null=True,
        blank=True,
        verbose_name=_("مرفقات")
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))

    class Meta:
        verbose_name = _("تقرير الزيارة")
        verbose_name_plural = _("تقارير الزيارات")

    def __str__(self):
        return f"تقرير زيارة {self.visit}"

    def delete(self, using=None, keep_parents=False):
        if self.attachment:
            self.attachment.delete()

        super().delete(using, keep_parents=keep_parents)


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

    visit = models.OneToOneField(
        "Visit",
        on_delete=models.CASCADE,
        related_name="violation",
        verbose_name=_("الزيارة")
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

    confirmed_by_ops = models.BooleanField(
        default=False,
        verbose_name=_("التأكيد من مدير العمليات"),
    )

    confirmed_by_monitoring = models.BooleanField(
        default=False,
        verbose_name=_("التأكيد من قسم المتابعة والحفظ"),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("تاريخ الإنشاء"))

    class Meta:
        verbose_name = _("مخالفة")
        verbose_name_plural = _("المخالفات")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.violation_type} - {self.created_at.strftime('%Y-%m-%d')} - visit: {self.visit.id}"

    def delete(self, using=None, keep_parents=False):
        if self.violation_image:
            self.violation_image.delete()
        super().delete(using, keep_parents=keep_parents)
