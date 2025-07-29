from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, LocationViewSet, VisitViewSet, VisitReportViewSet, ViolationViewSet
from django.urls import include, path

router = DefaultRouter()
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'visit-report', VisitReportViewSet, basename='visit-report')
router.register(r'violations', ViolationViewSet, basename='violation')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)),
]
