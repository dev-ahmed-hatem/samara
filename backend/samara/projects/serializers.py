from rest_framework import serializers
from .models import Project, Location


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
