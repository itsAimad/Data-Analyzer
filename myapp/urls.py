from django.urls import path
from . import views

urlpatterns = [
    path("",views.index,name="index"), # index Page
    path('home/',views.home,name="home"), #Home Page
    path("signin/",views.signin,name="signin"), #sign-in page
    path("signup/",views.signup,name="signup"), # sign-up page 
    path("upload/",views.upload_file,name="upload_file"), # for uploading file,stats,
    path("generate-graph/",views.generate_graph,name='generate_graph'), # Endpoint for graph genereation
    path("calculate-statistics/",views.calculate_statistics,name="statistics") # for Statistics calculations
]