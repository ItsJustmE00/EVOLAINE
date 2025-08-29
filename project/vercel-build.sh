#!/bin/bash

# Activer le mode de débogage
set -x

# Afficher les variables d'environnement
echo "=== Variables d'environnement ==="
printenv

# Installer les dépendances
echo "=== Installation des dépendances ==="
npm install --legacy-peer-deps

# Vérifier l'installation
echo "=== Vérification de l'installation ==="
npm list --depth=0

# Exécuter le build
echo "=== Exécution du build ==="
npm run build

# Vérifier que le répertoire de build existe
if [ ! -d "dist" ]; then
  echo "ERREUR : Le répertoire de build 'dist' n'a pas été créé"
  exit 1
fi

echo "=== Contenu du répertoire de build ==="
ls -la dist/

echo "=== Build terminé avec succès ==="
