from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'commit_hash/', views.commit_hash, name='commit_hash'),
    url(r'reveal/', views.reveal, name='reveal'),
    url(r'guess/', views.guess, name='guess'),
    url(r'proof/', views.proof, name='proof'),
    url(r'verifying_key/', views.verifying_key, name='verifying_key'),
    url(r'^$', views.index, name='index'),
]
