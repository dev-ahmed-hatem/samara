from django.conf import settings
from datetime import datetime, timedelta, time

from employees.models import SecurityGuardLocationShift, Employee
from users.models import User
from .models import Visit, VisitReport, Violation
from rest_framework import serializers


class VisitReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='visit-detail')
    location = serializers.SerializerMethodField(read_only=True)
    date = serializers.DateField(format='%Y-%m-%d', read_only=True)
    time = serializers.TimeField(format='%I:%M %p', read_only=True)
    status = serializers.StringRelatedField(source='get_status_display', read_only=True)
    completed_at = serializers.SerializerMethodField(read_only=True)
    report_id = serializers.PrimaryKeyRelatedField(read_only=True, source='report')
    violation = serializers.SerializerMethodField()
    opened = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Visit
        fields = '__all__'

    def get_completed_at(self, obj):
        if obj.completed_at:
            return obj.completed_at.astimezone(settings.SAUDI_TZ).strftime('%d/%m/%Y %I:%M %p')
        return None

    def get_violation(self, obj: Visit):
        if hasattr(obj, "violation"):
            return obj.violation.created_at.astimezone(settings.SAUDI_TZ).strftime('%d/%m/%Y %I:%M %p')
        return None

    def get_opened(self, obj: Visit):
        today = datetime.today().astimezone(settings.SAUDI_TZ).date()
        yesterday = today - timedelta(days=1)
        late_evening = time(21, 0)

        is_today = obj.date == today
        is_last_night = obj.date == yesterday and obj.time and obj.time >= late_evening
        is_scheduled = obj.status == Visit.VisitStatus.SCHEDULED

        return (is_today or is_last_night) and is_scheduled

    def get_location(self, obj: Visit):
        return {"name": obj.location.name, "project_name": obj.location.project.name,
                "guards_count": SecurityGuardLocationShift.objects.filter(location=obj.location).count(),
                "supervisors_count": Employee.objects.filter(user__role=User.RoleChoices.SUPERVISOR).count()}


class VisitWriteSerializer(serializers.ModelSerializer):
    period = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Visit
        fields = '__all__'

    def create(self, validated_data):
        period = validated_data.pop("period")
        visit_time = validated_data.get("time")
        visit_date = validated_data.get("date")

        if period == "evening" and visit_time and visit_date and visit_time < time(9, 0):
            validated_data["date"] = visit_date + timedelta(days=1)

        exists = Visit.objects.filter(employee=validated_data["employee"],
                                      location=validated_data["location"],
                                      date=validated_data["date"],
                                      time=validated_data["time"]
                                      ).exists()

        if exists:
            raise serializers.ValidationError(
                {"non_field_errors": ["الزيارة بالتاريخ والوقت والموقع موجودة بالفعل"]}
            )

        return super().create(validated_data)


class VisitReportReadSerializer(serializers.ModelSerializer):
    visit = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField(read_only=True)
    has_location = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = VisitReport
        fields = '__all__'

    def get_visit(self, obj: VisitReport):
        return {"id": obj.visit.id, "location_name": obj.visit.location.name,
                "project_name": obj.visit.location.project.name, "employee": obj.visit.employee.name, }

    def get_created_at(self, obj: VisitReport):
        return obj.created_at.astimezone(settings.SAUDI_TZ).strftime('%d-%m-%Y %I:%M %p')

    def get_has_location(self, obj: VisitReport):
        return obj.longitude is not None and obj.latitude is not None


class VisitReportWriteSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='visit-report-detail')

    class Meta:
        model = VisitReport
        fields = '__all__'

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.visit.status = Visit.VisitStatus.COMPLETED
        instance.visit.completed_at = datetime.now().astimezone(settings.SAUDI_TZ)
        instance.visit.save()
        return instance


class ViolationReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='violation-detail')
    project_name = serializers.StringRelatedField(source='location.project.name', read_only=True)
    location_name = serializers.StringRelatedField(source='location.name', read_only=True)
    created_at = serializers.SerializerMethodField(read_only=True)
    security_guard = serializers.StringRelatedField(source='security_guard.name', read_only=True)
    created_by = serializers.StringRelatedField(source='created_by.name', read_only=True)
    updated_at = serializers.SerializerMethodField(read_only=True)
    time = serializers.TimeField(read_only=True, format='%I:%M %p')

    class Meta:
        model = Violation
        fields = '__all__'
        read_only_fields = ("created_by",)

    def get_created_at(self, obj):
        return obj.created_at.astimezone(settings.SAUDI_TZ).strftime('%Y-%m-%d %I:%M %p')

    def get_updated_at(self, obj):
        return obj.updated_at.astimezone(settings.SAUDI_TZ).strftime('%Y-%m-%d %I:%M %p')


class ViolationWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Violation
        fields = '__all__'
        read_only_fields = ("created_by",)

    def create(self, validated_data):
        request = self.context.get('request')
        employee = request.user.employee_profile
        return super().create({**validated_data, "created_by": employee})
