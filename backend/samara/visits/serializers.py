from .models import Project, Location, Visit
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

    class Meta:
        model = Visit
        fields = '__all__'


class VisitWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = '__all__'
