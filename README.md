# Permini - Système de Gestion d'Auto-École

Permini est une application web complète de gestion d'auto-école développée spécialement pour le marché tunisien. Elle permet aux auto-écoles de gérer efficacement leurs étudiants, moniteurs, véhicules, emplois du temps, examens et paiements.

## 🚀 Fonctionnalités Principales

### 🏠 Page d'Accueil
- Design responsive moderne
- Header avec logo, connexion/inscription, mode sombre/clair
- Sélecteur de langue (Français/Arabe)
- Bannière d'offre spéciale (30 jours gratuits)
- Section héro avec CTA "Commencer maintenant" et "Voir la démo"

### 📝 Inscription Auto-École
- Formulaire d'inscription complet avec informations professionnelles
- Upload de documents légaux (CIN, documents officiels)
- Système de vérification par email
- Processus d'approbation par l'administrateur

### 💼 Plans d'Abonnement
- **Plan Gratuit** : 30 jours, 50 comptes maximum
- **Plan Standard** : 100 comptes + 50 à chaque renouvellement
- **Plan Premium** : Comptes illimités + fonctionnalités avancées

### 🎛️ Dashboard Auto-École
- Barre de progression de l'essai gratuit
- Statistiques générales
- Gestion des équipes (moniteurs)
- Gestion des véhicules
- Gestion des candidats
- Emploi du temps interactif
- Suivi des examens
- Gestion des paiements
- Comptabilité avancée (Premium)
- Système de messagerie (Premium)

### 👥 Gestion des Utilisateurs
- **Moniteurs** : Profils complets, types de permis, assignation véhicules
- **Candidats** : Suivi formation, progression, tentatives examens
- **Auto-écoles** : Informations complètes, documents légaux

### 🚗 Gestion des Véhicules
- Informations complètes des véhicules
- Suivi visite technique et assurance
- Gestion avancée des dépenses (Premium)
- Assignation aux moniteurs

## 🛠️ Technologies Utilisées

### Backend
- **Django 5.2.3** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de données (via Supabase)
- **Python-decouple** - Gestion des variables d'environnement
- **Pillow** - Traitement d'images

### Frontend (À venir)
- **React** - Framework JavaScript
- **Tailwind CSS** - Framework CSS
- **Vite** - Build tool

### Base de Données
- **Supabase** - Backend-as-a-Service avec PostgreSQL

## 📁 Structure du Projet

```
Permini/
├── backend/
│   ├── accounts/           # Gestion des utilisateurs
│   ├── driving_schools/    # Gestion des auto-écoles
│   ├── instructors/        # Gestion des moniteurs
│   ├── students/          # Gestion des candidats
│   ├── vehicles/          # Gestion des véhicules
│   ├── schedules/         # Gestion des emplois du temps
│   ├── exams/            # Gestion des examens
│   ├── payments/         # Gestion des paiements
│   ├── messaging/        # Système de messagerie
│   └── permini_project/  # Configuration Django
└── frontend/             # Application React (à créer)
```

## 🚀 Installation Rapide avec Docker (Recommandé)

### Prérequis
- Docker Desktop
- Git

### Lancement en 3 étapes
```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE-USERNAME/permini-auto-ecole.git
cd permini-auto-ecole

# 2. Configurer l'environnement
cp backend/.env.example backend/.env
# Éditez backend/.env avec vos vraies valeurs

# 3. Lancer l'application
docker-compose up --build
```

**🎉 Votre application est accessible sur :**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:3000/admin

### Commandes Docker Utiles
```bash
# Mode développement (avec hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Reconstruire complètement
docker-compose up --build --force-recreate
```

## 🛠️ Installation Manuelle (Développement)

### Prérequis
- Python 3.8+
- Node.js 16+
- PostgreSQL (ou compte Supabase)

### Backend Setup

1. **Cloner le projet**
```bash
git clone <repository-url>
cd Permini/backend
```

2. **Créer l'environnement virtuel**
```bash
python -m venv venv
# Windows
.\venv\Scripts\Activate.ps1
# Linux/Mac
source venv/bin/activate
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configuration des variables d'environnement**
Copier `.env.example` vers `.env` et configurer :
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_supabase_host
DB_PORT=5432
```

5. **Appliquer les migrations**
```bash
python manage.py migrate
```

6. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```

7. **Lancer le serveur de développement**
```bash
python manage.py runserver
```

## 📊 Modèles de Données

### Utilisateurs (User)
- Modèle utilisateur personnalisé avec types (admin, auto-école, moniteur, candidat)
- Système de vérification par email
- Gestion des photos et documents

### Auto-écoles (DrivingSchool)
- Informations complètes de l'auto-école
- Gestion des plans d'abonnement
- Personnalisation (thème, couleurs)
- Suivi des limites de comptes

### Moniteurs (Instructor)
- Profils détaillés des moniteurs
- Types de permis enseignés
- Assignation aux véhicules

### Candidats (Student)
- Informations personnelles et de formation
- Suivi de progression (code/conduite)
- Gestion des paiements (fixe/horaire)

### Véhicules (Vehicle)
- Informations techniques complètes
- Suivi maintenance et assurance
- Dépenses détaillées (Premium)

## 🔐 Sécurité

- Authentification par tokens
- Vérification par email
- Validation des documents
- Permissions basées sur les rôles
- Protection CORS configurée

## 🌍 Internationalisation

- Support Français/Arabe
- Fuseau horaire Tunisie
- Formats de dates localisés

## 📈 Prochaines Étapes

1. ✅ Configuration backend Django
2. ⏳ Création des modèles restants (schedules, exams, payments, messaging)
3. ⏳ Développement des APIs REST
4. ⏳ Création du frontend React
5. ⏳ Intégration Supabase
6. ⏳ Tests et déploiement

## 🤝 Contribution

Ce projet est en développement actif. Les contributions sont les bienvenues !

## 📄 Licence

Tous droits réservés - Permini 2025
