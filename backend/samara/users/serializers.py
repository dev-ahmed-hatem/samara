from django.db import transaction
from rest_framework import serializers
from rest_framework.relations import HyperlinkedIdentityField

from employees.models import Employee
from employees.serializers import EmployeeReadSerializer, EmployeeWriteSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    name = serializers.StringRelatedField(read_only=True, source="employee_profile.name")
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    role_arabic = serializers.CharField(source='get_role_display', read_only=True)
    url = HyperlinkedIdentityField(view_name='user-detail', lookup_field='pk')
    employee_profile = EmployeeReadSerializer(read_only=True)

    employee_data = serializers.DictField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'is_superuser', 'is_moderator', 'password',
                  'password2', 'url', 'is_root', 'role', 'role_arabic', "employee_profile", "employee_data"]

    def validate(self, data):
        if 'password' in data and 'password2' in data:
            if data['password'] != data['password2']:
                raise serializers.ValidationError(
                    {'password': 'passwords do not match', 'password2': 'passwords do not match'})

        return data

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        validated_data.pop("password2", None)
        employee_data = validated_data.pop("employee_data")

        with transaction.atomic():
            user = User(**validated_data)
            if password:
                user.set_password(password)
            user.save()

            employee_serializer = EmployeeWriteSerializer(
                data=employee_data,
                context=self.context
            )
            employee_serializer.is_valid(raise_exception=True)
            employee_serializer.save(user=user)

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        validated_data.pop("password2", None)
        employee_data = validated_data.pop("employee_data")

        instance = super(UserSerializer, self).update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save()

        if employee_data:
            employee_serializer = EmployeeWriteSerializer(
                instance.employee_profile, data=employee_data, partial=True
            )
            employee_serializer.is_valid(raise_exception=True)
            employee_serializer.save()
        return instance
