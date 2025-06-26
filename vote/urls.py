from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView
from django.contrib.auth import views as auth_views
from .views import login_view, candidature_view




urlpatterns = [
    path('', views.home, name='home'),  # Page d'accueil animée
    path('login/', views.login_view, name='login'),  # Page de connexion
    path('vote/', views.vote_view, name='vote'),  # Page de vote
    path('thank-you/', views.thank_you, name='thank_you'),  # Page de remerciement
    #path('generate-report/', views.generate_report, name='generate_report'),  # PDF ou Excel
    path('admin_dashboard/', views.admin_dashboard_view, name='admin_dashboard'),  # Dashboard admin
    #path('results/', views.results_chart, name='results_chart'),  # Page avec graphiques dynamiques (Chart.js)
    path('resultats/', views.resultats_view, name='resultats'),
    path('results/', views.results_portal, name='results_portal'),
    path('', views.accueil, name='accueil'),
    path('merci/', views.merci, name='merci'),
    path('candidats/', views.liste_candidats, name='liste_candidats'),
    path('admin/importer-candidats/', views.upload_candidats, name='upload_candidats'),
    path('vote/aes/', views.vote_aes, name='vote_aes'),
    path('vote/club/', views.vote_club, name='vote_club'),
    path('vote/club/submit/', views.vote_club_submit, name='vote_club_submit'),
    path('resultats-clubs/', views.results_club_view, name='results_club'),
    path('stats/club/', views.club_stats, name='club_stats'),
    path('vote/classe/', views.vote_classe, name='vote_classe'),
    path("voter/", views.voter, name="voter"),
    path('statistiques/', views.statistiques_view, name='statistiques'),
    path('logout/', views.logout_view, name='logout'),
    path('generer-codes/', views.generer_codes_view, name='generer_codes'),
    path('export-matricules/', views.export_voters_excel, name='export_voters_excel'),
    path('telechargement/', views.telechargement_view, name='telechargement'),
    path('candidater/', views.candidature_view, name='candidater'),
    path('candidature-club/', views.candidature_club_view, name='candidature_club'),
    path('candidature-responsable/', views.candidature_responsable_view, name='candidature_responsable'),
    path('candidatures-portail/', views.portail_candidatures, name='portail_candidatures'),
    path('envoyer-message/', views.contact_email, name='contact_email'),
    path('admin-dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    path('ajouter-electeur/', views.ajouter_electeur, name='ajouter_electeur'),
    path('supprimer-electeur/', views.supprimer_electeur, name='supprimer_electeur'),
    path('ajouter-candidat/', views.ajouter_candidat, name='ajouter_candidat'),
    path('supprimer-candidat/', views.supprimer_candidat, name='supprimer_candidat'),
    path('controler-periode/', views.controler_periode, name='controler_periode'),
    path('generer-matricules-admin/', views.generer_matricules_admin, name='generer_matricules_admin'),
    path('vote/responsables-classe/', views.vote_responsables_classe, name='vote_responsables_classe'),
    path('results-classe/', views.results_votes_classe, name='results_votes_classe'),
    path('access-closed/', views.access_closed, name='access_closed'),
    path('access-closed-vote/', views.access_closed_vote, name='access_closed_vote'),
    path('liste-admins/', views.liste_admins, name='liste_codes_admins'),
    path('supprimer-admin/', views.supprimer_admin, name='supprimer_admin'),
    path('obtenir-matricule/', views.obtenir_matricule_view, name='obtenir_matricule'),
    path('importer-emails/', views.importer_emails_autorises_view, name='importer_emails_autorises'),
    path('reinitialiser/<int:email_id>/', views.reinitialiser_matricule, name='reinitialiser_matricule'),
    path('supprimer/<int:email_id>/', views.supprimer_email_autorise, name='supprimer_email_autorise'),
    path('reset-codes/<int:classe_id>/', views.reset_codes_view, name='reset_codes'),
    path('resultats/pdf/', views.generate_pdf_report, name='generate_pdf_report'),
    path('reset-affichage/<int:classe_id>/', views.reset_affichage_codes, name='reset_affichage_codes'),
]
