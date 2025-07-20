# Dockerfile pour Railway (à la racine)
FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Variables d'environnement pour Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Installer les dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de requirements depuis backend
COPY backend/requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code backend
COPY backend/ .

# Créer les répertoires pour les fichiers statiques et media
RUN mkdir -p /app/staticfiles /app/media /app/media/users /app/media/users/photos

# Créer un fichier de test pour vérifier que les media fonctionnent
RUN echo "Test image file" > /app/media/users/photos/test.txt

# Créer un fichier de test dans media
RUN echo "Test media file" > /app/media/test.txt

# Copier et rendre exécutable le script d'entrée
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exposer le port
EXPOSE 8000

# Script de démarrage
ENTRYPOINT ["/entrypoint.sh"]
