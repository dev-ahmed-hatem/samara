from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.views import APIView
from datetime import datetime, date, timedelta, time
from django.conf import settings
from django.utils.dateparse import parse_date
from django.http import JsonResponse
from django.db.models import Count, Q
from collections import Counter

from attendance.models import ShiftAttendance, SecurityGuardAttendance
from visits.models import Visit, Violation, filter_visits_by_period
from visits.serializers import VisitReadSerializer, ViolationReadSerializer
from .serializers import EmployeeReadSerializer, EmployeeWriteSerializer, EmployeeListSerializer, \
    SecurityGuardSerializer, LocationShiftSerializer
from .models import Employee, SecurityGuard, SecurityGuardLocationShift
from projects.models import Location, Project
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
        search_type = self.request.query_params.get('search_type', "name__icontains")
        location_id = self.request.query_params.get('location_id', None)
        shift = self.request.query_params.get('shift', None)

        status_filters = self.request.query_params.get('is_active', [])
        sort_by = self.request.query_params.get('sort_by', None)
        order = self.request.query_params.get('order', None)

        if search not in (None, ""):
            try:
                if search_type == "employee_id" and not search.isdigit():
                    raise ValueError("employee_id must be number")
                queryset = queryset.filter(**{search_type: search})
            except ValueError:
                pass

        if shift and location_id:
            location_shifts_ids = SecurityGuardLocationShift.objects.filter(shift__name=shift,
                                                                            location_id=location_id).values_list(
                "guard__employee_id", flat=True)
            queryset = queryset.filter(employee_id__in=location_shifts_ids)
        if location_id:
            location_shifts_ids = SecurityGuardLocationShift.objects.filter(location_id=location_id).values_list(
                "guard__employee_id", flat=True)
            queryset = queryset.filter(employee_id__in=location_shifts_ids)

        if status_filters == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filters == "inactive":
            queryset = queryset.filter(is_active=False)

        if sort_by is not None:
            queryset = queryset.order_by(f"{order}{sort_by}")

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

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        try:
            guard = SecurityGuard.objects.get(pk=pk)
            data = SecurityGuardSerializer(guard, context={"request": self.request}).data
            return Response(data)
        except Exception:
            return Response({'detail': _('رجل أمن غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def switch_active(self, request, pk=None):
        try:
            guard = SecurityGuard.objects.get(pk=pk)
            guard.is_active = not guard.is_active
            guard.save()
            return Response({"is_active": guard.is_active})
        except Exception:
            return Response({'detail': _('رجل أمن غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            guard = SecurityGuard.objects.get(id=pk)
            serializer = SecurityGuardSerializer(guard, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('رجل أمن غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def location_shifts(self, request, pk=None):
        try:
            guard = SecurityGuard.objects.get(id=pk)
            assignments = [
                {"id": loc.id, "project": loc.location.project.name, "location": loc.location.name,
                 "shift": loc.shift.name} for loc
                in guard.location_shifts.all()]

            return Response(assignments)
        except Exception:
            return Response({'detail': _('رجل أمن غير موجود')}, status=status.HTTP_404_NOT_FOUND)


class LocationShiftViewSet(viewsets.ModelViewSet):
    queryset = SecurityGuardLocationShift.objects.all()
    serializer_class = LocationShiftSerializer


@api_view(["DELETE"])
def multiple_delete(request):
    for emp_id in list(request.data):
        emp = Employee.objects.filter(id=emp_id).first()
        if emp:
            emp.delete()
    return Response()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_moderator_home_stats(request):
    date = datetime.today().astimezone(settings.SAUDI_TZ).date()

    projects_count = Project.objects.count()
    locations_count = Location.objects.count()
    security_guards_count = SecurityGuard.objects.count()
    supervisors = Employee.objects.filter(user__role=User.RoleChoices.SUPERVISOR)
    supervisors_count = supervisors.count()

    visits = Visit.objects.all()
    morning_visits = filter_visits_by_period(visits, date, "morning")
    evening_visits = filter_visits_by_period(visits, date, "evening")

    data = {
        "general": {
            "projects_count": projects_count,
            "locations_count": locations_count,
            "security_guards_count": security_guards_count,
            "supervisors_count": supervisors_count,
        },
        "today_visits": {
            "morning": {
                "total": morning_visits.count(),
                "completed": morning_visits.filter(status=Visit.VisitStatus.COMPLETED).count(),
                "scheduled": morning_visits.filter(status=Visit.VisitStatus.SCHEDULED).count(),
            },
            "evening": {
                "total": evening_visits.count(),
                "completed": evening_visits.filter(status=Visit.VisitStatus.COMPLETED).count(),
                "scheduled": evening_visits.filter(status=Visit.VisitStatus.SCHEDULED).count(),
            }
        },
        "supervisors": [],
        "attendance": None,
        "shifts_count": None
    }

    for s in supervisors:
        morning_visits = filter_visits_by_period(visits.filter(employee=s), date, "morning")
        evening_visits = filter_visits_by_period(visits.filter(employee=s), date, "evening")
        data["supervisors"].append(
            {"name": s.name,
             "id": s.id,
             "morning": {
                 "total": morning_visits.count(),
                 "completed": morning_visits.filter(status=Visit.VisitStatus.COMPLETED).count(),
                 "scheduled": morning_visits.filter(status=Visit.VisitStatus.SCHEDULED).count(),
             },
             "evening": {
                 "total": evening_visits.count(),
                 "completed": evening_visits.filter(status=Visit.VisitStatus.COMPLETED).count(),
                 "scheduled": evening_visits.filter(status=Visit.VisitStatus.SCHEDULED).count(),
             }
             }
        )

    guards = SecurityGuardAttendance.objects.filter(shift__date=date)
    status_counts = Counter(guard.status for guard in guards)

    data["attendance"] = [
        {"name": " الحضور", "value": status_counts.get("حاضر", 0), "color": "#4ade80"},  # green
        {"name": " التأخير", "value": status_counts.get("متأخر", 0), "color": "#facc15"},  # yellow
        {"name": " الغياب", "value": status_counts.get("غائب", 0), "color": "#f87171"},  # red
        {"name": " الراحة", "value": status_counts.get("راحة", 0), "color": "#60a5fa"},  # blue
    ]

    shift_counts = Counter(guard.shift.shift.name for guard in guards)

    data["shifts"] = [
        {"name": " الأولى", "value": shift_counts.get("الوردية الأولى", 0), "color": "#3b82f6"},  # blue
        {"name": " الثانية", "value": shift_counts.get("الوردية الثانية", 0), "color": "#06b6d4"},  # cyan
        {"name": " الثالثة", "value": shift_counts.get("الوردية الثالثة", 0), "color": "#a855f7"},  # purple
    ]

    data["shifts_count"] = ShiftAttendance.objects.filter(date=date).count()

    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_home_stats(request):
    user: User = request.user
    today = datetime.today().astimezone(settings.SAUDI_TZ).date()

    visits = Visit.objects.filter()
    violations = Violation.objects.filter(date=today)
    attendance_records = ShiftAttendance.objects.filter(date=today)
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
        "scheduled_visits": visits.filter(status=Visit.VisitStatus.SCHEDULED, date=today).count(),
        "completed_visits": visits.filter(status=Visit.VisitStatus.COMPLETED, date=today).count(),
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
        period = request.GET.get("period")
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

        # set the last_day of the month in case of morning period,
        # and include the first day in next month in case of evening

        last_day = (next_month - timedelta(days=1)) if period == "morning" else next_month

        queryset = Visit.objects.filter(
            date__range=(first_day, last_day),
            employee_id=supervisor,
        )

        # check the period for filtering
        if period == "morning":
            start_time = time(9, 0)
            end_time = time(20, 59)
            queryset = queryset.filter(
                time__range=(start_time, end_time),
            )
        elif period == "evening":
            start_time = time(21, 0)
            end_time = time(8, 59)
            queryset = queryset.filter(
                Q(time__gte=start_time) | Q(time__lte=end_time),
            )

        # Merge data by day
        summary = {}

        if period == "morning":
            # Get completed visits count per day
            visits_data = (
                queryset
                .values("date")
                .annotate(scheduled=Count("id", filter=Q(status=Visit.VisitStatus.SCHEDULED)),
                          completed=Count("id", filter=Q(status=Visit.VisitStatus.COMPLETED)))
            )
            for v in visits_data:
                d = v["date"]
                summary[d.day] = {"completed": v["completed"], "scheduled": v["scheduled"]}

        else:
            for v in queryset:
                d = v.date
                if v.time < time(9, 0):
                    d = d - timedelta(days=1)

                summary.setdefault(d.day, {"completed": 0, "scheduled": 0})
                if v.status == Visit.VisitStatus.SCHEDULED:
                    summary[d.day]["scheduled"] += 1
                else:
                    summary[d.day]["completed"] += 1

        # Get violations count per day
        violations_data = (
            Violation.objects.filter(
                date__range=(first_day, last_day),
                created_by_id=supervisor
            )
            # .annotate(
            #     date=TruncDate("created_at", tzinfo=settings.SAUDI_TZ)
            # )
            .values("date")
            .annotate(violations_count=Count("id"))
        )

        for v in violations_data:
            day = v["date"].day
            summary.setdefault(day, {"completed": 0, "scheduled": 0, "violations": 0})
            summary[v["date"].day]["violations"] = v["violations_count"]

        return JsonResponse({"month": first_day.strftime("%Y-%m"), "data": summary})


class SupervisorDailyRecord(APIView):
    def get(self, request):
        selected_date = parse_date(request.GET.get("date", None))
        supervisor = request.GET.get("supervisor", None)
        period = request.GET.get("period", None)

        if not selected_date or not supervisor:
            return JsonResponse({"error": "Invalid date"}, status=400)

        queryset = Visit.objects.filter(employee_id=supervisor)
        if period is not None:
            visits = filter_visits_by_period(queryset, selected_date, period)
        else:
            visits = queryset.filter(date=selected_date)

        violations = (
            Violation.objects
            .filter(created_by_id=supervisor)
            # .annotate(local_date=TruncDate("created_at", tzinfo=settings.SAUDI_TZ))
            .filter(date=selected_date))

        visits_serialized = VisitReadSerializer(visits, many=True, context={"request": request}).data
        violations_serialized = ViolationReadSerializer(violations, many=True, context={"request": request}).data
        return JsonResponse({"visits": visits_serialized, "violations": violations_serialized})
