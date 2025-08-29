// scripts/check-env.js
const fs = require('fs');
const path = require('path');

console.log('=== VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT ===');

// Vérifier si le fichier .env.production existe
const envProdPath = path.join(__dirname, '..', '.env.production');
const envProdExists = fs.existsSync(envProdPath);

console.log('Fichier .env.production:', envProdExists ? 'Trouvé' : 'Non trouvé');

// Afficher les variables d'environnement pertinentes
console.log('\nVARIABLES D\'ENVIRONNEMENT:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VITE_APP_ENV:', process.env.VITE_APP_ENV);
console.log('- VITE_META_PIXEL_ID:', process.env.VITE_META_PIXEL_ID);
console.log('- VITE_ENABLE_ANALYTICS:', process.env.VITE_ENABLE_ANALYTICS);

// Vérifier les variables requises
const requiredVars = ['VITE_META_PIXEL_ID'];
let missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('\n❌ VARIABLES MANQUANTES:', missingVars.join(', '));
  console.error('Ces variables sont requises pour le bon fonctionnement du Pixel Meta.');
  
  if (!envProdExists) {
    console.error('\nASTUCE: Créez un fichier .env.production à la racine du projet avec les variables requises.');
  }
  
  process.exit(1);
} else {
  console.log('\n✅ Toutes les variables requises sont présentes.');
}

console.log('==========================================\n');
