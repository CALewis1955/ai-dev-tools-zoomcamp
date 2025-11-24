from rest_framework import serializers
from .models import GameScore

class GameScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameScore
        fields = ['id', 'player_name', 'score', 'created_at']
        read_only_fields = ['id', 'created_at']
