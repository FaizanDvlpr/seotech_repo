from django.urls import path
from . import views
urlpatterns = [
    path('inspect/', views.index_check),
]
