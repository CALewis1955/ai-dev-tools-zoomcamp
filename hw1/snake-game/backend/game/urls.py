from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameScoreViewSet

router = DefaultRouter()
router.register(r'scores', GameScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
