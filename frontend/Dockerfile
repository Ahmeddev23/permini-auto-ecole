# Étape 1: Build de l'application React
FROM node:18-alpine as build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (dev incluses pour le build)
RUN npm ci

# Copier le fichier d'environnement Docker
COPY .env.docker .env

# Copier le code source
COPY . .

# Vérifier que Vite est installé
RUN npx vite --version

# Construire l'application pour la production
RUN npm run build

# Vérifier que le build a été créé
RUN ls -la dist/

# Étape 2: Servir l'application avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
