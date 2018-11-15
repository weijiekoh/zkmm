from django.shortcuts import render
from django.http import HttpResponse
import json

# Create your views here.

def json_response(obj):
    """
    Returns @obj in JSON format, wrapped in a HttpResponse
    """
    return HttpResponse(json.dumps(obj, separators=(',', ':')),
            content_type="application/json")
def index(request):
    return json_response("Mastermind")
