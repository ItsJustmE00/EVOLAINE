const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

// Vérifier si le dossier project existe
const projectPath = path.join(__dirname, 'project');
if (!fs.existsSync(projectPath)) {
  console.error('Error: Project directory not found');
  process.exit(1);
}

console.log('Installing dependencies...');
try {
  // Installer les dépendances du projet
  execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
  
  console.log('Building project...');
  // Construire le projet
  execSync('npm run build', { cwd: projectPath, stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  
  // Vérifier si le dossier de build existe
  const distPath = path.join(projectPath, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build directory not found after build');
  }
  
  console.log('Build output:');
  console.log(fs.readdirSync(distPath));
  
  // Créer un fichier de configuration pour Vercel
  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: 'project/package.json',
        use: '@vercel/static-build',
        config: {
          distDir: 'dist'
        }
      },
      {
        src: 'server/server.js',
        use: '@vercel/node'
      }
    ],
    routes: [
      {
        src: '/api/(.*)',
        dest: '/server/server.js'
      },
      {
        src: '/admin',
        dest: '/project/dist/admin/index.html'
      },
      {
        src: '/admin/(.*)',
        dest: '/project/dist/admin/index.html'
      },
      {
        src: '/static/(.*)',
        dest: '/project/dist/static/$1'
      },
      {
        src: '/assets/(.*)',
        dest: '/project/dist/assets/$1'
      },
      {
        src: '/(.*)',
        dest: '/project/dist/index.html'
      }
    ]
  };
  
  // Écrire la configuration Vercel
  fs.writeFileSync(
    path.join(__dirname, 'vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );
  
  console.log('Vercel configuration updated');
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
