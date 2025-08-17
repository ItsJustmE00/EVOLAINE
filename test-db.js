const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Démarrage du test de la base de données...');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
console.log('Chemin de la base de données:', dbPath);

// Vérifier si le fichier existe
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.error('ERREUR: Le fichier de base de données n\'existe pas');
  process.exit(1);
}

// Taille du fichier
const stats = fs.statSync(dbPath);
console.log(`Taille du fichier: ${stats.size} octets`);

// Essayer de se connecter à la base de données
try {
  console.log('Tentative de connexion à la base de données...');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('ERREUR de connexion à la base de données:', err.message);
      return;
    }
    
    console.log('Connecté à la base de données avec succès!');
    
    // Vérifier les tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('ERREUR lors de la lecture des tables:', err.message);
        db.close();
        return;
      }
      
      console.log('\nTables trouvées:');
      tables.forEach(t => console.log(`- ${t.name}`));
      
      // Vérifier la table messages
      if (tables.some(t => t.name === 'messages')) {
        console.log('\nVérification de la table messages...');
        
        // Afficher la structure
        db.all("PRAGMA table_info(messages)", [], (err, columns) => {
          if (err) {
            console.error('ERREUR lors de la lecture de la structure de la table messages:', err.message);
          } else {
            console.log('\nStructure de la table messages:');
            console.table(columns.map(c => ({
              colonne: c.name,
              type: c.type,
              'non nul?': c.notnull ? 'OUI' : 'non',
              'valeur par défaut': c.dflt_value || 'NULL'
            })));
          }
          
          // Compter les messages
          db.get("SELECT COUNT(*) as count FROM messages", [], (err, row) => {
            if (err) {
              console.error('ERREUR lors du comptage des messages:', err.message);
            } else {
              console.log(`\nNombre total de messages: ${row.count}`);
              
              // Afficher les 5 derniers messages
              if (row.count > 0) {
                db.all("SELECT id, name, phone, subject, status, createdAt FROM messages ORDER BY id DESC LIMIT 5", [], (err, messages) => {
                  if (err) {
                    console.error('ERREUR lors de la lecture des messages:', err.message);
                  } else {
                    console.log('\n5 derniers messages:');
                    console.table(messages);
                  }
                  db.close();
                });
              } else {
                console.log('Aucun message trouvé dans la base de données.');
                db.close();
              }
            }
          });
        });
      } else {
        console.log('\nLa table messages n\'a pas été trouvée dans la base de données.');
        db.close();
      }
    });
  });
} catch (error) {
  console.error('ERREUR lors de l\'initialisation de la base de données:', error.message);
}
