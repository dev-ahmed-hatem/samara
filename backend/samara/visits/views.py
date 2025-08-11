from django.utils.timezone import make_aware
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Visit, VisitReport, Violation
from .serializers import VisitReadSerializer, VisitWriteSerializer, \
    VisitReportReadSerializer, VisitReportWriteSerializer, ViolationReadSerializer, ViolationWriteSerializer

from datetime import datetime
from django.conf import settings
from django.db.models.functions import TruncDate


class VisitViewSet(ModelViewSet):
    queryset = Visit.objects.all()

    def get_queryset(self):
        queryset = Visit.objects.all()

        from_date = self.request.query_params.get('from', None)
        to_date = self.request.query_params.get('to', None)
        employee = self.request.query_params.get('employee', None)
        project = self.request.query_params.get('project', None)

        if from_date and to_date:
            queryset = queryset.filter(date__range=[from_date, to_date])
        if employee:
            queryset = queryset.filter(employee=employee)
        if project:
            queryset = queryset.filter(location__project__name__icontains=project)

        return queryset

    def retrieve(self, request, pk=None):
        today = datetime.today().astimezone(settings.SAUDI_TZ).date()
        instance: Visit = self.get_object()

        if instance.date != today:
            return Response({'detail': "لا يمكن عرض الزيارة، هذا ليس يوم تنفيذ الزيارة."},
                            status=status.HTTP_403_FORBIDDEN)
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
