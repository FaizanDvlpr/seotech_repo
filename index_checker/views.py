from django.shortcuts import render, redirect

def index_check(request):
    return render(request, "index_checker/inspect.html")