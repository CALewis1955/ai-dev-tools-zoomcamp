from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GameScore
from .serializers import GameScoreSerializer

class GameScoreViewSet(viewsets.ModelViewSet):
    queryset = GameScore.objects.all()
    serializer_class = GameScoreSerializer

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get top 10 scores"""
        top_scores = GameScore.objects.all()[:10]
        serializer = self.get_serializer(top_scores, many=True)
        return Response(serializer.data)
