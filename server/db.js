const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n🔌 CHARGEMENT DE LA CONFIGURATION DE LA BASE DE DONNÉES');
console.log('================================================');

console.log('🔧 CONFIGURATION DE LA CONNEXION À LA BASE DE DONNÉES');
console.log('Environnement:', process.env.NODE_ENV || 'development');
console.log('Hôte de la base de données:', process.env.DB_HOST);
console.log('Nom de la base de données:', process.env.DB_NAME);
console.log('Utilisateur de la base de données:', process.env.DB_USER);

// Configuration de la connexion à la base de données
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  // Configuration SSL pour la production
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false,
    sslmode: 'require'
  } : false,
  // Paramètres du pool de connexions
  max: 20, // Nombre maximum de clients dans le pool
  connectionTimeoutMillis: 10000, // 10 secondes de délai de connexion
  idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30 secondes
  query_timeout: 10000, // Timeout des requêtes (10 secondes)
  statement_timeout: 10000, // Timeout des instructions (10 secondes)
  allowExitOnIdle: true // Permettre la sortie quand le pool est inactif
};

// Créer le pool de connexions
let pool;

try {
  pool = new Pool(dbConfig);
  console.log('✅ Pool de connexions créé avec succès');
  
  // Gestion des erreurs de connexion
  pool.on('error', (err) => {
    console.error('\n❌ ERREUR DU POOL DE CONNEXIONS');
    console.error('============================');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack trace:', err.stack);
    console.error('\nTentative de reconnexion...');
  });
  
  console.log('📡 Configuration de la base de données:');
  console.log(`- Hôte: ${dbConfig.host}`);
  console.log(`- Base de données: ${dbConfig.database}`);
  console.log(`- Port: ${dbConfig.port}`);
  console.log(`- SSL: ${dbConfig.ssl ? 'activé' : 'désactivé'}`);
  console.log(`- Utilisateur: ${dbConfig.user}`);
  
} catch (err) {
  console.error('❌ Erreur lors de la création du pool de connexions:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
}

// Fonction pour tester la connexion à la base de données
async function testDatabaseConnection() {
  const testPool = new Pool(dbConfig);
  const client = await testPool.connect().catch(err => {
    console.error('❌ Erreur lors de la connexion à la base de données:');
    console.error('Message d\'erreur:', err.message);
    console.error('Code d\'erreur:', err.code);
    console.error('Stack trace:', err.stack);
    
    // Suggestions de dépannage
    console.log('\n🔧 Suggestions de dépannage:');
    console.log('1. Vérifiez que le serveur PostgreSQL est en cours d\'exécution');
    console.log('2. Vérifiez les identifiants de la base de données dans le fichier .env');
    console.log('3. Vérifiez que l\'utilisateur a les droits nécessaires');
    console.log('4. Vérifiez que le pare-feu autorise les connexions sur le port', dbConfig.port);
    
    if (dbConfig.host === 'localhost' || dbConfig.host === '127.0.0.1') {
      console.log('\nℹ️  Vous utilisez localhost. Assurez-vous que:');
      console.log('- PostgreSQL est installé et en cours d\'exécution');
      console.log('- Le service PostgreSQL est démarré');
      console.log('- Les identifiants dans .env sont corrects');
    } else {
      console.log('\nℹ️  Vous utilisez une base de données distante. Vérifiez que:');
      console.log('- L\'hôte est accessible depuis votre réseau');
      console.log('- Le port', dbConfig.port, 'est ouvert sur le serveur distant');
      console.log('- L\'utilisateur a les droits de se connecter depuis votre adresse IP');
    }
    
    process.exit(1);
  });
  
  try {
    console.log('\n🔍 Test de connexion à la base de données...');
    const res = await client.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie!');
    console.log('   Heure du serveur:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution de la requête de test:');
    console.error('Message d\'erreur:', err.message);
    console.error('Code d\'erreur:', err.code);
    process.exit(1);
  } finally {
    client.release();
    await testPool.end();
  }
}

// Tester la connexion avant de créer le pool principal
if (process.env.NODE_ENV !== 'test') {
  testDatabaseConnection().catch(err => {
    console.error('❌ Échec du test de connexion à la base de données');
    console.error(err);
    process.exit(1);
  });
}

// Test de la connexion
async function testConnection() {
  console.log('\n🔍 TEST DE CONNEXION À LA BASE DE DONNÉES');
  console.log('================================');
  
  const client = await pool.connect().catch(err => {
    console.error('❌ Impossible d\'obtenir une connexion du pool:', err.message);
    console.error('Vérifiez vos paramètres de connexion et que le serveur PostgreSQL est en cours d\'exécution');
    process.exit(1);
  });
  
  try {
    const result = await client.query('SELECT NOW() AS now');
    console.log('✅ Connecté à la base de données PostgreSQL avec succès');
    console.log('⏰ Heure actuelle de la base de données:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error('Code d\'erreur:', err.code);
    console.error('Message d\'erreur:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1); // Arrêter l'application en cas d'échec de connexion
  } finally {
    client.release();
  }
}

// Vérifier le schéma (ajouter la colonne full_name si elle n'existe pas encore)
async function ensureSchema() {
  try {
    console.log('\n🔧 Vérification du schéma de la base de données (table messages)...');
    await pool.query(`ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);`);
    await pool.query(`ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);
    await pool.query(`UPDATE messages SET name = full_name WHERE name IS NULL;`);
    await pool.query(`ALTER TABLE IF EXISTS messages ALTER COLUMN email DROP NOT NULL;`);
    console.log('✅ Schéma vérifié / colonne full_name OK');
  } catch (err) {
    console.error('❌ Erreur lors de la vérification/ajout de la colonne full_name:', err.message);
  }
}

// Exécuter le test de connexion
testConnection()
  .then(ensureSchema)
  .catch(err => {
  console.error('❌ Erreur lors du test de connexion:', err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => {
    console.log('📝 Exécution de la requête:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    return pool.query(text, params);
  },
  pool
};
