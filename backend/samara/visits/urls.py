from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, LocationViewSet, VisitViewSet
from django.urls import include, path

router = DefaultRouter()
router.register(r'visits', VisitViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
