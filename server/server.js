const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Création de l'application Express
const app = express();
const PORT = 3003;

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://192.168.3.11:3003',
  'http://192.168.1.*',
  'http://10.0.2.2:3003'  // Pour émulateurs Android
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.some(allowedOrigin => 
    origin && (origin === allowedOrigin || new RegExp(allowedOrigin.replace('*', '.*')).test(origin))
  )) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Répondre immédiatement aux requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Servir les fichiers statiques de l'administration
app.use(express.static(path.join(__dirname, 'admin')));

// Servir les fichiers statiques du dossier public du frontend
app.use(express.static(path.join(__dirname, '..', 'project', 'public')));

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Activation du mode débogage SQLite3
sqlite3.verbose();

// Initialisation de la base de données
console.log('Tentative de connexion à la base de données...');
console.log('Tentative de connexion à la base de données...');
const db = new sqlite3.Database('database.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    console.error('Détails:', err.message);
    console.error('Code d\'erreur:', err.code);
    console.error('Stack:', err.stack);
    process.exit(1);
  } else {
    console.log('Connecté à la base de données SQLite avec succès');
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
function initializeDatabase() {
  console.log('=== DÉBUT DE L\'INITIALISATION DE LA BASE DE DONNÉES ===');
  console.log('Initialisation des tables...');
  // Table des messages de contact
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table messages:', err);
    } else {
      console.log('Table messages créée avec succès');
    }
  });

  // Table des commandes
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      notes TEXT,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table orders:', err);
      return;
    }
    
    console.log('Table orders créée avec succès');
    
    // Vérifier et ajouter les colonnes manquantes si nécessaire
    const requiredColumns = [
      { name: 'firstName', type: 'TEXT NOT NULL' },
      { name: 'lastName', type: 'TEXT NOT NULL' },
      { name: 'phone', type: 'TEXT NOT NULL' },
      { name: 'address', type: 'TEXT NOT NULL' },
      { name: 'city', type: 'TEXT NOT NULL DEFAULT ""' },
      { name: 'notes', type: 'TEXT' },
      { name: 'items', type: 'TEXT NOT NULL' },
      { name: 'total', type: 'REAL NOT NULL' },
      { name: 'status', type: 'TEXT DEFAULT "pending"' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    db.all("PRAGMA table_info(orders)", [], (err, columns) => {
      if (err) {
        console.error('Erreur lors de la vérification des colonnes de la table orders:', err);
        return;
      }
      
      const existingColumns = columns.map(col => col.name);
      console.log('Colonnes existantes dans la table orders:', existingColumns);
      
      requiredColumns.forEach(col => {
        if (!existingColumns.includes(col.name)) {
          console.log(`Ajout de la colonne ${col.name} à la table orders...`);
          db.run(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`, (alterErr) => {
            if (alterErr) {
              console.error(`Erreur lors de l'ajout de la colonne ${col.name}:`, alterErr);
            } else {
              console.log(`Colonne ${col.name} ajoutée avec succès à la table orders`);
            }
          });
        } else {
          console.log(`La colonne ${col.name} existe déjà dans la table orders`);
        }
      });
    });
  });

  // Table des villes
  db.run(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      active BOOLEAN DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table cities:', err);
    } else {
      console.log('Table cities créée avec succès');
      
      // Insérer des villes par défaut si la table est vide
      db.get('SELECT COUNT(*) as count FROM cities', [], (err, row) => {
        if (err) {
          console.error('Erreur lors de la vérification des villes:', err);
          return;
        }
        
        if (row && row.count === 0) {
          const defaultCities = [
            'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
            'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan',
            'Safi', 'El Jadida', 'Béni Mellal', 'Nador', 'Taza'
          ];
          
          const stmt = db.prepare('INSERT INTO cities (name) VALUES (?)');
          defaultCities.forEach(city => stmt.run(city));
          stmt.finalize();
          console.log('Villes par défaut insérées avec succès');
        }
      });
    }
  });

  // Table des produits
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table products:', err);
    } else {
      console.log('Table products créée avec succès');
    }
  });

  // Vérifier si la colonne 'phone' existe dans la table messages
  db.all("PRAGMA table_info(messages)", [], (err, columns) => {
    if (err) {
      console.error('Erreur lors de la vérification des colonnes de la table messages:', err);
      return;
    }
    
    // Vérifier si la colonne 'phone' existe déjà
    const hasPhoneColumn = columns.some(column => column.name === 'phone');
    if (!hasPhoneColumn) {
      console.log('Ajout de la colonne phone à la table messages...');
      db.run('ALTER TABLE messages ADD COLUMN phone TEXT', (alterErr) => {
        if (alterErr) {
          console.error('Erreur lors de l\'ajout de la colonne phone:', alterErr);
        } else {
          console.log('Colonne phone ajoutée avec succès à la table messages');
        }
      });
    } else {
      console.log('La colonne phone existe déjà dans la table messages');
    }
  });
  
  console.log('=== FIN DE L\'INITIALISATION DE LA BASE DE DONNÉES ===');
}

// L'initialisation de la base de données est déjà appelée dans le callback de connexion à la base de données
// Pas besoin d'appeler initializeDatabase() ici car elle est déjà appelée après une connexion réussie

// Servir les fichiers statiques de l'interface d'administration avec gestion d'erreurs
const adminPath = path.join(__dirname, 'admin');

// Middleware pour servir les fichiers statiques avec gestion d'erreurs
app.use('/admin', (req, res, next) => {
  express.static(adminPath, {
    setHeaders: (res, path) => {
      console.log(`Serving static file: ${path}`);
    },
    fallthrough: true
  })(req, res, (err) => {
    if (err) {
      console.error('Erreur lors du chargement du fichier statique:', err);
      next(err);
    } else {
      next();
    }
  });
});

// Route pour l'index de l'admin avec gestion d'erreurs
app.get('/admin', (req, res, next) => {
  const indexPath = path.join(adminPath, 'index.html');
  console.log(`Tentative de chargement du fichier: ${indexPath}`);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Erreur lors du chargement de index.html:', err);
      res.status(500).send('Erreur lors du chargement de l\'interface d\'administration');
    }
  });
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

// Routes pour l'API des messages
app.get('/api/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer un message spécifique par son ID
app.get('/api/messages/:id', (req, res) => {
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  db.get('SELECT * FROM messages WHERE id = ?', [messageId], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération du message:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération du message' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json(row);
  });
});

// Mettre à jour le statut d'un message
app.put('/api/messages/:id/status', (req, res) => {
  const { status } = req.body;
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  db.run(
    'UPDATE messages SET status = ? WHERE id = ?',
    [status, messageId],
    function(err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du statut du message:', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut du message' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Message non trouvé' });
      }
      
      res.json({ success: true, message: 'Statut du message mis à jour avec succès' });
    }
  );
});

// Supprimer un message
app.delete('/api/messages/:id', (req, res) => {
  const messageId = req.params.id;
  
  if (!messageId) {
    return res.status(400).json({ error: 'ID du message manquant' });
  }
  
  db.run('DELETE FROM messages WHERE id = ?', [messageId], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression du message:', err);
      return res.status(500).json({ error: 'Erreur lors de la suppression du message' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    
    res.json({ success: true, message: 'Message supprimé avec succès' });
  });
});

// Route pour l'interface d'administration (doit être la dernière route avant les gestionnaires d'erreurs)
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Routes pour les commandes
app.post('/api/orders', (req, res) => {
  console.log('=== NOUVELLE DEMANDE DE COMMANDE ===');
  console.log('En-têtes de la requête:', req.headers);
  console.log('Corps de la requête:', req.body);
  
  const { firstName, lastName, phone, address, city, notes, items, total } = req.body;
  
  // Validation des champs requis
  if (!firstName || !lastName || !phone || !address || !city || !items || !total) {
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!phone) missingFields.push('phone');
    if (!address) missingFields.push('address');
    if (!city) missingFields.push('city');
    if (!items) missingFields.push('items');
    if (!total) missingFields.push('total');
    
    console.error('Champs manquants dans la requête:', missingFields);
    return res.status(400).json({ 
      error: 'Champs manquants', 
      missingFields,
      message: 'Tous les champs sont obligatoires pour passer une commande.'
    });
  }
  
  if (!city) {
    return res.status(400).json({ error: 'La ville est requise' });
  }
  
  // Accepter n'importe quelle ville en texte libre
  const cityName = city.trim();
  if (!cityName) {
    return res.status(400).json({ error: 'Le nom de la ville est requis' });
  }
  
  // Créer la commande avec le nom de la ville
  db.run(
    'INSERT INTO orders (firstName, lastName, phone, address, city, notes, items, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      firstName, 
      lastName, 
      phone, 
      address, 
      cityName, // Utiliser le nom de la ville saisi
      notes, 
      JSON.stringify(items), 
      total
    ],
    function(err) {
      if (err) {
        console.error('Erreur lors de la création de la commande:', err);
        console.error('Détails de l\'erreur SQLite:', err.message);
        console.error('Code d\'erreur SQLite:', err.code);
        return res.status(500).json({ 
          error: 'Erreur lors de la création de la commande',
          details: err.message,
          code: err.code
        });
      }
      
      // Mettre à jour le stock des produits (si nécessaire)
      if (Array.isArray(items)) {
        items.forEach(item => {
          db.run(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [item.quantity, item.id, item.quantity],
            (updateErr) => {
              if (updateErr) {
                console.error('Erreur lors de la mise à jour du stock:', updateErr);
              }
            }
          );
        });
      }
      
      res.status(201).json({ 
        id: this.lastID,
        message: 'Commande créée avec succès',
        order: {
          id: this.lastID,
          firstName,
          lastName,
          phone,
          address,
          city: cityName,
          notes,
          items,
          total,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      });
    }
  );
});

app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer une commande spécifique par son ID
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  if (!orderId) {
    return res.status(400).json({ error: 'ID de la commande manquant' });
  }
  
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération de la commande:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    // Si les articles sont stockés sous forme de chaîne JSON, les convertir en objet
    try {
      if (row.items && typeof row.items === 'string') {
        row.items = JSON.parse(row.items);
      }
    } catch (e) {
      console.error('Erreur lors du parsing des articles de la commande:', e);
      // On laisse les articles tels quels en cas d'erreur de parsing
    }
    
    res.json(row);
  });
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ changes: this.changes });
    }
  );
});

// Supprimer une commande
app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  if (!orderId) {
    return res.status(400).json({ error: 'ID de la commande manquant' });
  }
  
  db.run('DELETE FROM orders WHERE id = ?', [orderId], function(err) {
    if (err) {
      console.error('Erreur lors de la suppression de la commande:', err);
      return res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.json({ success: true, message: 'Commande supprimée avec succès' });
  });
});

// Route pour soumettre un nouveau message de contact
app.post('/api/contact', (req, res) => {
  console.log('Requête reçue sur /api/contact avec le corps:', req.body);
  
  const { fullName, phone, subject = 'Sans objet', message } = req.body;
  
  // Validation des champs requis
  if (!fullName || !phone || !message) {
    const errorMsg = `Champs manquants: ${!fullName ? 'fullName ' : ''}${!phone ? 'phone ' : ''}${!message ? 'message' : ''}`.trim();
    console.error('Erreur de validation:', errorMsg);
    return res.status(400).json({ error: 'Tous les champs sont obligatoires', details: errorMsg });
  }

  // Validation du format du numéro de téléphone
  const phoneRegex = /^0[67]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    const errorMsg = `Format de téléphone invalide: ${phone}`;
    console.error('Erreur de validation:', errorMsg);
    return res.status(400).json({ 
      error: 'Format de téléphone invalide', 
      details: 'Utilisez un numéro commençant par 06 ou 07 suivi de 8 chiffres.'
    });
  }
  
  db.run(
    'INSERT INTO messages (fullName, email, subject, message, phone) VALUES (?, ?, ?, ?, ?)',
    [fullName, 'contact@evolaine.ma', subject, message, phone],
    function(err) {
      if (err) {
        console.error('Erreur lors de l\'enregistrement du message:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du message' });
      }
      
      // Log pour le débogage
      console.log('Nouveau message enregistré:', {
        id: this.lastID,
        fullName,
        phone,
        subject,
        message
      });
      
      res.status(201).json({ 
        success: true,
        message: 'Message envoyé avec succès',
        id: this.lastID 
      });
    }
  );
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
const os = require('os');

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

// Configuration des options du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
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
  console.log('======================\n');
});

// Gestion des erreurs de connexion
server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${PORT} est déjà utilisé.`);
  } else {
    console.error('Erreur du serveur:', error);
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
    console.error(`Le port ${PORT} est déjà utilisé. Veuillez libérer le port ou changer le numéro de port.`);
  } else {
    console.error('Erreur lors du démarrage du serveur:', error);
  }
  process.exit(1);
});

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\nArrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté.');
    process.exit(0);
  });
});
