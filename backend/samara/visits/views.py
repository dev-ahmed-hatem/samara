from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Visit, VisitReport, Violation
from .serializers import VisitReadSerializer, VisitWriteSerializer, \
    VisitReportSerializer, ViolationSerializer

from datetime import datetime
from django.conf import settings


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
    serializer_class = VisitReportSerializer


class ViolationViewSet(ModelViewSet):
    queryset = Violation.objects.all()
    serializer_class = ViolationSerializer
