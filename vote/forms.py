from django import forms
from .models import Candidat, Voter, EffectifClasse, Poste, Club, ClubCandidat, ResponsableClassePoste
from django.core.exceptions import ValidationError
class CandidatForm(forms.ModelForm):
    class Meta:
        model = Candidat
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Exemple simplifié : si on connaît la classe, on peut filtrer filiere
        classe = self.initial.get('classe') or self.data.get('classe')
        if classe:
            # Logique pour filtrer filiere selon classe, à définir
            # Par ex si classe commence par 'AS' alors filiere = 'AS' uniquement
            if classe.startswith('AS'):
                self.fields['filiere'].choices = [('AS', 'AS')]
            elif classe.startswith('ISE'):
                self.fields['filiere'].choices = [('ISE', 'ISE')]
            else:
                self.fields['filiere'].choices = Voter.FILIERE_CHOICES
        else:
            self.fields['filiere'].choices = Voter.FILIERE_CHOICES





class VoteForm(forms.Form):
    def __init__(self, *args, **kwargs):
        postes = kwargs.pop('postes')
        super().__init__(*args, **kwargs)
        for poste in postes:
            self.fields[f"poste_{poste.id}"] = forms.ChoiceField(
                label=poste.nom,
                choices=[(c.id, c.nom) for c in poste.candidats.all()],
                widget=forms.RadioSelect,
                required=True
            )

class UploadCandidatExcelForm(forms.Form):
    fichier_excel = forms.FileField(label="Fichier Excel (.xlsx)")


"""
####################VOTE RESPONSABLES CLASSE####################



class VoteResponsableClasseForm(forms.Form):
    def __init__(self, classe, *args, **kwargs):
        super().__init__(*args, **kwargs)
        candidats = ResponsableClasse.objects.filter(classe=classe)
        self.fields['vote'] = forms.ChoiceField(
            label=f"Vote pour le responsable de la classe {classe}",
            choices=[(c.id, c.nom) for c in candidats],
            widget=forms.RadioSelect,
            required=True
        )
"""


#################GESTION DES MATRICULES################


from django import forms
from .models import Voter

class SelectionClasseForm(forms.Form):
    classe = forms.ChoiceField(
        choices=Voter.CLASS_CHOICES,
        label="Sélectionnez une classe",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'id_classe'
        })
    )

class GenererCodesForm(forms.Form):
    nombre_a_generer = forms.IntegerField(
        min_value=1,
        label="Nombre de matricules à générer",
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'min': 1
        })
    )


#################GESTION DES CANDIDATURES################

class CandidatureForm(forms.Form):
    poste = forms.ModelChoiceField(queryset=Poste.objects.all(), label="Poste à pourvoir", required=True)
    prenom = forms.CharField(max_length=100, label="Prénom", required=True)
    nom = forms.CharField(max_length=100, label="Nom (en majuscule)", required=True)
    classe = forms.ChoiceField(choices=Voter.CLASS_CHOICES, label="Votre classe", required=True)
    photo = forms.ImageField(label="Photo", required=True)

    def clean_nom(self):
        nom = self.cleaned_data['nom']
        return nom.upper()


##############CANDIDATURES CLUBS######################



class ClubCandidatureForm(forms.Form):
    club = forms.ModelChoiceField(
        queryset=Club.objects.all(),
        label="Club",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    prenom = forms.CharField(
        max_length=100,
        label="Prénom",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    nom = forms.CharField(
        max_length=100,
        label="Nom (en majuscules)",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    photo = forms.ImageField(
        label="Photo de profil",
        required=True,
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )
    slogan = forms.CharField(
        max_length=200,
        required=False,
        label="Slogan (optionnel)",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    programme = forms.CharField(
        label="Programme et motivations",
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        required=True
    )

    def clean_nom(self):
        nom = self.cleaned_data['nom']
        return nom.upper()  # Force le nom en majuscules


class ResponsableClasseCandidatureForm(forms.Form):
    poste = forms.ModelChoiceField(
        queryset=ResponsableClassePoste.objects.all(),
        label="Poste à pourvoir",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    prenom = forms.CharField(
        max_length=100,
        label="Prénom",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    nom = forms.CharField(
        max_length=100,
        label="Nom (en majuscules)",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    photo = forms.ImageField(
        label="Photo de profil",
        required=True,
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )
    programme = forms.CharField(
        label="Programme et motivations",
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
        required=True
    )

    def clean_nom(self):
        nom = self.cleaned_data['nom']
        return nom.upper()  # Force le nom en majuscules
    


class UploadEmailsExcelForm(forms.Form):
    fichier_excel = forms.FileField(label="Fichier Excel (.xlsx) contenant les emails")