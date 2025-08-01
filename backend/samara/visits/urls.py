from rest_framework.routers import DefaultRouter
from .views import VisitViewSet, VisitReportViewSet, ViolationViewSet
from django.urls import include, path

router = DefaultRouter()
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'visit-report', VisitReportViewSet, basename='visit-report')
router.register(r'violations', ViolationViewSet, basename='violation')

urlpatterns = [
    path('', include(router.urls)),
]
