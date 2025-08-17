const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'server', 'database.sqlite');

// Vérifier si le fichier existe
if (!fs.existsSync(dbPath)) {
  console.log('Le fichier de base de données n\'existe pas');
  process.exit(1);
}

console.log('Taille du fichier:', fs.statSync(dbPath).size, 'octets');

// Essayer de se connecter
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Erreur de connexion:', err.message);
    return;
  }
  
  console.log('Connecté à la base de données');
  
  // Vérifier les tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Erreur lors de la lecture des tables:', err.message);
      db.close();
      return;
    }
    
    console.log('\nTables trouvées:');
    tables.forEach(t => console.log(`- ${t.name}`));
    
    // Si la table messages existe, afficher sa structure et son contenu
    if (tables.some(t => t.name === 'messages')) {
      db.all("PRAGMA table_info(messages)", [], (err, columns) => {
        if (err) {
          console.error('Erreur lors de la lecture de la structure:', err.message);
        } else {
          console.log('\nStructure de la table messages:');
          columns.forEach(c => {
            console.log(`- ${c.name} (${c.type})`);
          });
        }
        
        // Afficher le nombre de messages
        db.get("SELECT COUNT(*) as count FROM messages", [], (err, row) => {
          if (err) {
            console.error('Erreur lors du comptage des messages:', err.message);
          } else {
            console.log(`\nNombre de messages: ${row.count}`);
          }
          
          db.close();
        });
      });
    } else {
      console.log('\nLa table messages n\'existe pas');
      db.close();
    }
  });
});
