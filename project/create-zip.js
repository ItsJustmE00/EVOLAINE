const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createZip() {
  try {
    console.log('Création du fichier ZIP du projet evolaine...');
    
    // Créer un flux d'écriture pour le fichier ZIP
    const output = fs.createWriteStream('evolaine-website.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Niveau de compression maximum
    });

    // Écouter les événements
    output.on('close', function() {
      console.log('✅ Fichier ZIP créé avec succès : evolaine-website.zip');
      console.log(`📁 Taille du fichier: ${archive.pointer()} bytes`);
      console.log('📦 Le fichier contient tous les fichiers source du projet');
    });

    archive.on('error', function(err) {
      throw err;
    });

    // Connecter l'archive au flux de sortie
    archive.pipe(output);

    // Ajouter tous les fichiers et dossiers, en excluant certains
    const excludePatterns = [
      'node_modules',
      'dist',
      '.git',
      '*.zip',
      'create-zip.js',
      '.bolt'
    ];

    // Fonction pour vérifier si un fichier doit être exclu
    function shouldExclude(filePath) {
      return excludePatterns.some(pattern => {
        if (pattern.includes('*')) {
          return filePath.includes(pattern.replace('*', ''));
        }
        return filePath.includes(pattern);
      });
    }

    // Ajouter récursivement tous les fichiers
    function addDirectory(dirPath, zipPath = '') {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = zipPath ? path.join(zipPath, item) : item;
        
        if (shouldExclude(relativePath)) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          addDirectory(fullPath, relativePath);
        } else {
          archive.file(fullPath, { name: relativePath });
        }
      }
    }

    // Ajouter tous les fichiers du projet
    addDirectory('.');

    // Finaliser l'archive
    await archive.finalize();
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du ZIP:', error.message);
  }
}

createZip();