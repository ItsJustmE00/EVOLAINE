// vercel-build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== DÉBUT DU BUILD VERCEL ===');

// Vérifier les variables d'environnement
console.log('\n=== VARIABLES D\'ENVIRONNEMENT ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_APP_ENV:', process.env.VITE_APP_ENV);
console.log('VITE_META_PIXEL_ID:', process.env.VITE_META_PIXEL_ID);
console.log('VITE_ENABLE_ANALYTICS:', process.env.VITE_ENABLE_ANALYTICS);

// Créer un fichier .env.production temporaire
const envContent = `VITE_APP_ENV=production
VITE_META_PIXEL_ID=${process.env.VITE_META_PIXEL_ID || '743290068698217'}
VITE_ENABLE_ANALYTICS=${process.env.VITE_ENABLE_ANALYTICS || 'true'}
`;

fs.writeFileSync('.env.production', envContent);
console.log('\nFichier .env.production créé avec succès');

// Installer les dépendances
console.log('\n=== INSTALLATION DES DÉPENDANCES ===');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dépendances installées avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'installation des dépendances:', error);
  process.exit(1);
}

// Exécuter le build
console.log('\n=== LANCEMENT DU BUILD ===');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build terminé avec succès');
  
  // Vérifier que le dossier de build contient les fichiers nécessaires
  const distDir = path.join(process.cwd(), 'dist');
  const files = fs.readdirSync(distDir);
  console.log('\n=== CONTENU DU DOSSIER DIST ===');
  console.log(files);
  
  // Vérifier que index.html existe
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error('Le fichier index.html est manquant dans le dossier de build');
  }
  
  console.log('\n✅ Vérification du build réussie');
  
} catch (error) {
  console.error('❌ Erreur lors du build:', error);
  process.exit(1);
}

console.log('\n=== BUILD VERCEL TERMINÉ AVEC SUCCÈS ===');
