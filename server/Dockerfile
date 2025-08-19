# Étape de construction
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN npm run build

# Étape d'exécution
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js .

# Exposer le port
EXPOSE 3004

# Commande de démarrage
CMD ["node", "server.js"]
