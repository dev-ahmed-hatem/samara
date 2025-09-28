from rest_framework import serializers
from .models import Project, Location


class ProjectSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='project-detail')

    class Meta:
        model = Project
        fields = '__all__'


class ProjectListSerializer(serializers.ModelSerializer):
    locations = serializers.SerializerMethodField()
    guards_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_locations(self, obj: Project):
        return [{"name": loc.name, "id": loc.id} for loc in obj.locations.all()]

    def get_guards_count(self, obj: Project):
        return [{"name": loc.name, "count": loc.guard_shifts.count()} for loc in obj.locations.all()]


class LocationSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(read_only=True, view_name='location-detail')
    project_name = serializers.StringRelatedField(source='project.name', read_only=True)
    display_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Location
        fields = '__all__'

    def get_display_name(self, obj):
        return f"{obj.project.name} - {obj.name}"
