const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://evolaine_user:oCfOHZ9JQgfqYhqtIOjLGCNoiTQc2l62@dpg-d2hf6e75r7bs73818t4g-a.frankfurt-postgres.render.com/evolaine',
  ssl: {
    rejectUnauthorized: false
  }
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('Initialisation de la base de données...');
    
    // Désactiver temporairement les contraintes de clé étrangère
    await client.query('BEGIN');
    
    // Supprimer les tables existantes si elles existent
    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
    `);
    
    // Créer la table des produits
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Créer la table des commandes
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        notes TEXT,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'En attente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Créer la table des messages de contact
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
      );
    `);
    
    // Vérifier si des produits existent déjà
    const existingProducts = await client.query('SELECT COUNT(*) FROM products');
    
    // Insérer des produits par défaut seulement si la table est vide
    if (parseInt(existingProducts.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, description, price, image) VALUES 
          ('Pack Complet EVOLAINE', 'Notre collection intégrale pour un rituel de soin quotidien complet et rafraîchissant', 249.00, '/pack-complet.png'),
          ('Crème éclaircissante intime', 'Hydratation profonde à l''huile de graines de riz et extraits végétaux', 149.00, '/creme.png'),
          ('Gel Intime au Citron', 'Formule douce au citron pour une fraîcheur durable', 179.00, '/gel-citron.png'),
          ('Sérum éclaircissant intime', 'Sérum illuminant aux acides de fruits et réglisse', 139.00, '/serum.png');
      `);
      console.log('Produits par défaut insérés avec succès');
    } else {
      console.log('La table des produits contient déjà des données, insertion ignorée');
    }
    
    await client.query('COMMIT');
    console.log('Base de données initialisée avec succès');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
};

initDb().catch(console.error);
