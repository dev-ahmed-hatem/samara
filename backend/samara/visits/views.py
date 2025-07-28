from rest_framework.viewsets import ModelViewSet

from .models import Project, Location, Visit, VisitReport
from .serializers import ProjectSerializer, LocationSerializer, VisitReadSerializer, VisitWriteSerializer, \
    VisitReportSerializer


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class LocationViewSet(ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class VisitViewSet(ModelViewSet):
    queryset = Visit.objects.all()

    def get_queryset(self):
        queryset = Visit.objects.all()

        date = self.request.query_params.get('date', None)
        employee = self.request.query_params.get('employee', None)
        project = self.request.query_params.get('project', None)

        if date:
            queryset = queryset.filter(date=date)
        if employee:
            queryset = queryset.filter(employee=employee)
        if project:
            queryset = queryset.filter(location__project__name__icontains=project)

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return VisitWriteSerializer
        else:
            return VisitReadSerializer


class VisitReportViewSet(ModelViewSet):
    queryset = VisitReport.objects.all()
    serializer_class = VisitReportSerializer
