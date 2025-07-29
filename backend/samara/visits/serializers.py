from django.conf import settings
from datetime import datetime

from .models import Project, Location, Visit, VisitReport, Violation
from rest_framework import serializers


class ProjectSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='project-detail')

    class Meta:
        model = Project
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(read_only=True, view_name='location-detail')
    project_name = serializers.StringRelatedField(source='project.name', read_only=True)

    class Meta:
        model = Location
        fields = '__all__'


class VisitReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='visit-detail')
    location = LocationSerializer()
    date = serializers.DateField(format='%d/%m/%Y', read_only=True)
    time = serializers.TimeField(format='%I:%M %p', read_only=True)
    status = serializers.StringRelatedField(source='get_status_display', read_only=True)
    completed_at = serializers.SerializerMethodField(read_only=True)
    violation = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = '__all__'

    def get_completed_at(self, obj):
        return obj.completed_at.astimezone(settings.CAIRO_TZ).strftime('%d/%m/%Y %I:%M %p')

    def get_violation(self, obj: Visit):
        if hasattr(obj, "violation"):
            return obj.violation.created_at.astimezone(settings.CAIRO_TZ).strftime('%d/%m/%Y %I:%M %p')
        return None


class VisitWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = '__all__'


class VisitReportSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='visit-report-detail')

    class Meta:
        model = VisitReport
        fields = '__all__'

    def create(self, validated_data):
        instance = super().create(validated_data)
        instance.visit.status = Visit.VisitStatus.COMPLETED
        instance.visit.completed_at = datetime.now().astimezone(settings.CAIRO_TZ)
        instance.visit.save()
        return instance


class ViolationSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='violation-detail')

    class Meta:
        model = Violation
        fields = '__all__'
