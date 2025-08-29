# Déploiement sur Vercel

Ce guide explique comment déployer l'application EVOLAINE sur Vercel.

## Prérequis

- Un compte [Vercel](https://vercel.com)
- Un compte [GitHub](https://github.com)
- Le code source de l'application disponible sur un dépôt GitHub

## Étapes de déploiement

### 1. Configuration de l'application

Assurez-vous que votre application est correctement configurée :

- Vérifiez que le fichier `package.json` contient les scripts nécessaires
- Vérifiez que le fichier `vite.config.ts` est correctement configuré
- Vérifiez que tous les fichiers de configuration sont présents

### 2. Préparation du déploiement

1. Poussez votre code sur votre dépôt GitHub
2. Connectez-vous à votre compte Vercel
3. Cliquez sur "New Project"
4. Sélectionnez votre dépôt GitHub

### 3. Configuration du projet

1. Dans les paramètres du projet, configurez les variables d'environnement nécessaires
2. Assurez-vous que le framework est détecté comme Vite
3. Vérifiez que le répertoire de sortie est défini sur `dist`

### 4. Déploiement

1. Cliquez sur "Deploy"
2. Attendez que le déploiement se termine
3. Vérifiez les logs de déploiement pour détecter d'éventuelles erreurs

## Configuration avancée

### Variables d'environnement

Assurez-vous de configurer les variables d'environnement suivantes dans les paramètres du projet Vercel :

- `VITE_API_BASE_URL`: L'URL de base de l'API backend
- `NODE_ENV`: `production`
- Toutes les autres variables d'environnement nécessaires à votre application

### Scripts personnalisés

Si nécessaire, vous pouvez personnaliser les scripts de build dans le fichier `package.json` :

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "vercel-build": "vite build --mode production"
}
```

## Dépannage

### Le déploiement échoue

1. Vérifiez les logs de déploiement pour identifier l'erreur
2. Assurez-vous que toutes les dépendances sont correctement installées
3. Vérifiez que le répertoire de sortie est correctement configuré

### L'application ne se charge pas

1. Vérifiez que le fichier `index.html` est correctement généré dans le répertoire de sortie
2. Vérifiez que les chemins des ressources sont corrects
3. Vérifiez la console du navigateur pour des erreurs JavaScript

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le dépôt GitHub du projet.
