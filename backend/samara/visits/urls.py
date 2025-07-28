from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, LocationViewSet, VisitViewSet, VisitReportViewSet
from django.urls import include, path

router = DefaultRouter()
router.register(r'visits', VisitViewSet)
router.register(r'visit-report', VisitReportViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
