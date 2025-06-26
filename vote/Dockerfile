FROM python:3.12-slim

# Installer les dépendances nécessaires à WeasyPrint
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    libcairo2 \
    libpangocairo-1.0-0 \
    fonts-liberation \
    curl \
    && apt-get clean

# Créer et activer un dossier de travail
WORKDIR /app

# Copier les fichiers
COPY . /app

# Installer les dépendances Python
RUN pip install --upgrade pip
RUN pip install -r elections_project/requirements.txt

# Lancer le serveur Django
CMD ["python", "elections_project/manage.py", "runserver", "0.0.0.0:8000"]
