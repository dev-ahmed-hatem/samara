from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, LocationViewSet, get_project_guards
from django.urls import path, include

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)),
    path('project-guards/', get_project_guards, name="project-guards"),
]
