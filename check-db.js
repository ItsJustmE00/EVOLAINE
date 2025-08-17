const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, 'server', 'database.sqlite');

// Créer une connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données SQLite');
  
  // Vérifier les tables existantes
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Erreur lors de la récupération des tables:', err);
      db.close();
      return;
    }
    
    console.log('Tables dans la base de données:');
    console.log(tables.map(t => t.name).join(', '));
    
    // Vérifier si la table messages existe
    if (tables.some(t => t.name === 'messages')) {
      // Afficher la structure de la table messages
      db.all("PRAGMA table_info(messages)", [], (err, columns) => {
        if (err) {
          console.error('Erreur lors de la récupération de la structure de la table messages:', err);
        } else {
          console.log('\nStructure de la table messages:');
          console.log(columns.map(c => `${c.name} (${c.type})`).join('\n'));
          
          // Afficher les premiers messages
          db.all("SELECT * FROM messages ORDER BY id DESC LIMIT 5", [], (err, messages) => {
            if (err) {
              console.error('Erreur lors de la récupération des messages:', err);
            } else {
              console.log('\nDerniers messages:');
              console.log(JSON.stringify(messages, null, 2));
            }
            db.close();
          });
        }
      });
    } else {
      console.log('La table messages n\'existe pas');
      db.close();
    }
  });
});
