#!/bin/bash

# Attendre que la base de données soit prête (version simplifiée)
echo "Waiting for database..."
sleep 5

# Exécuter les migrations
echo "Running migrations..."
python manage.py migrate

# Collecter les fichiers statiques
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Vérifier que les fichiers statiques sont bien là
echo "Checking static files..."
ls -la /app/staticfiles/
ls -la /app/staticfiles/admin/ || echo "Admin static files not found!"

# Créer un superuser si nécessaire (optionnel)
# echo "Creating superuser..."
# python manage.py shell -c "
# from django.contrib.auth import get_user_model;
# User = get_user_model();
# User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
# "

# Démarrer l'application
echo "Starting application..."
PORT=${PORT:-8000}
echo "Using port: $PORT"
exec daphne -p $PORT -b 0.0.0.0 permini_project.asgi:application
