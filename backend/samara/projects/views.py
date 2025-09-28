from rest_framework import status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from employees.models import SecurityGuardLocationShift
from samara.rest_framework_utils.custom_pagination import CustomPageNumberPagination
from .models import Project, Location
from .serializers import ProjectSerializer, LocationSerializer, ProjectListSerializer, ProjectReadSerializer
from rest_framework.viewsets import ModelViewSet
from django.utils.translation import gettext_lazy as _


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()

    def get_serializer_class(self):
        list_details = self.request.query_params.get('list_details', False)

        if list_details and list_details.lower() == 'true':
            return ProjectListSerializer
        return ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all()

        search = self.request.query_params.get('search', None)

        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset

    @action(detail=True, methods=['get'])
    def form_data(self, request, pk=None):
        try:
            project = Project.objects.get(id=pk)
            serializer = ProjectSerializer(project, context={"request": self.request}).data
            return Response(serializer)
        except Exception:
            return Response({'detail': _('مشروع غير موجود')}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        try:
            project = Project.objects.get(pk=pk)
            data = ProjectReadSerializer(project, context={"request": self.request}).data
            return Response(data)
        except Exception:
            return Response({'detail': _('مشروع غير موجود')}, status=status.HTTP_404_NOT_FOUND)


class LocationViewSet(ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def get_queryset(self):
        queryset = Location.objects.all()

        project_id = self.request.query_params.get('project_id')

        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset


@api_view(["GET"])
def get_project_guards(request):
    project_id = request.query_params.get('project', None)
    location = request.query_params.get('location', [])
    shift = request.query_params.get('shift', [])

    if not project_id:
        return Response({"detail": "project id must be provided"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(pk=project_id)
        location_shifts = SecurityGuardLocationShift.objects.filter(location__project_id=project.id)

        if len(location) > 0:
            location_filters = location.split(',')
            location_shifts = location_shifts.filter(location_id__in=location_filters)

        if len(shift) > 0:
            shift_filters = shift.split(',')
            location_shifts = location_shifts.filter(shift__name__in=shift_filters)

        paginator = CustomPageNumberPagination()
        page = paginator.paginate_queryset(location_shifts, request)

        data = [{"id": ls.id, "name": ls.guard.name, "location": {"name": ls.location.name, "id": ls.location.id},
                 "shift": ls.shift.name} for ls in
                page]
        return paginator.get_paginated_response(data)
    except Project.DoesNotExist:
        return Response({'detail': _('مشروع غير موجود')}, status=status.HTTP_404_NOT_FOUND)
