# Configuration du Pixel Meta pour la production

Ce document explique comment configurer et utiliser le Pixel Meta pour le suivi des événements dans l'application EVOLAINE.

## Configuration requise

1. Un ID de pixel Meta valide (ex: `743290068698217`)
2. Accès aux paramètres de l'application sur la plateforme Meta Business

## Configuration de l'environnement

Créez un fichier `.env.production` à la racine du projet avec les variables suivantes :

```env
# Configuration de l'API
VITE_API_BASE_URL=https://evolaine-backend.onrender.com

# Environnement
VITE_APP_ENV=production

# Configuration du Pixel Meta
VITE_META_PIXEL_ID=743290068698217
VITE_ENABLE_ANALYTICS=true
```

## Événements suivis

L'application envoie automatiquement les événements suivants à Meta Pixel :

1. **PageView** : Chargement d'une page
2. **ViewContent** : Visualisation d'un produit
3. **AddToCart** : Ajout d'un produit au panier
4. **InitiateCheckout** : Début du processus de paiement
5. **Purchase** : Achat complété

## Désactivation en développement

En mode développement, le Pixel Meta est désactivé par défaut pour éviter d'envoyer des données de test. Vous pouvez le forcer en définissant :

```env
VITE_ENABLE_ANALYTICS=true
```

## Vérification du bon fonctionnement

1. Ouvrez les outils de développement du navigateur (F12)
2. Allez dans l'onglet "Réseau"
3. Filtrez par "facebook" ou "fb"
4. Effectuez des actions dans l'application
5. Vérifiez que les requêtes sont bien envoyées à Meta

## Dépannage

### Le Pixel ne s'initialise pas

- Vérifiez que `VITE_META_PIXEL_ID` est correctement défini
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que le domaine est autorisé dans les paramètres du pixel Meta

### Les événements ne sont pas enregistrés

- Vérifiez que `VITE_ENABLE_ANALYTICS` est défini sur `true`
- Vérifiez que le code de suivi est correctement intégré dans les composants
- Vérifiez les règles de filtrage dans le gestionnaire d'événements Meta

## Bonnes pratiques

- Ne modifiez pas directement `facebookPixel.ts` sauf si nécessaire
- Utilisez le hook `useTrackCart` pour suivre les interactions utilisateur
- Testez toujours les événements en environnement de test avant la production
- Consultez régulièrement les rapports d'événements dans le Gestionnaire d'événements Meta
