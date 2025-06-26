from django.contrib import admin
from .models import Voter, Vote, Poste, Candidat, VoteParPoste, ResponsableClassePoste, ResponsableClasseCandidat, VoteResponsableClasse, Club, ClubCandidat, VoteClub, AccessControl, EmailAutorise
from django.urls import path
from django.shortcuts import redirect
from django.utils.html import format_html
from .views import upload_candidats
import openpyxl
from .forms import UploadCandidatExcelForm
from django.contrib import messages
from django.template.response import TemplateResponse
from .forms import CandidatForm




# Enregistrement des modèles dans l’admin
admin.site.register(Vote)
admin.site.register(Poste)
admin.site.register(VoteParPoste)
admin.site.register(VoteResponsableClasse)
admin.site.register(ResponsableClassePoste)
admin.site.register(ResponsableClasseCandidat)
admin.site.register(ClubCandidat)
admin.site.register(Club)
admin.site.register(VoteClub)
admin.site.register(EmailAutorise)





@admin.register(Voter)
class VoterAdmin(admin.ModelAdmin):
    # Soit rendre filiere readonly (visible mais non modifiable)
    readonly_fields = ('filiere',)

    # Optionnel : pour contrôler l'ordre et les champs affichés
    fields = ('matricule', 'has_voted', 'classe', 'filiere')

    # Optionnel : si tu préfères masquer filiere complètement, utilise exclude
    # exclude = ('filiere',)

@admin.register(Candidat)
class CandidatAdmin(admin.ModelAdmin):
    form = CandidatForm



@admin.register(AccessControl)
class AccessControlAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_open')
    list_editable = ('is_open',)
    actions = ['open_access', 'close_access']

    def open_access(self, request, queryset):
        queryset.update(is_open=True)
    open_access.short_description = "Ouvrir l'accès"

    def close_access(self, request, queryset):
        queryset.update(is_open=False)
    close_access.short_description = "Fermer l'accès"


"""
@admin.register(Candidat)
class CandidatAdmin(admin.ModelAdmin):
    change_list_template = "admin/vote/candidat/change_list.html"  # ce template ajoutera le bouton

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'importer-candidats/',
                self.admin_site.admin_view(self.import_candidats),
                name='vote_candidat_importer_candidats'  # <- nom interne à l'admin
            ),
        ]
        return custom_urls + urls

    def import_candidats(self, request):
        if request.method == "POST":
            form = UploadCandidatExcelForm(request.POST, request.FILES)
            if form.is_valid():
                excel_file = request.FILES["file"]
                wb = openpyxl.load_workbook(excel_file)
                sheet = wb.active
                for row in sheet.iter_rows(min_row=2, values_only=True):
                    nom, prenom, poste_id = row
                    Candidat.objects.create(nom=nom, prenom=prenom, poste_id=poste_id)
                self.message_user(request, "Importation réussie !", level=messages.SUCCESS)
                return redirect("..")
        else:
            form = UploadCandidatExcelForm()

        context = {
            "form": form,
            "title": "Importer des candidats",
        }
        return TemplateResponse(request, "admin/import_excel_form.html", context)
"""