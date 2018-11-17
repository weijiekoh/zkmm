import json
import secrets
import hashlib
import random
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import ensure_csrf_cookie
from app import models
from project import settings


# Create your views here.

def json_bad_response(obj):
    return HttpResponseBadRequest(
        json.dumps(
            obj,
            separators=(',', ':')
        ),
        content_type="application/json"
    )


def json_response(obj):
    """
    Returns @obj in JSON format, wrapped in a HttpResponse
    """
    return HttpResponse(
        json.dumps(
            obj,
            separators=(',', ':')
        ),
        content_type="application/json"
    )


@ensure_csrf_cookie
def index(request):
    return json_response("Mastermind")


@ensure_csrf_cookie
def commit_hash(request):
    params = json.loads(request.body)
    player_hash = params['player_hash']
    assert(len(player_hash) >= 54)

    server_plaintext = secrets.token_bytes(32).hex()
    m = hashlib.sha256()
    m.update(server_plaintext.encode())
    server_hash = m.hexdigest()

    if not models.CommitReveal.objects.filter(server_hash=server_hash).exists():
        models.CommitReveal(
            player_hash=player_hash,
            server_hash=server_hash,
            server_plaintext=server_plaintext
        ).save()

    return json_response({
        'server_hash': server_hash
    })


def generate_solution():
    j = 0
    for i in range(0, 4):
        j += 10 ** i * random.randint(1, 4)
    return j


def reveal(request):
    params = json.loads(request.body)
    player_hash = params['player_hash']
    player_plaintext = params['player_plaintext']

    m = hashlib.sha256()
    m.update(player_plaintext.encode())
    calculated_hash = m.hexdigest()

    if calculated_hash == player_hash:
        cr = models.CommitReveal.objects.get(
            player_hash=player_hash
        )
        cr.player_plaintext = player_plaintext
        cr.save()

        m2 = hashlib.sha256()
        m2.update((player_hash + cr.server_hash).encode())
        salt = m2.hexdigest()

        models.Game(
            commit_reveal=cr,
            solution=generate_solution(),
            salt=salt
        ).save()

        return json_response({
            'server_plaintext': cr.server_plaintext,
            'server_hash': cr.server_hash,
            'player_plaintext': cr.player_plaintext,
            'player_hash': cr.player_hash,
            'salt': salt
        })
    else:
        return json_bad_response('Invalid hash')


def genClue(guess, solution):
    nb = 0
    nw = 0

    g = list(str(guess))
    s = list(str(solution))

    for i, char in enumerate(g):
        if s[i] == char:
            nb += 1
            g[i] = 0
            s[i] = 0

    for i, gs in enumerate(g):
        for j, ss in enumerate(s):
            if i != j and g[i] != 0 and g[i] == s[j]:
                nw += 1
                g[i] = 0
                s[j] = 0

    return nb, nw


def guess(request):
    params = json.loads(request.body)
    salt = params['salt']
    guess = params['guess']

    game = models.Game.objects.get(salt=salt)
    solution = game.solution

    # generate the clue
    nb, nw = genClue(guess, solution)
    
    proof = None
    p = models.Proof.objects.filter(game=game, guess=guess)

    if p.exists():
        proof = models.Proof.objects.get(game=game, guess=guess)
    else:
        proof = models.Proof(
            game=game,
            guess=guess,
            clueNb=nb,
            clueNw=nw,
            proof=None
        )

        proof.save()

    return json_response({
        'nb': nb,
        'nw': nw,
        'proof': proof.proof,
        'public_signals': proof.public_signals
    })


def proof(request):
    guess = request.GET['guess']
    salt = request.GET['salt']
    game = models.Game.objects.get(salt=salt)
    p = models.Proof.objects.get(game=game, guess=guess)
    return json_response({
        'proof': p.proof,
        'public_signals': p.public_signals
    })

def verifying_key(request):
    with open(settings.VERIFYING_KEY_FILE) as f:
        return json_response(f.read())
