from rest_framework.response import Response
from rest_framework import viewsets, status
from datetime import datetime
from django.conf import settings

from attendance.models import ShiftAttendance
from visits.models import Visit, Violation
from .serializers import EmployeeReadSerializer, EmployeeWriteSerializer, EmployeeListSerializer, \
    SecurityGuardSerializer
from .models import Employee, SecurityGuard
from projects.models import Location
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils.translation import gettext_lazy as _


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeWriteSerializer
        return EmployeeListSerializer

    def get_queryset(self):
        queryset = Employee.objects.all()
        search = self.request.query_params.get('search', None)

        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(employee_id__icontains=search))

        return queryset

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        try:
            employee = Employee.objects.get(pk=pk)
            data = EmployeeReadSerializer(employee, context={"request": self.request}).data
            return Response(data)
        except Exception:
            return Response({'detail': _('موظف غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def switch_active(self, request, pk=None):
        try:
            employee = Employee.objects.get(pk=pk)
            employee.is_active = not employee.is_active
            employee.save()
            return Response({"is_active": employee.is_active})
        except Exception:
            return Response({'detail': _('موظف غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            employee = Employee.objects.get(id=pk)
            serializer = EmployeeWriteSerializer(employee, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('موظف غير موجود')}, status=status.HTTP_404_NOT_FOUND)


class SecurityGuardViewSet(viewsets.ModelViewSet):
    queryset = SecurityGuard.objects.all()
    serializer_class = SecurityGuardSerializer

    def get_queryset(self):
        queryset = SecurityGuard.objects.all()

        search = self.request.query_params.get('search', None)
        location_id = self.request.query_params.get('location_id', None)
        shift = self.request.query_params.get('shift', None)

        if search:
            queryset = queryset.filter(name__icontains=search)
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        if shift:
            queryset = queryset.filter(shift__name=shift)

        return queryset

    def list(self, request, *args, **kwargs):
        location_id = request.query_params.get('location_id', None)
        shift = request.query_params.get('shift', None)
        date = request.query_params.get('date', None)

        if location_id and shift:
            # Optionally filter by date
            attendance_filter = {
                'location_id': location_id,
                'shift__name': shift,
            }
            if date:
                attendance_filter['date'] = date

            if ShiftAttendance.objects.filter(**attendance_filter).exists():
                return Response(
                    {"detail": "تم تسجيل حضور هذه الوردية لهذا اليوم"},
                    status=status.HTTP_409_CONFLICT,
                )

        return super().list(request, *args, **kwargs)


@api_view(["DELETE"])
def multiple_delete(request):
    for emp_id in list(request.data):
        emp = Employee.objects.filter(id=emp_id).first()
        if emp:
            emp.delete()
    return Response()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_home_stats(request):
    employee = request.user.employee_profile
    date = datetime.today().astimezone(settings.SAUDI_TZ).date()

    visits = Visit.objects.filter(employee=employee)
    locations_ids = visits.values_list('location_id', flat=True).distinct()
    project_ids = Location.objects.filter(id__in=locations_ids).values_list('project_id', flat=True).distinct()

    locations_count = locations_ids.count()
    project_ids_count = project_ids.count()

    data = {
        "project_count": project_ids_count,
        "location_count": locations_count,
        "scheduled_visits": visits.filter(status=Visit.VisitStatus.SCHEDULED, date=date).count(),
        "completed_visits": visits.filter(status=Visit.VisitStatus.COMPLETED, date=date).count(),
        "violations": Violation.objects.filter(visit__employee=employee, created_at=date).count(),
        "attendance_records": ShiftAttendance.objects.filter(created_by=employee, date=date).count(),
    }

    return Response(data, status=status.HTTP_200_OK)
