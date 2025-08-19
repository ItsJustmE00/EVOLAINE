const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./db');

// Configuration des variables d'environnement avec des valeurs par défaut pour le développement
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3004,
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'evolaine',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_PORT: process.env.DB_PORT || 5432,
  JWT_SECRET: process.env.JWT_SECRET || 'votre_cle_secrete_tres_longue_et_securisee',
};

// En production, vérifier que toutes les variables requises sont définies
if (config.NODE_ENV === 'production') {
  const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error('ERREUR CRITIQUE: Les variables d\'environnement suivantes sont manquantes:');
    missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
    console.error('Veuillez les définir avant de démarrer le serveur en production.');
    process.exit(1);
  }
}

console.log('Configuration chargée avec succès:', {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  DB_HOST: config.DB_HOST,
  DB_NAME: config.DB_NAME,
  DB_USER: config.DB_USER,
  JWT_SECRET: config.JWT_SECRET ? 'Défini' : 'Non défini'
});

// Création de l'application Express
console.log('Création de l\'application Express...');
const app = express();
const PORT = config.PORT;

// Création du serveur HTTP
const server = http.createServer(app);

// Configuration CORS
console.log('🔧 Configuration CORS...');

// Liste des origines autorisées
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3004',
  'https://evolaine-backend.onrender.com',
  'https://evolaine.onrender.com',
  'https://www.evolaine.com',
  'https://evolaine.com',
  'https://evolaine-frontend.onrender.com',
  'https://evolaine-admin.onrender.com'
];

// Ajouter l'origine du frontend si elle n'est pas déjà présente
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
  allowedOrigins.push(frontendUrl);
}

console.log('✅ Origines autorisées:', allowedOrigins);

// Configuration des options CORS
const corsOptions = {
  origin: function (origin, callback) {
    // En développement, autoriser toutes les origines avec des avertissements
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En production, vérifier l'origine de manière stricte
    if (!origin) {
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée
    const originIsAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const regex = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return allowedOrigin === origin || origin.endsWith(new URL(allowedOrigin).hostname);
    });
    
    if (originIsAllowed) {
      return callback(null, true);
    } else {
      console.warn('Tentative d\'accès non autorisée depuis l\'origine:', origin);
      return callback(new Error('Accès non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-access-token',
    'Accept',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ]
};

// Configuration CORS pour les requêtes régulières
console.log('🔧 Application de la configuration CORS...');
app.use(cors(corsOptions));

// Configuration de Socket.IO
console.log('🔌 Configuration de Socket.IO...');
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Utiliser la même logique de vérification d'origine que pour CORS
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      if (!origin) {
        return callback(null, true);
      }
      
      const originIsAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const regex = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
          return regex.test(origin);
        }
        return allowedOrigin === origin || origin.endsWith(new URL(allowedOrigin).hostname);
      });
      
      if (originIsAllowed) {
        return callback(null, true);
      } else {
        console.warn('Tentative de connexion WebSocket non autorisée depuis l\'origine:', origin);
        return callback(new Error('Accès non autorisé par CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: false,
  debug: process.env.NODE_ENV !== 'production',
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 1024,
    zlibDeflateOptions: {
      chunkSize: 16 * 1024
    },
    zlibInflateOptions: {
      chunkSize: 16 * 1024
    }
  },
  maxHttpBufferSize: 1e8, // 100MB
  serveClient: false,
  httpCompression: true
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Nouvelle connexion Socket.IO avec l\'ID:', socket.id);
  console.log('En-têtes de connexion:', socket.handshake.headers);
  console.log('URL de connexion:', socket.handshake.url);
  console.log('Adresse IP du client:', socket.handshake.address);
  
  // Gestion des déconnexions
  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} déconnecté. Raison: ${reason}`);
    console.log('Salles avant déconnexion:', Array.from(socket.rooms));
  });
  
  // Gestion des erreurs de connexion
  socket.on('connect_error', (error) => {
    console.error(`Erreur de connexion pour le client ${socket.id}:`, error);
  });
  
  // Rejoindre la room admin
  socket.on('admin_join', (data, callback) => {
    console.log(`🔑 Tentative de rejoindre la room admin par le client ${socket.id}`, data);
    
    // Ajouter des logs pour le débogage
    console.log('Salles actuelles avant join:', Array.from(socket.rooms));
    
    // Rejoindre la room admin
    socket.join('admin');
    
    // Vérifier si le client est bien dans la room
    const rooms = Array.from(socket.rooms);
    console.log(`✅ Client ${socket.id} a rejoint la room admin`);
    console.log('Salles après join:', rooms);
    
    // Vérifier si la room admin existe
    const adminRoom = io.sockets.adapter.rooms.get('admin');
    console.log('Clients dans la room admin:', adminRoom ? adminRoom.size : 0);
    
    // Envoyer un message de bienvenue
    socket.emit('welcome', {
      message: 'Bienvenue sur le tableau de bord administrateur',
      timestamp: new Date().toISOString(),
      clientId: socket.id
    });
    
    // Envoyer une confirmation au client
    if (callback) {
      callback({
        success: true,
        message: `Bienvenue dans la room admin`,
        rooms: rooms,
        timestamp: new Date().toISOString(),
        roomSize: adminRoom ? adminRoom.size : 0
      });
    }
    
    // Tester l'envoi d'un message après un délai
    setTimeout(() => {
      console.log(`Envoi d'un message de test à la room admin depuis le serveur...`);
      io.to('admin').emit('test_message', {
        message: 'Ceci est un message de test du serveur',
        timestamp: new Date().toISOString()
      });
    }, 2000);
  });
  
  // Écouter les messages de test du client
  socket.on('test_message', (data) => {
    console.log('Message de test reçu du client:', data);
  });
});

// Fonction pour vérifier le token admin
function verifyAdminToken(token) {
  try {
    // Enlever le préfixe 'Bearer ' si présent
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === 'admin'; // Vérifier si l'utilisateur a le rôle admin
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    return false;
  }
}

console.log('✅ CORS configuré avec succès');

// Gestion des requêtes OPTIONS (pré-vol) avec en-têtes dynamiques
app.options('*', (req, res) => {
  const origin = req.headers.origin || '*';
  const reqHeaders = req.headers['access-control-request-headers'];
  const allowHeaders = reqHeaders || [
    'Content-Type',
    'Authorization',
    'x-access-token',
    'Accept',
    'X-Requested-With',
    'X-Forwarded-For',
    'X-Forwarded-Proto',
    'X-Forwarded-Host',
    'Cache-Control',
    'cache-control',
    'Pragma',
    'Expires'
  ].join(', ');

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', allowHeaders);
  return res.sendStatus(204);
});
console.log('✅ Gestion des requêtes OPTIONS configurée (dynamique)');

// Middleware pour gérer les erreurs CORS
app.use((err, req, res, next) => {
  if (err) {
    console.error('❌ Erreur CORS:', err.message);
    
    // Si c'est une erreur CORS, renvoyer une réponse d'erreur appropriée
    if (err.name === 'CorsError' || err.message.includes('CORS')) {
      return res.status(403).json({
        error: 'Accès non autorisé',
        message: 'Cette origine n\'est pas autorisée à accéder à cette ressource',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
  
  // Passer à l'erreur suivante si ce n'est pas une erreur CORS
  next(err);
});

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de connexion admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vérifier les identifiants (à remplacer par une vraie vérification en base de données)
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'votre_mot_de_passe_tres_securise';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Créer un token JWT
    const token = jwt.sign(
      { role: 'admin', username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

// Middleware pour protéger les routes admin - DÉSACTIVÉ POUR LE DÉVELOPPEMENT
function adminAuth(req, res, next) {
  // Autoriser tout le monde en développement
  console.log('Accès admin autorisé (mode développement)');
  next();
  
  /* Ancien code d'authentification
  // Vérifier si le token est dans les en-têtes
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (token && verifyAdminToken(token)) {
    next();
  } else {
    res.status(403).json({ error: 'Accès non autorisé' });
  }
  */
  next();
};

// Appliquer le middleware d'authentification à toutes les routes /admin
app.use('/admin', adminAuth);
app.use('/api/admin', adminAuth);

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`\n===== NOUVELLE REQUÊTE =====`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Méthode: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`Chemin: ${req.path}`);
  console.log('En-têtes:', req.headers);
  console.log('Paramètres de requête:', req.query);
  
  // Sauvegarder la méthode originale de réponse
  const originalSend = res.send;
  res.send = function(body) {
    console.log('\n===== RÉPONSE =====');
    console.log(`Statut: ${res.statusCode}`);
    console.log('En-têtes de réponse:', res.getHeaders());
    try {
      const jsonBody = JSON.parse(body);
      console.log('Corps de la réponse (JSON):', JSON.stringify(jsonBody, null, 2));
    } catch (e) {
      console.log('Corps de la réponse (texte):', body);
    }
    originalSend.apply(res, arguments);
  };
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Corps de la requête (JSON):', req.body);
  }
  
  next();
});

// Middleware pour contrôler le cache des fichiers admin
app.use('/admin', (req, res, next) => {
  if (req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.html')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
  next();
});

// Servir les fichiers statiques de l'administration (avant l'authentification)
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
  etag: false, // Désactiver le cache côté serveur
  lastModified: false
}));

// Route pour servir l'index.html de l'admin pour toutes les routes /admin
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'), {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  });
});

// Servir les fichiers statiques du dossier public du frontend
app.use(express.static(path.join(__dirname, '..', 'project', 'public')));

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Récupérer tous les messages
app.get('/api/messages', async (req, res) => {
  try {
    console.log('Récupération de tous les messages...');
    const result = await pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des messages' });
  }
});

// Initialisation de la connexion à la base de données PostgreSQL
console.log('Tentative de connexion à la base de données PostgreSQL...');

// Tester la connexion à la base de données
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données PostgreSQL:', err);
    process.exit(1);
  } else {
    console.log('Connecté à la base de données PostgreSQL avec succès');
    initializeDatabase();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejet non géré:', reason);
  process.exit(1);
});

// Initialisation des tables
async function initializeDatabase() {
  console.log('=== DÉBUT DE L\'INITIALISATION DE LA BASE DE DONNÉES ===');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Table des messages de contact
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table messages créée avec succès');

    // Table des produits
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255),
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table products créée avec succès');

    // Table des commandes
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
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table orders créée avec succès');

    // Table des villes
    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT true
      )
    `);
    console.log('Table cities créée avec succès');

    // Vérifier si des données existent déjà
    const citiesCount = await client.query('SELECT COUNT(*) FROM cities');
    
    if (parseInt(citiesCount.rows[0].count) === 0) {
      const defaultCities = [
        'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
        'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
        'Safi', 'El Jadida', 'Béni Mellal', 'Nador', 'Taza'
      ];
      
      for (const city of defaultCities) {
        await client.query('INSERT INTO cities (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [city]);
      }
      console.log('Villes par défaut insérées avec succès');
    }

    await client.query('COMMIT');
    console.log('=== FIN DE L\'INITIALISATION DE LA BASE DE DONNÉES ===');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
    throw err;
  } finally {
    client.release();
  }
}

// L'initialisation de la base de données est déjà appelée dans le callback de connexion à la base de données
// Pas besoin d'appeler initializeDatabase() ici car elle est déjà appelée après une connexion réussie

// Configuration du dossier des fichiers statiques
const adminPath = path.join(__dirname, 'admin');
const fs = require('fs');

// Middleware pour servir les fichiers statiques de l'admin
app.use('/admin', (req, res, next) => {
  // Désactiver la mise en cache pour les fichiers statiques
  res.setHeader('Cache-Control', 'no-cache');
  
  // Si c'est la racine de l'admin, servir index.html
  if (req.path === '/' || req.path === '') {
    const indexPath = path.join(adminPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.status(404).send('Page non trouvée');
  }
  
  // Pour les autres fichiers dans /admin
  const filePath = path.join(adminPath, req.path);
  
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // Si le fichier n'existe pas mais que c'est une requête pour un fichier avec extension
  if (path.extname(req.path)) {
    return res.status(404).send('Fichier non trouvé');
  }
  
  // Pour les routes SPA, rediriger vers index.html
  const indexPath = path.join(adminPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  next();
});

// Endpoint de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Le serveur fonctionne correctement' });
});

// Endpoint temporaire pour vérifier les villes
app.get('/api/debug/cities', (req, res) => {
  db.all('SELECT * FROM cities', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des villes:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(rows);
  });
});

// Routes pour l'API des villes
app.get('/api/cities', (req, res) => {
  db.all('SELECT * FROM cities WHERE active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route pour l'administration - Récupérer toutes les villes (y compris inactives)
app.get('/api/admin/cities', (req, res) => {
  db.all('SELECT * FROM cities ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route pour l'administration - Mettre à jour une ville
app.put('/api/admin/cities/:id', (req, res) => {
  const { name, active } = req.body;
  const cityId = req.params.id;
  
  if (!name) {
    return res.status(400).json({ error: 'Le nom de la ville est requis' });
  }
  
  db.run(
    'UPDATE cities SET name = ?, active = ? WHERE id = ?',
    [name, active ? 1 : 0, cityId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Ville non trouvée' });
      }
      res.json({ id: cityId, name, active });
    }
  );
});

// Route pour l'administration - Ajouter une nouvelle ville
app.post('/api/admin/cities', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Le nom de la ville est requis' });
  }
  
  db.run(
    'INSERT INTO cities (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Cette ville existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, active: 1 });
    }
  );
});

// Route pour l'administration - Supprimer une ville
app.delete('/api/admin/cities/:id', (req, res) => {
  const cityId = req.params.id;
  
  db.run('DELETE FROM cities WHERE id = ?', [cityId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ville non trouvée' });
    }
    res.json({ message: 'Ville supprimée avec succès' });
  });
});

// Route pour les statistiques du tableau de bord
app.get('/api/stats/overview', async (req, res) => {
  try {
    const [ordersResult, messagesResult] = await Promise.all([
      pool.query('SELECT * FROM orders'),
      pool.query('SELECT * FROM messages')
    ]);

    const orders = ordersResult.rows;
    const messages = messagesResult.rows;

    const stats = {
      newOrders: orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'Nouvelle' ||
        order.status === 'En attente'
      ).length,
      unreadMessages: messages.filter(msg => !msg.is_read).length,
      revenue: orders
        .filter(order => order.status === 'completed' || order.status === 'Terminée')
        .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0),
      recentOrders: orders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    };

    res.json(stats);
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
});

// Routes pour l'API des messages
app.get('/api/messages', async (req, res) => {
  try {
    console.log('Récupération de tous les messages...');
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des messages:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des messages' });
  }
});

// Récupérer un message spécifique par son ID
// Récupérer un message spécifique par son ID
app.get('/api/messages/:id', async (req, res) => {
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM messages WHERE id = $1', [messageId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du message:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du message',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Mettre à jour le statut d'un message
app.put('/api/messages/:id/status', async (req, res) => {
  const { status } = req.body;
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  if (!status) {
    return res.status(400).json({ error: 'Le statut est requis' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE messages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, messageId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json({ 
      success: true, 
      message: 'Statut du message mis à jour avec succès',
      updatedMessage: result.rows[0]
    });
    
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut du message:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut du message',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Mettre à jour le statut d'un message comme lu
app.put('/api/messages/:id/read', async (req, res) => {
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [messageId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json({ 
      success: true, 
      message: 'Message marqué comme lu',
      updatedMessage: result.rows[0]
    });
    
  } catch (err) {
    console.error('Erreur lors de la mise à jour du message:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du message',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Récupérer les statistiques globales du tableau de bord
app.get('/api/stats/overview', async (req, res) => {
  try {
    // Exécuter les requêtes en parallèle pour plus d'efficacité
    const [
      ordersStats,
      messagesStats,
      productsStats,
      recentOrders,
      recentMessages
    ] = await Promise.all([
      // Statistiques des commandes
      pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total), 0) as total_revenue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `),
      
      // Statistiques des messages
      pool.query(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages
        FROM messages
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `),
      
      // Statistiques des produits
      pool.query(`
        SELECT 
          COUNT(*) as total_products,
          SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) as out_of_stock
        FROM products
      `),
      
      // Dernières commandes
      pool.query(`
        SELECT id, first_name, last_name, total, status, created_at 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 5
      `),
      
      // Derniers messages
      pool.query(`
        SELECT id, name, email, subject, is_read, created_at 
        FROM messages 
        ORDER BY created_at DESC 
        LIMIT 5
      `)
    ]);
    
    // Construire la réponse
    res.json({
      orders: {
        total: parseInt(ordersStats.rows[0]?.total_orders) || 0,
        revenue: parseFloat(ordersStats.rows[0]?.total_revenue) || 0,
        completed: parseInt(ordersStats.rows[0]?.completed_orders) || 0,
        pending: parseInt(ordersStats.rows[0]?.pending_orders) || 0,
        recent: recentOrders.rows
      },
      messages: {
        total: parseInt(messagesStats.rows[0]?.total_messages) || 0,
        unread: parseInt(messagesStats.rows[0]?.unread_messages) || 0,
        recent: recentMessages.rows
      },
      products: {
        total: parseInt(productsStats.rows[0]?.total_products) || 0,
        outOfStock: parseInt(productsStats.rows[0]?.out_of_stock) || 0
      }
    });
    
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques du tableau de bord:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques du tableau de bord',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Récupérer les statistiques des produits
app.get('/api/stats/products', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.category,
        COALESCE(SUM(CAST(oi.quantity AS INTEGER)), 0) as total_ordered,
        COALESCE(SUM(CAST(oi.quantity AS INTEGER) * p.price), 0) as total_revenue
      FROM products p
      LEFT JOIN (
        SELECT 
          jsonb_array_elements(items)->>'id' as product_id,
          CAST(jsonb_array_elements(items)->>'quantity' AS INTEGER) as quantity
        FROM orders
      ) oi ON p.id::text = oi.product_id
      GROUP BY p.id
      ORDER BY total_ordered DESC
    `;
    
    const result = await pool.query(sql);
    res.json(result.rows);
    
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques des produits:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques des produits',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Récupérer les statistiques des messages
app.get('/api/stats/messages', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_messages,
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages
      FROM messages
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `;
    
    const result = await pool.query(sql);
    res.json(result.rows);
    
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques des messages:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques des messages',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Récupérer les statistiques des commandes
app.get('/api/stats/orders', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_order_value,
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `;
    
    const result = await pool.query(sql);
    res.json(result.rows);
    
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Supprimer un message
app.delete('/api/messages/:id', async (req, res) => {
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  try {
    const result = await pool.query('DELETE FROM messages WHERE id = $1 RETURNING id', [messageId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json({ 
      success: true, 
      message: 'Message supprimé avec succès',
      deletedId: result.rows[0].id
    });
    
  } catch (err) {
    console.error('Erreur lors de la suppression du message:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du message',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Route pour l'interface d'administration (doit être la dernière route avant les gestionnaires d'erreurs)
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Route pour créer une nouvelle commande
app.post('/api/orders', async (req, res) => {
  console.log('\n=== NOUVELLE DEMANDE DE COMMANDE ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('En-têtes de la requête:', JSON.stringify(req.headers, null, 2));
  console.log('Corps de la requête reçu:', JSON.stringify(req.body, null, 2));
  
  // Récupération des données avec les noms de champs du formulaire
  const { first_name, last_name, phone, address, city, notes, items, total } = req.body;
  
  // Alias pour la compatibilité avec le code existant
  const firstName = first_name;
  const lastName = last_name;
  
  console.log('Données extraites:', { 
    firstName, 
    lastName: lastName ? '***' : 'manquant', 
    phone: phone ? '***' : 'manquant', 
    address: address ? '***' : 'manquant', 
    city: city || 'Non spécifiée',
    notes: notes ? 'Présentes' : 'Aucune',
    itemsCount: Array.isArray(items) ? items.length : 'Invalide',
    total: total || 0
  });

  // Validation des champs requis
  if (!firstName || !lastName || !phone || !address || !city || !items || !total) {
    const missingFields = [];
    if (!firstName) missingFields.push('Prénom');
    if (!lastName) missingFields.push('Nom');
    if (!phone) missingFields.push('Téléphone');
    if (!address) missingFields.push('Adresse');
    if (!city) missingFields.push('Ville');
    if (!items) missingFields.push('Articles');
    if (!total) missingFields.push('Total');
    
    const errorMsg = `Champs manquants: ${missingFields.join(', ')}`;
    console.error('❌ Erreur de validation:', errorMsg);
    
    return res.status(400).json({ 
      success: false,
      error: 'Tous les champs sont obligatoires',
      details: errorMsg,
      missingFields: missingFields
    });
  }

  // Vérification que items est un tableau
  if (!Array.isArray(items) || items.length === 0) {
    const errorMsg = 'Le panier est vide ou invalide';
    console.error('❌ Erreur de validation:', errorMsg);
    
    return res.status(400).json({ 
      success: false,
      error: errorMsg,
      receivedItems: items
    });
  }

  console.log('Connexion à la base de données...');
  const client = await pool.connect();
  
  try {
    console.log('Début de la transaction...');
    await client.query('BEGIN');
    
    // Insertion de la commande dans la base de données
    const insertQuery = `
      INSERT INTO orders (first_name, last_name, phone, address, city, notes, items, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `;
    // Convertir explicitement le tableau items en JSON
    const itemsJson = JSON.stringify(items);
    
    const queryParams = [
      firstName, 
      lastName, 
      phone, 
      address, 
      city, 
      notes || '', 
      itemsJson, // Utiliser la version JSON stringifiée
      total
    ];
    
    console.log('Exécution de la requête SQL:', insertQuery);
    console.log('Paramètres:', JSON.stringify(queryParams, null, 2));
    
    const result = await client.query(insertQuery, queryParams);
    const orderId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;
    
    console.log(`✅ Commande insérée avec succès. ID: ${orderId}, Date: ${createdAt}`);
    await client.query('COMMIT');
    
    // Récupérer la commande complète pour l'envoyer via WebSocket
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await client.query(orderQuery, [orderId]);
    const newOrder = orderResult.rows[0];
    
    // Formater correctement la commande pour le client
    const formattedOrder = {
      id: newOrder.id,
      first_name: newOrder.first_name,
      last_name: newOrder.last_name,
      phone: newOrder.phone,
      address: newOrder.address,
      city: newOrder.city,
      notes: newOrder.notes,
      total: parseFloat(newOrder.total),
      status: newOrder.status,
      created_at: newOrder.created_at,
      items: Array.isArray(newOrder.items) ? newOrder.items : []
    };
    
    console.log('📢 Envoi de l\'événement new_order avec les données:', JSON.stringify(formattedOrder, null, 2));
    
    // Émettre un événement pour la nouvelle commande
    io.to('admin').emit('new_order', formattedOrder);
    console.log(`✅ Événement new_order émis avec succès pour la commande ${orderId}`);
    
    const response = {
      success: true,
      message: 'Commande créée avec succès',
      order: {
        id: orderId,
        firstName,
        lastName,
        phone,
        address,
        city,
        notes: notes || '',
        total,
        status: 'pending',
        createdAt: createdAt,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.description || ''
        }))
      }
    };
    
    console.log('Réponse de succès:', JSON.stringify(response, null, 2));
    return res.status(201).json(response);
    
  } catch (err) {
    console.error('❌ Erreur lors de la création de la commande:');
    console.error('Message d\'erreur:', err.message);
    console.error('Code d\'erreur:', err.code);
    console.error('Stack trace:', err.stack);
    
    if (client) {
      console.log('Annulation de la transaction...');
      await client.query('ROLLBACK').catch(rollbackErr => {
        console.error('Erreur lors du rollback:', rollbackErr);
      });
    }
    
    const errorResponse = { 
      success: false, 
      error: 'Erreur lors de la création de la commande',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: err.code
    };
    
    console.error('Réponse d\'erreur:', JSON.stringify(errorResponse, null, 2));
    return res.status(500).json(errorResponse);
    
  } finally {
    if (client) {
      console.log('Libération du client de connexion...');
      client.release();
    }
  }
});

// Récupérer toutes les commandes
app.get('/api/orders', async (req, res) => {
  console.log('\n=== DEMANDE DE RÉCUPÉRATION DES COMMANDES ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('En-têtes de la requête:', JSON.stringify(req.headers, null, 2));
  
  // Récupération des paramètres de requête
  const { status, limit = 50, offset = 0 } = req.query;
  
  console.log('Paramètres de requête:', { status, limit, offset });
  
  try {
    console.log('Connexion à la base de données...');
    const client = await pool.connect();
    
    try {
      let query = 'SELECT * FROM orders';
      const queryParams = [];
      
      // Construction dynamique de la requête en fonction des filtres
      const whereClauses = [];
      
      if (status) {
        whereClauses.push(`status = $${queryParams.length + 1}`);
        queryParams.push(status);
      }
      
      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }
      
      // Ajout du tri et de la pagination
      query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(parseInt(limit), parseInt(offset));
      
      console.log('Exécution de la requête SQL:', query);
      console.log('Paramètres:', queryParams);
      
      const startTime = Date.now();
      const result = await client.query(query, queryParams);
      const duration = Date.now() - startTime;
      
      // Récupération du nombre total de commandes pour la pagination
      let totalCount = 0;
      if (whereClauses.length > 0) {
        const countQuery = `SELECT COUNT(*) FROM orders WHERE ${whereClauses.join(' AND ')}`;
        const countResult = await client.query(countQuery, queryParams.slice(0, -2)); // On enlève limit et offset
        totalCount = parseInt(countResult.rows[0].count);
      } else {
        const countResult = await client.query('SELECT COUNT(*) FROM orders');
        totalCount = parseInt(countResult.rows[0].count);
      }
      
      console.log(`✅ ${result.rows.length} commandes récupérées en ${duration}ms`);
      
      // Préparation de la réponse
      const response = {
        success: true,
        data: result.rows,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          page: Math.floor(offset / limit) + 1,
          pages: Math.ceil(totalCount / limit)
        }
      };
      
      // Ajout des en-têtes de pagination
      res.set('X-Total-Count', totalCount.toString());
      res.set('Access-Control-Expose-Headers', 'X-Total-Count');
      
      console.log('Réponse envoyée avec succès');
      return res.json(response);
      
    } catch (err) {
      console.error('❌ Erreur lors de l\'exécution de la requête:');
      console.error('Message d\'erreur:', err.message);
      console.error('Code d\'erreur:', err.code);
      console.error('Stack trace:', err.stack);
      
      const errorResponse = {
        success: false,
        error: 'Erreur lors de la récupération des commandes',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        code: err.code
      };
      
      console.error('Réponse d\'erreur:', JSON.stringify(errorResponse, null, 2));
      return res.status(500).json(errorResponse);
      
    } finally {
      if (client) {
        console.log('Libération du client de connexion...');
        client.release();
      }
    }
    
  } catch (err) {
    console.error('\n❌ ERREUR NON GÉRÉE ======================');
    console.error('URL:', req.originalUrl);
    console.error('Méthode:', req.method);
    console.error('Erreur:', err.message);
    console.error('Stack:', err.stack);
    console.error('===================================\n');

    // Si c'est une erreur de connexion à la base de données
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message.includes('Connection terminated')) {
      return res.status(503).json({
        success: false,
        error: 'Service indisponible',
        message: 'Impossible de se connecter à la base de données',
        details: process.env.NODE_ENV === 'development' ? {
          message: err.message,
          code: err.code,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME
        } : undefined
      });
    }

    // Si c'est une erreur de requête SQL
    if (err.code === '42P01' || err.code === '42P07') { // table doesn't exist or already exists
      return res.status(500).json({
        success: false,
        error: 'Erreur de base de données',
        message: 'Erreur de structure de la base de données',
        details: process.env.NODE_ENV === 'development' ? {
          message: err.message,
          code: err.code,
          hint: err.hint
        } : undefined
      });
    }

    // Erreur par défaut
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: 'Une erreur inattendue est survenue',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        code: err.code,
        stack: err.stack
      } : undefined
    });
  }
});

// Récupérer une commande spécifique par son ID
app.get('/api/orders/:id', async (req, res) => {
  console.log('\n=== DEMANDE DE RÉCUPÉRATION D\'UNE COMMANDE ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('ID de la commande demandée:', req.params.id);
  console.log('En-têtes de la requête:', JSON.stringify(req.headers, null, 2));
  
  const orderId = req.params.id;
  
  if (!orderId) {
    const errorMsg = 'ID de la commande manquant dans l\'URL';
    console.error('❌ Erreur de validation:', errorMsg);
    
    return res.status(400).json({ 
      success: false,
      error: 'ID de la commande manquant',
      details: 'Le paramètre :id est requis dans l\'URL'
    });
  }
  
  console.log('Connexion à la base de données...');
  const client = await pool.connect();
  
  try {
    const query = 'SELECT * FROM orders WHERE id = $1';
    console.log('Exécution de la requête SQL:', query);
    console.log('Paramètres:', [orderId]);
    
    const startTime = Date.now();
    const result = await client.query(query, [orderId]);
    const duration = Date.now() - startTime;
    
    if (result.rows.length === 0) {
      console.error(`❌ Commande avec l'ID ${orderId} non trouvée`);
      
      return res.status(404).json({ 
        success: false,
        error: 'Commande non trouvée',
        orderId: orderId,
        details: `Aucune commande trouvée avec l'ID: ${orderId}`
      });
    }
    
    const order = result.rows[0];
    console.log(`✅ Commande trouvée en ${duration}ms`);
    
    // Si les articles sont stockés sous forme de chaîne JSON, les convertir en objet
    if (order.items && typeof order.items === 'string') {
      try {
        console.log('Conversion des articles de la commande depuis JSON...');
        order.items = JSON.parse(order.items);
        console.log('Conversion des articles réussie');
      } catch (e) {
        console.error('❌ Erreur lors du parsing des articles de la commande:');
        console.error('Message d\'erreur:', e.message);
        console.error('Contenu JSON invalide:', order.items);
        
        // On laisse les articles tels quels en cas d'erreur de parsing
        order.itemsParsingError = {
          error: 'Erreur lors de la conversion des articles',
          details: e.message
        };
      }
    }
    
    // Préparation de la réponse
    const response = {
      success: true,
      data: order
    };
    
    console.log('Réponse envoyée avec succès');
    return res.json(response);
    
  } catch (err) {
    console.error('❌ Erreur lors de la récupération de la commande:');
    console.error('Message d\'erreur:', err.message);
    console.error('Code d\'erreur:', err.code);
    console.error('Stack trace:', err.stack);
    
    const errorResponse = {
      success: false,
      error: 'Erreur lors de la récupération de la commande',
      orderId: orderId,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: err.code
    };
    
    console.error('Réponse d\'erreur:', JSON.stringify(errorResponse, null, 2));
    return res.status(500).json(errorResponse);
    
  } finally {
    if (client) {
      console.log('Libération du client de connexion...');
      client.release();
    }
  }
});

// Mettre à jour le statut d'une commande
app.put('/api/orders/:id/status', async (req, res) => {
  console.log('\n=== DEMANDE DE MISE À JOUR DU STATUT D\'UNE COMMANDE ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('ID de la commande:', req.params.id);
  console.log('En-têtes de la requête:', JSON.stringify(req.headers, null, 2));
  console.log('Corps de la requête reçu:', JSON.stringify(req.body, null, 2));
  
  const { status } = req.body;
  const orderId = req.params.id;
  
  // Validation des paramètres
  if (!orderId) {
    const errorMsg = 'ID de la commande manquant dans l\'URL';
    console.error('❌ Erreur de validation:', errorMsg);
    
    return res.status(400).json({ 
      success: false,
      error: 'ID de la commande manquant',
      details: 'Le paramètre :id est requis dans l\'URL'
    });
  }
  
  if (!status) {
    const errorMsg = 'Le champ \'status\' est requis dans le corps de la requête';
    console.error('❌ Erreur de validation:', errorMsg);
    
    return res.status(400).json({ 
      success: false,
      error: 'Le statut est requis',
      details: 'Le champ \'status\' est obligatoire dans le corps de la requête',
      receivedBody: req.body
    });
  }
  
  console.log('Connexion à la base de données...');
  const client = await pool.connect();
  
  try {
    // Vérifier d'abord si la commande existe
    console.log(`Vérification de l'existence de la commande ${orderId}...`);
    const checkResult = await client.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    
    if (checkResult.rows.length === 0) {
      console.error(`❌ Commande avec l'ID ${orderId} non trouvée`);
      
      return res.status(404).json({ 
        success: false,
        error: 'Commande non trouvée',
        orderId: orderId,
        details: `Aucune commande trouvée avec l'ID: ${orderId}`
      });
    }
    
    const oldStatus = checkResult.rows[0].status;
    console.log(`Ancien statut de la commande: ${oldStatus}, Nouveau statut demandé: ${status}`);
    
    // Mise à jour du statut
    const updateQuery = `
      UPDATE orders 
      SET status = $1, 
          updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    
    console.log('Exécution de la requête SQL:', updateQuery);
    console.log('Paramètres:', [status, orderId]);
    
    const startTime = Date.now();
    const result = await client.query(updateQuery, [status, orderId]);
    const duration = Date.now() - startTime;
    
    if (result.rowCount === 0) {
      // Ce cas ne devrait normalement pas se produire car on a déjà vérifié l'existence
      console.error(`❌ Aucune ligne mise à jour pour la commande ${orderId}`);
      
      return res.status(500).json({ 
        success: false,
        error: 'Erreur lors de la mise à jour du statut',
        details: 'La commande existe mais n\'a pas pu être mise à jour'
      });
    }
    
    const updatedOrder = result.rows[0];
    console.log(`✅ Statut de la commande mis à jour avec succès en ${duration}ms`);
    
    // Émettre un événement pour la mise à jour du statut de la commande
    const orderUpdateData = {
      orderId: updatedOrder.id,
      oldStatus: oldStatus,
      newStatus: updatedOrder.status,
      updatedAt: updatedOrder.updated_at,
      order: updatedOrder
    };
    
    console.log('📢 Envoi de l\'événement order_updated avec les données:', JSON.stringify(orderUpdateData, null, 2));
    io.to('admin').emit('order_updated', orderUpdateData);
    console.log('✅ Événement order_updated émis avec succès');
    
    // Préparation de la réponse
    const response = {
      success: true,
      message: 'Statut de la commande mis à jour avec succès',
      data: {
        orderId: updatedOrder.id,
        oldStatus: oldStatus,
        newStatus: updatedOrder.status,
        updatedAt: updatedOrder.updated_at
      }
    };
    
    console.log('Réponse envoyée avec succès:', JSON.stringify(response, null, 2));
    return res.json(response);
    
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour du statut de la commande:');
    console.error('Message d\'erreur:', err.message);
    console.error('Code d\'erreur:', err.code);
    console.error('Stack trace:', err.stack);
    
    const errorResponse = {
      success: false,
      error: 'Erreur lors de la mise à jour du statut de la commande',
      orderId: orderId,
      requestedStatus: status,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: err.code
    };
    
    console.error('Réponse d\'erreur:', JSON.stringify(errorResponse, null, 2));
    return res.status(500).json(errorResponse);
    
  } finally {
    if (client) {
      console.log('Libération du client de connexion...');
      client.release();
    }
  }
});

// Supprimer une commande
app.delete('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  
  if (!orderId) {
    return res.status(400).json({ error: 'ID de la commande manquant' });
  }
  
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [orderId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.json({ 
      success: true, 
      message: 'Commande supprimée avec succès',
      deletedId: result.rows[0].id
    });
    
  } catch (err) {
    console.error('Erreur lors de la suppression de la commande:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la commande',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Route pour récupérer tous les messages de contact
app.get('/api/contact', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des messages de contact:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des messages',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Route pour soumettre un nouveau message de contact
app.post('/api/contact', async (req, res) => {
  console.log('\n=== NOUVELLE REQUÊTE /api/contact ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('En-têtes de la requête:', JSON.stringify(req.headers, null, 2));
  
  // Vérifier si le corps de la requête est vide
  if (!req.body || Object.keys(req.body).length === 0) {
    const errorMsg = 'Le corps de la requête est vide ou mal formé';
    console.error('Erreur:', errorMsg);
    return res.status(400).json({ 
      success: false,
      error: errorMsg,
      receivedBody: req.body
    });
  }
  
  console.log('Corps de la requête reçu:', JSON.stringify(req.body, null, 2));
  
  const { fullName, phone, subject = 'Sans objet', message } = req.body;
  
  console.log('Données extraites:', { fullName, phone, subject, message });
  
  // Validation des champs requis
  if (!fullName || !phone || !message) {
    const errorMsg = `Champs manquants: ${!fullName ? 'Nom complet ' : ''}${!phone ? 'Téléphone ' : ''}${!message ? 'Message' : ''}`.trim();
    console.error('Erreur de validation:', errorMsg);
    return res.status(400).json({ 
      success: false,
      error: 'Tous les champs sont obligatoires',
      details: errorMsg,
      receivedData: { fullName, phone, subject, message }
    });
  }
  
  try {
    console.log('Tentative d\'insertion dans la base de données...');
    console.log('Requête SQL:', 'INSERT INTO messages (full_name, phone, subject, message) VALUES ($1, $2, $3, $4) RETURNING id');
    console.log('Paramètres:', [fullName, phone, subject, message]);
    
    const result = await pool.query(
      'INSERT INTO messages (full_name, phone, subject, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [fullName, phone, subject, message]
    );
    
    const messageId = result.rows[0].id;
    console.log(`✅ Nouveau message de contact enregistré avec l'ID: ${messageId}`);
    
    const newMessage = {
      id: messageId,
      full_name: fullName,
      phone: phone,
      subject: subject,
      message: message,
      status: 'unread',
      created_at: new Date().toISOString()
    };

    // Envoyer une notification en temps réel via Socket.IO
    console.log('Envoi de l\'événement new_message aux administrateurs:', newMessage);
    io.to('admin').emit('new_message', newMessage);
    console.log('Notification de nouveau message envoyée aux administrateurs');
    
    // Vérifier les salles actives
    console.log('Salles actives:', io.sockets.adapter.rooms);
    
    const response = { 
      success: true, 
      message: 'Message envoyé avec succès',
      messageId: messageId
    };
    
    console.log('Réponse envoyée:', JSON.stringify(response, null, 2));
    return res.status(201).json(response);
    
  } catch (err) {
    console.error('❌ Erreur lors de l\'enregistrement du message:');
    console.error('Message d\'erreur:', err.message);
    console.error('Stack trace:', err.stack);
    
    const errorResponse = { 
      success: false,
      error: 'Erreur lors de l\'enregistrement du message',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
    
    console.error('Réponse d\'erreur:', JSON.stringify(errorResponse, null, 2));
    return res.status(500).json(errorResponse);
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).send('Erreur serveur');
});

// Configuration du serveur

// Fonction pour obtenir l'adresse IP locale
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const { address, family, internal } = iface;
      if (family === 'IPv4' && !internal) {
        results.push(address);
      }
    }
  }
  return results.length > 0 ? results[0] : '0.0.0.0';
}

const localIp = getLocalIpAddress();

// Démarrer le serveur
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== SERVEUR DÉMARRÉ ===`);
  console.log(`Adresse locale: http://localhost:${PORT}`);
  console.log(`Adresse réseau: http://${localIp}:${PORT}`);
  console.log(`Interface d'admin: http://${localIp}:${PORT}/admin`);
  console.log(`======================\n`);
  
  // Afficher toutes les adresses IP disponibles
  console.log('Adresses réseau disponibles:');
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(ifname => {
    ifaces[ifname].forEach(iface => {
      if ('IPv4' === iface.family && !iface.internal) {
        console.log(`- ${ifname}: http://${iface.address}:${PORT}`);
      }
    });
  });
});

// Vérification de la connexion à la base de données au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err);
  } else {
    console.log('✅ Connecté à la base de données PostgreSQL');
    console.log('🕒 Heure actuelle de la base de données:', res.rows[0].now);
  }
});

// Gestion des connexions
server.on('connection', socket => {
  console.log('Nouvelle connexion de:', socket.remoteAddress);
  socket.setTimeout(30000); // Timeout de 30 secondes
});

// Gestion des erreurs de démarrage du serveur
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé. Veuillez libérer le port ou changer le numéro de port.`);
  } else {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
  }
  process.exit(1);
});

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\nArrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });

  // Forcer l'arrêt après 5 secondes si nécessaire
  setTimeout(() => {
    console.error('Forçage de l\'arrêt du serveur...');
    process.exit(1);
  }, 5000);
});
