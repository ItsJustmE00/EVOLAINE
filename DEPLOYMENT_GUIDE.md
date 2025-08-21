# Guide de Déploiement EVOLAINE

## 📋 Checklist Pré-déploiement

### ✅ Frontend
- [x] Build de production réussi (`npm run build`)
- [x] Configuration Vite optimisée
- [x] Assets et images optimisés
- [x] Variables d'environnement configurées
- [x] TypeScript sans erreurs (erreurs i18n corrigées)
- [ ] Tests unitaires passés
- [ ] Tests E2E validés

### ✅ Backend
- [x] Configuration Express sécurisée
- [x] Base de données PostgreSQL configurée
- [x] Variables d'environnement définies
- [x] CORS configuré correctement
- [x] JWT secret généré
- [ ] Endpoints API testés
- [ ] Connexion DB vérifiée en production

### ✅ Infrastructure
- [x] Configuration Vercel (`vercel.json`)
- [x] Configuration Render (`render.yaml`)
- [x] Configuration Netlify (`netlify.toml`)
- [x] SSL/HTTPS configuré
- [ ] Domaine personnalisé configuré
- [ ] DNS configuré

## 🚀 Déploiement sur Vercel (Frontend)

### 1. Installation Vercel CLI
```bash
npm i -g vercel
```

### 2. Connexion à Vercel
```bash
vercel login
```

### 3. Déploiement
```bash
cd project
vercel --prod
```

### 4. Variables d'environnement sur Vercel
Ajouter dans le dashboard Vercel :
```
VITE_API_BASE_URL=https://evolaine-backend.onrender.com
VITE_APP_ENV=production
```

## 🚀 Déploiement sur Render (Backend)

### 1. Créer un nouveau Web Service sur Render

1. Connecter votre repository GitHub
2. Sélectionner la branche `main`
3. Configuration :
   - **Build Command**: `cd server && npm ci`
   - **Start Command**: `cd server && node server.js`
   - **Environment**: Node
   - **Region**: Frankfurt (EU)

### 2. Créer une base de données PostgreSQL

1. Créer un nouveau PostgreSQL sur Render
2. Noter les credentials de connexion
3. Configurer la connexion SSL

### 3. Variables d'environnement sur Render

```env
NODE_ENV=production
PORT=3004
JWT_SECRET=[générer un secret sécurisé]
DATABASE_URL=[URL PostgreSQL de Render]
ALLOWED_ORIGINS=https://evolaine.vercel.app,https://votre-domaine.com
```

## 🚀 Déploiement sur Netlify (Alternative Frontend)

### 1. Via Netlify CLI
```bash
npm i -g netlify-cli
netlify login
cd project
netlify deploy --prod
```

### 2. Configuration Build
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18.x

### 3. Variables d'environnement Netlify
```
VITE_API_BASE_URL=https://evolaine-backend.onrender.com
VITE_APP_ENV=production
```

## 🔧 Configuration Post-déploiement

### 1. Vérification des endpoints

```bash
# Tester l'API
curl https://evolaine-backend.onrender.com/api/health

# Tester le frontend
curl https://evolaine.vercel.app
```

### 2. Monitoring et Logs

#### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: Onglet "Functions" → "Logs"

#### Render
- Dashboard: https://dashboard.render.com
- Logs: Service → "Logs" tab

### 3. Configuration du domaine personnalisé

#### Sur Vercel
1. Settings → Domains
2. Ajouter votre domaine
3. Configurer DNS :
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### Sur Render
1. Settings → Custom Domains
2. Ajouter votre domaine
3. Suivre les instructions DNS

## 🐛 Troubleshooting

### Erreur CORS
```javascript
// Vérifier dans server.js
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
```

### Erreur de connexion DB
```javascript
// Vérifier SSL en production
ssl: {
  rejectUnauthorized: false
}
```

### Build échoué sur Vercel
```bash
# Vérifier les versions Node
"engines": {
  "node": ">=18.0.0"
}
```

### Variables d'environnement non chargées
```javascript
// Frontend: utiliser VITE_ prefix
VITE_API_BASE_URL=...

// Backend: vérifier dotenv
require('dotenv').config();
```

## 📊 Monitoring et Performance

### Outils recommandés
- **Sentry** pour le tracking d'erreurs
- **Google Analytics** pour les métriques
- **Lighthouse** pour les audits performance
- **Uptime Robot** pour la disponibilité

### Métriques à surveiller
- Temps de réponse API < 200ms
- Core Web Vitals (LCP, FID, CLS)
- Taux d'erreur < 1%
- Uptime > 99.9%

## 🔄 CI/CD avec GitHub Actions

### Workflow de déploiement automatique

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd project && npm ci
      - run: cd project && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./project
```

## 📝 Checklist Finale

- [ ] Site accessible en HTTPS
- [ ] Toutes les pages chargent correctement
- [ ] API répond aux requêtes
- [ ] Authentification fonctionne
- [ ] Panier et checkout opérationnels
- [ ] Emails transactionnels configurés
- [ ] Backup de la base de données configuré
- [ ] Monitoring en place
- [ ] Documentation à jour
- [ ] Équipe notifiée du déploiement

## 🆘 Support et Contacts

- **Urgences Production**: oncall@evolaine.com
- **Support Technique**: tech@evolaine.com
- **Status Page**: https://status.evolaine.com

---

📅 Dernière mise à jour: Décembre 2024
🔖 Version: 1.0.0
