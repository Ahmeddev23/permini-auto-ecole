# Backend Installation Guide
# Backend Installation Guide

This guide provides step-by-step instructions to set up the backend environment for the Permini project.

## Prerequisites

- Python 3.8 or higher installed on your system
- Git (if cloning the repository)

## Installation Steps

### 1. Remove Old Virtual Environment (if exists)

```powershell
# Navigate to the backend directory
cd backend

# Remove the existing virtual environment
Remove-Item -Recurse -Force "venv" -ErrorAction SilentlyContinue
```

### 2. Create New Virtual Environment

```powershell
# Create a new virtual environment
python -m venv venv
```

### 3. Activate Virtual Environment

```powershell
# Activate the virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# For Command Prompt (cmd)
# venv\Scripts\activate.bat

# For Git Bash or Linux/Mac
# source venv/bin/activate
```

**Note:** After activation, you should see `(venv)` at the beginning of your command prompt.

### 4. Upgrade pip (Optional but Recommended)

```powershell
python -m pip install --upgrade pip
```

### 5. Install Dependencies

```powershell
# Install all required packages from requirements.txt
pip install -r requirements.txt
```

This will install:
- Django 5.2.3
- Django REST Framework 3.16.0
- django-cors-headers 4.7.0
- django-extensions 4.1
- Pillow 11.2.1
- psycopg2-binary 2.9.10
- python-decouple 3.8
- sqlparse 0.5.3
- tzdata 2025.2
- asgiref 3.8.1

### 6. Database Setup (if needed)

```powershell
# Apply database migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser
```

### 7. Run the Development Server

```powershell
# Start the Django development server
python manage.py runserver

# Or specify a custom port
# python manage.py runserver 8080
```

The server will start at `http://127.0.0.1:8000/` by default.

## Additional Commands

### Collect Static Files (if needed)
```powershell
python manage.py collectstatic
```

### Run Tests
```powershell
python manage.py test
```

### Create New App
```powershell
python manage.py startapp app_name
```

### Make Migrations (after model changes)
```powershell
python manage.py makemigrations
python manage.py migrate
```

## Deactivating Virtual Environment

When you're done working, you can deactivate the virtual environment:

```powershell
deactivate
```

## Troubleshooting

### Python Not Found
If you get "Python is not found" error:
1. Install Python from https://www.python.org/downloads/
2. Make sure to check "Add Python to PATH" during installation
3. Restart your terminal/command prompt

### Permission Issues (Windows)
If you get execution policy errors when activating the virtual environment:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
If port 8000 is already in use:
```powershell
python manage.py runserver 8080
```

## Quick Setup Script

For convenience, here's a complete setup script:

```powershell
# Navigate to backend directory
cd backend

# Remove old venv and create new one
Remove-Item -Recurse -Force "venv" -ErrorAction SilentlyContinue
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```

## Environment Variables

Make sure to set up your environment variables in a `.env` file if required by the project. Check the project documentation for specific environment variables needed.


daphne -p 8000 permini_project.asgi:application