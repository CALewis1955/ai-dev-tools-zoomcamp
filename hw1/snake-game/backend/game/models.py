from django.db import models

class GameScore(models.Model):
    player_name = models.CharField(max_length=100, default="Anonymous")
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"{self.player_name}: {self.score}"
