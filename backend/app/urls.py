from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'commit_hash/', views.commit_hash, name='commit_hash'),
    url(r'reveal/', views.reveal, name='reveal'),
    url(r'guess/', views.guess, name='guess'),
    url(r'^$', views.index, name='index'),
]
