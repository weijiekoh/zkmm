from django.db import models

# Create your models here.

class CommitReveal(models.Model):
    id = models.AutoField(primary_key=True)
    server_hash = models.CharField(max_length=64, unique=True)
    player_hash = models.CharField(max_length=64, unique=True)
    player_plaintext = models.TextField()
    server_plaintext = models.TextField()


class Game(models.Model):
    id = models.AutoField(primary_key=True)
    commit_reveal = models.OneToOneField(
        CommitReveal,
        on_delete=models.CASCADE
    )
    salt = models.CharField(
        max_length=64,
        unique=True,
        null=False
    )
    solution = models.IntegerField(null=False)


class Proof(models.Model):
    id = models.AutoField(primary_key=True)
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE
    )
    guess = models.IntegerField(null=False)
    clueNb = models.IntegerField(null=False)
    clueNw = models.IntegerField(null=False)
    proof = models.TextField(null=True)
    public_signals = models.TextField(null=True)
