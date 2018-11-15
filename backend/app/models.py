from django.db import models

# Create your models here.

class CommitReveal(models.Model):
    server_hash = models.CharField(max_length=64, unique=True)
    player_hash = models.CharField(max_length=64, unique=True)
    player_plaintext = models.TextField()
    server_plaintext = models.TextField()

class Game(models.Model):
    server_hash = models.CharField(max_length=64, unique=True, null=False)
    player_hash = models.CharField(max_length=64, unique=True, null=False)
    salt = models.CharField(max_length=64, null=False)
    solution = models.IntegerField(null=False)
