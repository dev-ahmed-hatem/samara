from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.views import APIView
from datetime import datetime, date, timedelta
from django.conf import settings
from django.utils.dateparse import parse_date
from django.http import JsonResponse
from django.db.models import Count, Q
from django.db.models.functions import TruncDate

from attendance.models import ShiftAttendance
from visits.models import Visit, Violation
from visits.serializers import VisitReadSerializer, ViolationReadSerializer
from .serializers import EmployeeReadSerializer, EmployeeWriteSerializer, EmployeeListSerializer, \
    SecurityGuardSerializer
from .models import Employee, SecurityGuard
from projects.models import Location
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils.translation import gettext_lazy as _
from users.models import User


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EmployeeWriteSerializer
        return EmployeeListSerializer

    def get_queryset(self):
        queryset = Employee.objects.all()
        search = self.request.query_params.get('search', None)
        role = self.request.query_params.get('role', None)

        if role is not None:
            queryset = queryset.filter(user__role=role)

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
    user: User = request.user
    date = datetime.today().astimezone(settings.SAUDI_TZ).date()

    visits = Visit.objects.filter()
    violations = Violation.objects.filter(created_at__date=date)
    attendance_records = ShiftAttendance.objects.filter(date=date)
    if user.role == User.RoleChoices.SUPERVISOR:
        employee = user.employee_profile
        visits.filter(employee=employee)
        violations.filter(created_by=employee)
        attendance_records.filter(created_by=employee)

    locations_ids = visits.values_list('location_id', flat=True).distinct()
    project_ids = Location.objects.filter(id__in=locations_ids).values_list('project_id', flat=True).distinct()

    locations_count = locations_ids.count()
    project_ids_count = project_ids.count()

    data = {
        "project_count": project_ids_count,
        "location_count": locations_count,
        "scheduled_visits": visits.filter(status=Visit.VisitStatus.SCHEDULED, date=date).count(),
        "completed_visits": visits.filter(status=Visit.VisitStatus.COMPLETED, date=date).count(),
        "violations": violations.count(),
        "attendance_records": attendance_records.count(),
        "guards_count": SecurityGuard.objects.count()
    }

    return Response(data, status=status.HTTP_200_OK)


class SupervisorMonthlyRecord(APIView):
    def get(self, request):
        # Parse date from query params or default to today
        date_str = request.GET.get("date")
        supervisor = request.GET.get("supervisor")
        if date_str:
            selected_date = parse_date(date_str)
        else:
            selected_date = date.today()

        if not selected_date or not supervisor:
            return JsonResponse({"error": "Invalid date"}, status=400)

        # Calculate month range
        first_day = selected_date.replace(day=1)
        if first_day.month == 12:
            next_month = first_day.replace(year=first_day.year + 1, month=1, day=1)
        else:
            next_month = first_day.replace(month=first_day.month + 1, day=1)
        last_day = next_month - timedelta(days=1)

        # Get completed visits count per day
        visits_data = (
            Visit.objects.filter(
                date__range=(first_day, last_day),
                employee_id=supervisor
            )
            .values("date")
            .annotate(scheduled=Count("id", filter=Q(status=Visit.VisitStatus.SCHEDULED)),
                      completed=Count("id", filter=Q(status=Visit.VisitStatus.COMPLETED)))
        )

        # Get violations count per day
        violations_data = (
            Violation.objects.filter(
                created_at__date__range=(first_day, last_day),
                created_by_id=supervisor
            ).annotate(
                date=TruncDate("created_at")
            )
            .values("date")
            .annotate(violations_count=Count("id"))
        )

        # Merge data by day
        summary = {}
        for v in visits_data:
            summary[v["date"].day] = {"scheduled": v["scheduled"], "completed": v["completed"]}

        for v in violations_data:
            summary[v["date"].day]["violations"] = v["violations_count"]

        return JsonResponse({"month": first_day.strftime("%Y-%m"), "data": summary})


class SupervisorDailyRecord(APIView):
    def get(self, request):
        selected_date = parse_date(request.GET.get("date", None))
        supervisor = request.GET.get("supervisor", None)

        if not selected_date or not supervisor:
            return JsonResponse({"error": "Invalid date"}, status=400)

        visits = Visit.objects.filter(
            date=selected_date,
            employee_id=supervisor
        )

        violations = Violation.objects.filter(
            created_at__date=selected_date,
        )

        visits_serialized = VisitReadSerializer(visits, many=True, context={"request": request}).data
        violations_serialized = ViolationReadSerializer(violations, many=True, context={"request": request}).data
        return JsonResponse({"visits": visits_serialized, "violations": violations_serialized})
