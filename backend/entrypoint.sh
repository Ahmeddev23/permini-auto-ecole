#!/bin/bash

# Attendre que la base de données soit prête
echo "Waiting for database..."
python manage.py migrate --check
while [ $? -ne 0 ]; do
    echo "Database not ready, waiting..."
    sleep 2
    python manage.py migrate --check
done

echo "Database is ready!"

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
exec daphne -p 8000 -b 0.0.0.0 permini_project.asgi:application
