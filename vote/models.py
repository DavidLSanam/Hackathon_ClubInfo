from django.db import models
from django.contrib.auth.models import User
import random, string


# models.py
class Voter(models.Model):
    FILIERE_CHOICES = [
        ('ISE', 'ISE'),
        ('AS', 'AS'),
    ]
    
    CLASS_CHOICES = [
        ('ISEP 1', 'ISEP 1'),
        ('ISEP 2', 'ISEP 2'),
        ('ISE 1 - cycle long', 'ISE 1 - cycle long'),
        ('ISE 1 - Maths', 'ISE 1 - Maths'),
        ('ISE 1 - Eco', 'ISE 1 - Eco'),
        ('ISE 2', 'ISE 2'),
        ('ISE 3', 'ISE 3'),
        ('AS 1', 'AS 1'),
        ('AS 2', 'AS 2'),
        ('AS 3', 'AS 3'),
    ]

    # Mapping classe → filiere
    CLASS_TO_FILIERE = {
        'ISEP 1': 'ISE',
        'ISEP 2': 'ISE',
        'ISE 1 - cycle long': 'ISE',
        'ISE 1 - Maths': 'ISE',
        'ISE 1 - Eco': 'ISE',
        'ISE 2': 'ISE',
        'ISE 3': 'ISE',
        'AS 1': 'AS',
        'AS 2': 'AS',
        'AS 3': 'AS',
    }

    matricule = models.CharField(max_length=50, unique=True)
    has_voted = models.BooleanField(default=False)
    classe = models.CharField(max_length=30, choices=CLASS_CHOICES, default="ISEP 1")
    filiere = models.CharField(max_length=10, choices=FILIERE_CHOICES, default="ISE")

    date_attribution = models.DateTimeField(null=True, blank=True)


    is_admin = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Mise à jour automatique de filiere selon classe
        if self.classe in self.CLASS_TO_FILIERE:
            self.filiere = self.CLASS_TO_FILIERE[self.classe]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.matricule} - {self.classe}"



class Admin(models.Model):
    matricule = models.CharField(max_length=50, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    est_actif = models.BooleanField(default=True)

    def __str__(self):
        return self.matricule


class Election(models.Model):
    title = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Candidate(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} - {self.election.title}"

class Vote(models.Model):
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('voter', 'candidate')

class Poste(models.Model):
    nom = models.CharField(max_length=100)
    code = models.PositiveIntegerField(unique=True, help_text="Code hiérarchique du poste (plus petit = plus élevé dans la hiérarchie)")

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['code']  # Pour trier automatiquement par hiérarchie


class Candidat(models.Model):
    nom = models.CharField(max_length=200)
    poste = models.ForeignKey(Poste, on_delete=models.CASCADE, related_name='candidats')
    photo = models.ImageField(upload_to='candidats/', null=True, blank=True)
    classe = models.CharField(max_length=100, choices=Voter.CLASS_CHOICES, null=True, blank=True)
    filiere = models.CharField(max_length=100, choices=Voter.FILIERE_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"{self.nom} - {self.poste.nom}"



from django import forms
from .models import Candidat

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

class VoteParPoste(models.Model):
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE)
    candidat = models.ForeignKey(Candidat, on_delete=models.CASCADE)
    poste = models.ForeignKey(Poste, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('voter', 'poste')  # 1 seul vote par poste par électeur



################GESTION DES MATRICULES################



import random
import string
from .models import Voter  # si ce n'est pas déjà importé

class EffectifClasse(models.Model):
    classe = models.CharField(max_length=100, unique=True)
    nombre_eleves = models.PositiveIntegerField()
    codes_genere = models.BooleanField(default=False)

    def generer_codes(self):
        """
        Génère les codes manquants pour cette classe sans supprimer les existants.
        """
        deja_generes = Voter.objects.filter(classe=self.classe).count()
        a_generer = self.nombre_eleves - deja_generes

        if a_generer <= 0:
            # Aucun code supplémentaire nécessaire
            return

        for _ in range(a_generer):
            code = self._generer_code_unique()
            Voter.objects.create(matricule=code, classe=self.classe)

        self.codes_genere = True
        self.save()

    def _generer_code_unique(self, longueur=6):
        """
        Génère un code alphanumérique unique de longueur donnée.
        """
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=longueur))
            if not Voter.objects.filter(matricule=code).exists():
                return code








##############ENREGISTREMENT DES CODES CREES###############



#class CodeVote(models.Model):
#   code = models.CharField(max_length=10, unique=True)
#    classe = models.CharField(max_length=50)
#    filiere = models.CharField(max_length=50)
#    date_generee = models.DateTimeField(auto_now_add=True)
#
#    def __str__(self):
#        return f"{self.code} ({self.classe} - {self.filiere})"





##############GESTION ELECTION###############




class ElectionConfig(models.Model):
    votes_ouverts = models.BooleanField(default=False)
    candidatures_ouvertes = models.BooleanField(default=False)

    def __str__(self):
        return "Configuration actuelle de l'élection"

    class Meta:
        verbose_name = "Configuration de l'élection"
        verbose_name_plural = "Configurations"

##############RESPONSABLES PAR CLASSES######################


class ResponsableClassePoste(models.Model):
    """Postes spécifiques pour les responsables de classe"""
    nom = models.CharField(max_length=100, unique=True)
    ordre = models.PositiveIntegerField(help_text="Ordre d'affichage")
    
    class Meta:
        ordering = ['ordre']
    
    def __str__(self):
        return self.nom

class ResponsableClasseCandidat(models.Model):
    """Candidats pour les postes de responsables de classe"""
    nom = models.CharField(max_length=200)
    poste = models.ForeignKey(ResponsableClassePoste, on_delete=models.CASCADE, related_name='candidats')
    photo = models.ImageField(upload_to='responsables_classe/', blank=True, null=True)
    classe = models.CharField(max_length=30, choices=Voter.CLASS_CHOICES)
    filiere = models.CharField(max_length=10, choices=Voter.FILIERE_CHOICES, blank=True, null=True)
    matricule = models.CharField(max_length=50, blank=True, null=True)
    programme = models.TextField(blank=True)  # Ajout du champ manquant
    
    def __str__(self):
        return f"{self.nom} ({self.classe}) - {self.poste}"
    
    class Meta:
        unique_together = ('matricule', 'poste')  # Empêche les candidatures multiples à un même poste

class VoteResponsableClasse(models.Model):
    """Votes pour les responsables de classe"""
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE)
    candidat = models.ForeignKey(ResponsableClasseCandidat, on_delete=models.CASCADE)
    poste = models.ForeignKey(ResponsableClassePoste, on_delete=models.CASCADE)
    date_vote = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('voter', 'poste')  # 1 vote par poste par électeur



##############PRESIDENTS CLUBS######################



class Club(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='clubs/logos/', blank=True, null=True)
    
    def __str__(self):
        return self.nom

class ClubCandidat(models.Model):
    nom = models.CharField(max_length=200)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='candidats')
    photo = models.ImageField(upload_to='clubs/candidats/')
    slogan = models.CharField(max_length=200, blank=True)
    programme = models.TextField(blank=True)
    # Ajoutez ces deux champs
    classe = models.CharField(max_length=30, choices=Voter.CLASS_CHOICES, blank=True, null=True)
    filiere = models.CharField(max_length=10, choices=Voter.FILIERE_CHOICES, blank=True, null=True)
    
    def __str__(self):
        return f"{self.nom} ({self.club.nom})"

class VoteClub(models.Model):
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE)
    candidat = models.ForeignKey(ClubCandidat, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    date_vote = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('voter', 'club')  # 1 vote par club par électeur



##############REDIRECTIONS######################


class AccessControl(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_open = models.BooleanField(default=False)
    closed_message = models.TextField(default="Les inscriptions sont fermées pour le moment.")
    redirect_url = models.CharField(max_length=200, default='/')

    def __str__(self):
        return self.name


class Configuration(models.Model):
    candidatures_ouvertes = models.BooleanField(default=False)
    votes_ouverts = models.BooleanField(default=False)
    
    @classmethod
    def get_config(cls):
        # S'assure qu'il n'y a qu'une seule configuration
        config, created = cls.objects.get_or_create(pk=1)
        return config
    

from django.db import models

class EmailAutorise(models.Model):
    email = models.EmailField(unique=True)
    classe = models.CharField(max_length=50)
    matricule_attribue = models.CharField(max_length=50, blank=True, null=True)  # <- AJOUT

    def __str__(self):
        return f"{self.email} ({self.classe})"
