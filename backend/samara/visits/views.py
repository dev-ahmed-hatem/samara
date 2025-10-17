from django.utils.timezone import make_aware
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action, api_view

from .models import Visit, VisitReport, Violation
from .serializers import VisitReadSerializer, VisitWriteSerializer, \
    VisitReportReadSerializer, VisitReportWriteSerializer, ViolationReadSerializer, ViolationWriteSerializer

from datetime import datetime, time, timedelta
from django.conf import settings
from django.db.models import Q
from django.db.models.functions import TruncDate
from django.utils.translation import gettext_lazy as _
from users.models import User


class VisitViewSet(ModelViewSet):
    queryset = Visit.objects.all()

    def get_queryset(self):
        queryset = Visit.objects.all()

        from_date = self.request.query_params.get('from', None)
        to_date = self.request.query_params.get('to', None)
        employee = self.request.query_params.get('employee', None)
        project = self.request.query_params.get('project', None)
        period = self.request.query_params.get('period', None)

        if from_date and to_date:
            from_date = datetime.strptime(from_date, '%Y-%m-%d').date()
            to_date = datetime.strptime(to_date, '%Y-%m-%d').date()

            if period == "morning":
                start_time = time(9, 0)
                end_time = time(20, 59)
                queryset = queryset.filter(
                    date__range=[from_date, to_date],
                    time__range=[start_time, end_time])

            elif period == "evening":
                evening_start = time(21, 0)
                evening_end = time(8, 59)

                late_evening = Q(
                    date__range=(from_date, to_date),
                    time__gte=evening_start,
                )
                early_morning = Q(
                    date__range=[from_date + timedelta(days=1), to_date + timedelta(days=1)],
                    time__lte=evening_end,
                )
                queryset = queryset.filter(late_evening | early_morning)

            else:
                queryset = queryset.filter(date__range=(from_date, to_date))

        if employee:
            queryset = queryset.filter(employee=employee)
        if project:
            queryset = queryset.filter(location__project__name__icontains=project)

        return queryset

    def retrieve(self, request, pk=None):
        today = datetime.today().astimezone(settings.SAUDI_TZ).date()
        yesterday = today - timedelta(days=1)
        instance: Visit = self.get_object()
        employee = request.user.employee_profile

        if employee.user.role == User.RoleChoices.SUPERVISOR and instance.employee != employee:
            return Response(
                {'detail': "لا يمكن عرض الزيارة، زيارة خاصة بمشرف اخر."},
                status=status.HTTP_403_FORBIDDEN
            )

        if employee.user.role == User.RoleChoices.SUPERVISOR and instance.date not in (today, yesterday):
            return Response(
                {"detail": "لا يمكن عرض الزيارة، هذا ليس يوم تنفيذ الزيارة."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, pk)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return VisitWriteSerializer
        else:
            return VisitReadSerializer


class VisitReportViewSet(ModelViewSet):
    queryset = VisitReport.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return VisitReportWriteSerializer
        return VisitReportReadSerializer


class ViolationViewSet(ModelViewSet):
    queryset = Violation.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ViolationWriteSerializer
        return ViolationReadSerializer

    def get_queryset(self):
        queryset = Violation.objects.all()

        from_date = self.request.query_params.get('from', None)
        to_date = self.request.query_params.get('to', None)
        employee = self.request.query_params.get('employee', None)

        if from_date and to_date:
            from_dt = make_aware(datetime.strptime(from_date, "%Y-%m-%d"))
            to_dt = make_aware(datetime.strptime(to_date, "%Y-%m-%d"))
            # Optionally extend to end of day
            to_dt = to_dt.replace(hour=23, minute=59, second=59)

            queryset = queryset.annotate(local_date=TruncDate("created_at", tzinfo=settings.SAUDI_TZ)).filter(
                local_date__range=[from_dt, to_dt])
        if employee:
            queryset = queryset.filter(created_by=employee)

        return queryset

    @action(detail=True, methods=["patch"])
    def confirm_by_monitoring(self, request, pk=None):
        try:
            violation = Violation.objects.get(pk=pk)
        except Exception:
            return Response({'detail': _('مخالفة غير موجودة')}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(
            violation, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save(confirmed_by_monitoring=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_visit_form_data(request):
    visit_id = request.query_params.get("id", None)
    if visit_id:
        try:
            visit: Visit = Visit.objects.get(id=visit_id)
        except Visit.DoesNotExist:
            return Response({'detail': _('زيارة غير موجودة')}, status=status.HTTP_404_NOT_FOUND)

        data = {
            "id": visit.id,
            "employee": visit.employee.id,
            "project": visit.location.project.id,
            "location": visit.location.id,
            "date": visit.date,
            "time": visit.time,
            "purpose": visit.purpose,
        }

        return Response(data, status=status.HTTP_200_OK)

    return Response({"detail": "يجب إدخال كود الزيارة"}, status=status.HTTP_400_BAD_REQUEST)
