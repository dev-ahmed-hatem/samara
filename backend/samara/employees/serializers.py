from rest_framework import serializers
from .models import Employee, SecurityGuard


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

    class Meta:
        model = SecurityGuard
        fields = '__all__'
