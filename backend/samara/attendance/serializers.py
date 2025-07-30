from .models import ShiftAttendance, SecurityGuardAttendance
from rest_framework import serializers


class ShiftAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftAttendance
        fields = "__all__"


class SecurityGuardAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityGuardAttendance
        fields = "__all__"
