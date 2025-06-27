# Système de vote en ligne pour l'ENSAE

Une plateforme complète de gestion des élections étudiantes avec différents types de scrutins et une administration centralisée.

## Fonctionnalités Principales

**Multi-types de votes**:
- Élections du bureau AES
- Élections des responsables de classe
- Élections des présidents de clubs

**Gestion complète**:
- Candidatures en ligne avec dépôt de programmes
- Authentification sécurisée par matricule
- Tableau de bord administratif complet
- Génération de rapports PDF détaillés

**Expérience électorale**:
- Interface de vote intuitive
- Résultats en temps réel avec visualisations
- Confirmation de vote

**Sécurité**:
- Protection contre le vote multiple
- Journalisation des actions sensibles
- Contrôle d'accès granulaire

## Détails techniques

On commence par collecter les adresses mails de tous les étudiants et on les regroupe dans un fichier excel avec deux colonnes (classe et email). Ensuite, on génère des codes (matricules) en fonction des effectifs des classes. Ainsi lorsqu'un utilisateur se connecte à l'application et qu'il clique sur "Commencer à voter", il est redirrigé vers une page "Obtenir mon matricule", puis il entre son adresse mail fournie lors de la collecte. Si son adresse mail est reconnue, le système lui attribue automatiquement l'un des matricules générés disponibles pour sa classe. Ensuite il peut accéder à la page de connexion, entrer son matricule et se connecter.

Maintenant, on distingue trois types de votes dans notre application.
L'élève connecté peut donc depuis la page vote accéssible dans le menu, choisir le type de vote. 

### 1. VOTE_BUREAU_AES
Il retrouve les différents postes disponibles et les différents candidats. Pour chaque poste il ne peut voter qu'une seule fois.

### 2. VOTE_PRESIDENTS_CLUBS
Il retrouve les différents clubs et pour chaque clubs les différents candidats.
Pour chaque candidat il peut voir son slogan, son programme et ne peut voter qu'une seule fois pour chaque club.

### 3. VOTE_RESPONSABLES_CLASSES
Ici en fonction de son matricule, l'étudiant est redirrigé directement vers les candidats de sa classe et pour chaque poste il ne peut voter qu'une seule fois.

### 4. CANDIDATUREs
Via l'onglet "Postuler" dans le menu, chaque étudiant peut candidater pour un type de vote. Une seule candidature possible pour un type de vote. Pour les responsables de classe il est automatiquement redirrigé vers le formulaire correspondant à sa classe.

### RESULTATS
Pour chaque type de vote, on a des pages de résulats interactives et dynamiques (classements, graphiques...)


## ADMINISTRATION

Outre l'import des emails et la génération de matricules, les administrateurs ont plusieurs actions spéciales qui leurs sont réservées.
- Ajout et suppression d'électeurs
- Ajout et suppression de candidatures
- Contrôle des votes et résultats. Ils peuvent fermer/ouvrir les votes à tout moment.
- Toujours dans la vue admin, on peut générer, contrôler et supprimer un certain nombre de matricules administrateurs pour les membres du commité electoral au besoin. Seul un utilisateur connecté avec un matricule administrateur a accès à la page "Administration" dans le menu.
- Générer des rapports pdf sur les votes

<<<<<<< HEAD
Toutes les autres fonctionnalités sont disponibles dans l'application.
=======
Toutes les autres fonctionnalités sont disponibles dans l'application.
Points de connexion disponibles :
Matricule classique : 77188
Matricule admin : 77187

Actuellement, toutes les fonctionnalités ne sont pas opérationnelles à 100%, le développement est toujours en cours et sera finalisé sous peu au cas où l'application serait retenue.
>>>>>>> c756550c3ef57003bc05656fd0ed77c6f3519a59
