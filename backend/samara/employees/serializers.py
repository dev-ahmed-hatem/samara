from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator

from .models import Employee, SecurityGuard, SecurityGuardLocationShift, Shift


class EmployeeReadSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='employee-detail')
    created_by = serializers.CharField(read_only=True, source='created_by.name')
    date_joined = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_date_joined(self, obj: Employee) -> str:
        return obj.date_joined.strftime('%Y-%m-%d')


class EmployeeListSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='employee-detail')

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'url', 'name', 'position']


class EmployeeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        exclude = ['created_by']

    def create(self, validated_data):
        auth_user = self.context['request'].user
        return Employee.objects.create(**validated_data, created_by=auth_user)


class SecurityGuardSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='security-guard-detail')
    location_shifts = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SecurityGuard
        fields = '__all__'

    def get_location_shifts(self, obj: SecurityGuard):
        return [{"location": f"{loc.location.project.name} - {loc.location.name}", "shift": loc.shift.name} for loc in
                obj.location_shifts.all()]


class LocationShiftSerializer(serializers.ModelSerializer):
    shift = serializers.CharField(write_only=True)

    class Meta:
        model = SecurityGuardLocationShift
        fields = '__all__'
        validators = [
            UniqueTogetherValidator(
                queryset=SecurityGuardLocationShift.objects.all(),
                fields=["guard", "location", "shift"],
                message="هذا الحارس لديه نفس الوردية في نفس الموقع بالفعل."
            )
        ]

    def create(self, validated_data):
        # Extract the shift name from input
        shift_name = validated_data.pop("shift")

        try:
            shift_obj = Shift.objects.get(name=shift_name)
        except Shift.DoesNotExist:
            raise serializers.ValidationError(
                {"shift": f"Shift with name '{shift_name}' does not exist."}
            )

        validated_data["shift"] = shift_obj
        try:
            return super().create(validated_data)
        except IntegrityError:
            # Catch the DB constraint error (unique_together)
            raise ValidationError(
                {"non_field_errors": "هذا الحارس لديه نفس الوردية في نفس الموقع بالفعل."}
            )

    def update(self, instance, validated_data):
        # Extract the shift name from input
        shift_name = validated_data.pop("shift")

        try:
            shift_obj = Shift.objects.get(name=shift_name)
        except Shift.DoesNotExist:
            raise serializers.ValidationError(
                {"shift": f"Shift with name '{shift_name}' does not exist."}
            )

        validated_data["shift"] = shift_obj
        try:
            return super().update(instance, validated_data)
        except IntegrityError:
            # Catch the DB constraint error (unique_together)
            raise ValidationError(
                {"non_field_errors": "هذا الحارس لديه نفس الوردية في نفس الموقع بالفعل."}
            )
