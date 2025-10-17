from rest_framework.routers import DefaultRouter
from .views import VisitViewSet, VisitReportViewSet, ViolationViewSet, get_visit_form_data
from django.urls import include, path

router = DefaultRouter()
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'visit-reports', VisitReportViewSet, basename='visit-report')
router.register(r'violations', ViolationViewSet, basename='violation')

urlpatterns = [
    path('', include(router.urls)),
    path('get-visit-form-data/', get_visit_form_data),
]
