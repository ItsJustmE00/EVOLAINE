// vercel-build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build script...');

// Installer les dépendances
console.log('Installing dependencies...');
execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

// Exécuter le build
console.log('Running build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
  
  // Vérifier que le répertoire de build existe
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build directory not found after build!');
  }
  
  console.log('Build artifacts:', fs.readdirSync(distPath));
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
