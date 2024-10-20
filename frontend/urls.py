from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('about/', views.about, name="about"),
    path('blog/', views.blog, name="blog"),
    path('single_blog/', views.single_blog, name="single_blog"),
    path('contact/', views.contact, name="contact"),
    path('team/', views.team, name="team"),
    path('login/', views.login, name="login"),
    path('register/', views.register, name="register"),
]