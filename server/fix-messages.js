const { Pool } = require('pg');

const pool = new Pool({
  user: 'evolaine_user',
  host: 'dpg-d2iicoemcj7s73ce7t40-a.frankfurt-postgres.render.com',
  database: 'evolaine_pyal',
  password: 'Ev3IK5xjDLB0IasN0XoaKZUhu8ZhR4hG',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createMessagesTable() {
  const client = await pool.connect();
  try {
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
    console.log('Table messages créée avec succès');
  } catch (err) {
    console.error('Erreur lors de la création de la table messages:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createMessagesTable();
