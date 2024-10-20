from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, "main_frontend/index.html")

def about(request):
    return render(request, "main_frontend/about.html")

def blog(request):
    return render(request, "main_frontend/blog.html")

def single_blog(request):
    return render(request, "main_frontend/single_blog.html")

def contact(request):
    return render(request, "main_frontend/contact.html")

def team(request):
    return render(request, "main_frontend/team.html")

def login(request):
    return render(request, "main_frontend/login.html")

def register(request):
    return render(request, "main_frontend/register.html")