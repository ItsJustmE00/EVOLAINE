// Variables globales
let currentOrderId = null;
let currentMessageId = null;

// Configuration de l'URL de l'API
const API_BASE_URL = 'https://evolaine-backend.onrender.com';
const API_URL = API_BASE_URL;

// === Auth ===
async function ensureAdminAuth() {
  if (sessionStorage.getItem('isAdmin') === '1') return;
  let proceed = false;
  while (!proceed) {
    const username = prompt('Nom d\'utilisateur admin:');
    if (username === null) return; // user cancelled
    const password = prompt('Mot de passe:');
    if (password === null) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('isAdmin', '1');
        proceed = true;
        alert('Connecté!');
      } else {
        alert(data.error || 'Échec de la connexion');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  }
}

// Exécuter l'auth avant le reste
await ensureAdminAuth(); // La base de l'URL, car les routes commencent déjà par /api

// Configuration de la connexion WebSocket
console.log('🚀 Initialisation de la connexion WebSocket...');

// Détecter si on est en développement (localhost)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isProduction = window.location.hostname === 'evolaine.vercel.app';

// Configuration des URLs WebSocket
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = isLocalhost 
  ? 'localhost:10000' 
  : isProduction 
    ? 'evolaine-backend.onrender.com'
    : window.location.host;

const wsUrl = isLocalhost
  ? `${wsProtocol}//${wsHost}`
  : `${wsProtocol}//${wsHost}/socket.io`;

console.log('Configuration WebSocket:', {
  hostname: window.location.hostname,
  isLocalhost,
  isProduction,
  wsProtocol,
  wsHost,
  wsUrl
});

// Configuration de la connexion Socket.IO
const socketOptions = {
  // URL du serveur WebSocket
  ...(isLocalhost && { hostname: wsHost }),
  path: '/socket.io',
  
  // Configuration des transports
  transports: ['websocket', 'polling'],
  upgrade: true,
  forceNew: true,
  
  // Gestion de la reconnexion
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  
  // Timeout et gestion des pings
  timeout: 20000,
  pingTimeout: 10000,
  pingInterval: 25000,
  
  // Sécurité
  withCredentials: true,
  rejectUnauthorized: !isLocalhost,
  
  // Debug
  autoConnect: true,
  debug: isLocalhost,
  
  // Headers personnalisés
  extraHeaders: {
    'X-Client-Type': 'admin-panel',
    'X-Client-Version': '1.0.0'
  }
};

console.log('🔌 Configuration WebSocket:', {
  url: wsUrl,
  options: {
    ...socketOptions,
    // Ne pas logger les données sensibles
    extraHeaders: '***'
  }
});

// Créer la connexion Socket.IO
console.log('🔄 Connexion au serveur WebSocket...');
const socket = io(socketOptions);

// Variables pour la gestion des reconnexions
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
let isConnected = false;
let reconnectTimeout;

// Fonction utilitaire pour formater la date
function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Fonction pour mettre à jour l'interface utilisateur avec l'état de connexion
function updateConnectionStatus(connected, message = '') {
  const statusIndicator = document.getElementById('connection-status');
  const statusText = document.getElementById('connection-status-text');
  
  if (statusIndicator) {
    statusIndicator.className = `inline-block w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`;
    statusIndicator.title = connected ? `Connecté (${socket.id})` : 'Déconnecté';
  }
  
  if (statusText) {
    statusText.textContent = connected ? 'Connecté' : 'Déconnecté';
    statusText.className = `text-sm ${connected ? 'text-green-600' : 'text-red-600'}`;
  }
  
  if (message) {
    console.log(`[${formatTimestamp()}] ${message}`);
  }
}

// Fonction pour tenter de se reconnecter
function attemptReconnect() {
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.error(`[${formatTimestamp()}] ❌ Nombre maximum de tentatives de reconnexion atteint (${MAX_CONNECTION_ATTEMPTS})`);
    updateConnectionStatus(false, 'Échec de la connexion au serveur. Veuillez rafraîchir la page.');
    return;
  }
  
  const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000); // Augmentation exponentielle avec un maximum de 30s
  connectionAttempts++;
  
  console.log(`[${formatTimestamp()}] 🔄 Tentative de reconnexion ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS} dans ${delay}ms...`);
  
  reconnectTimeout = setTimeout(() => {
    if (!isConnected) {
      socket.connect();
    }
  }, delay);
}

// Fonction pour gérer la connexion à la room admin
function joinAdminRoom() {
  const joinAttempt = () => {
    console.log(`[${formatTimestamp()}] 🔑 Envoi de la demande de connexion à la room admin...`);
    
    socket.emit('admin_join', { 
      timestamp: new Date().toISOString(),
      clientInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth
        }
      }
    }, (response) => {
      if (response && response.success) {
        isConnected = true;
        connectionAttempts = 0;
        clearTimeout(reconnectTimeout);
        updateConnectionStatus(true, '✅ Connecté avec succès au panneau d\'administration');
        console.log(`[${formatTimestamp()}] ✅ Connecté à la room admin:`, response);
      } else {
        console.error(`[${formatTimestamp()}] ❌ Échec de la connexion à la room admin:`, response);
        updateConnectionStatus(false, 'Échec de la connexion au panneau d\'administration');
        attemptReconnect();
      }
    });
  };
  
  // Essayer immédiatement
  joinAttempt();
  
  
}

// Gestion des événements de connexion
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser l'état de connexion
  updateConnectionStatus(false, 'Connexion en cours...');
  
  // Configurer les écouteurs d'événements
  
  // Connexion établie
  socket.on('connect', () => {
    console.log(`[${formatTimestamp()}] 🌐 Connecté au serveur WebSocket avec l'ID:`, socket.id);
    updateConnectionStatus(true, 'Connexion au serveur établie');
    joinAdminRoom();
  });
  
  // Déconnexion
  socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log(`[${formatTimestamp()}] 🔌 Déconnecté du serveur. Raison:`, reason);
    updateConnectionStatus(false, 'Déconnecté du serveur');
    
    if (reason === 'io server disconnect') {
      // La déconnexion a été initiée par le serveur, on se reconnecte
      console.log(`[${formatTimestamp()}] 🔄 Tentative de reconnexion...`);
      socket.connect();
    } else {
      // Autre raison de déconnexion, on tente de se reconnecter
      attemptReconnect();
    }
  });
  
  // Erreur de connexion
  socket.on('connect_error', (error) => {
    console.error(`[${formatTimestamp()}] ❌ Erreur de connexion:`, error.message);
    updateConnectionStatus(false, `Erreur de connexion: ${error.message}`);
    
    if (!isConnected) {
      attemptReconnect();
    }
  });
  
  // Réception d'un message de bienvenue
  socket.on('admin_welcome', (data) => {
    console.log(`[${formatTimestamp()}] 👋 Message de bienvenue:`, data.message);
    showNotification(data.message, 'success');
  });
  
  // Autres gestionnaires d'événements...
});

// Gestion des déconnexions
socket.on('disconnect', (reason) => {
  const timestamp = formatTimestamp();
  console.log(`[${timestamp}] ❌ Déconnecté du serveur. Raison:`, reason);
  
  // Mettre à jour le statut de connexion dans l'interface
  const statusIndicator = document.getElementById('connection-status');
  if (statusIndicator) {
    statusIndicator.className = 'inline-block w-3 h-3 rounded-full bg-red-500 mr-2';
    statusIndicator.title = `Déconnecté: ${reason}`;
  }
});

// Gestion des erreurs de connexion
socket.on('connect_error', (error) => {
  const timestamp = formatTimestamp();
  console.error(`[${timestamp}] ❌ Erreur de connexion:`, error);
  
  // Mettre à jour le statut de connexion dans l'interface
  const statusIndicator = document.getElementById('connection-status');
  if (statusIndicator) {
    statusIndicator.className = 'inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2';
    statusIndicator.title = `Erreur: ${error.message || 'Inconnue'}`;
  }
});

// Écouter les messages de bienvenue du serveur
socket.on('welcome', (data) => {
  const timestamp = formatTimestamp();
  console.log(`[${timestamp}] 🌟 Message de bienvenue du serveur:`, data);
  
  // Afficher une notification à l'utilisateur
  showNotification(`Connecté au serveur (${socket.id})`, 'success');
});

// Écouter les messages de test du serveur
socket.on('test_message', (data) => {
  const timestamp = formatTimestamp();
  console.log(`[${timestamp}] 📨 Message de test reçu du serveur:`, data);
  
  // Afficher une notification à l'utilisateur
  showNotification('Message de test reçu du serveur', 'info');
  
  // Répondre au serveur
  socket.emit('test_message', {
    message: 'Réponse du client',
    timestamp: new Date().toISOString(),
    clientId: socket.id
  });
});

// Vérifier périodiquement l'état de la connexion
setInterval(() => {
  const timestamp = formatTimestamp();
  const status = socket.connected ? 'connecté' : 'déconnecté';
  console.log(`[${timestamp}] 🔄 Statut de la connexion: ${status} (${socket.id || 'N/A'})`);
  
  // Si déconnecté, essayer de se reconnecter
  if (!socket.connected) {
    console.log(`[${timestamp}] 🔄 Tentative de reconnexion...`);
    socket.connect();
  }
}, 30000); // Vérifier toutes les 30 secondes

// Écouter les nouveaux messages en temps réel
socket.on('new_message', (message) => {
  const timestamp = formatTimestamp();
  console.log(`[${timestamp}] 📨 Événement new_message reçu:`, message);
  
  // Vérifier si le message est valide
  if (!message || !message.id) {
    console.error(`[${timestamp}] ❌ Message invalide reçu:`, message);
    return;
  }
  
  console.log(`[${timestamp}] 📝 Détails du message:`, {
    id: message.id,
    from: message.full_name,
    subject: message.subject,
    timestamp: message.created_at || new Date().toISOString()
  });
  
  // Jouer un son de notification
  try {
    console.log(`[${timestamp}] 🔉 Tentative de lecture du son de notification...`);
    playNotificationSound();
    console.log(`[${timestamp}] ✅ Son de notification joué avec succès`);
  } catch (soundError) {
    console.error(`[${timestamp}] ❌ Erreur lors de la lecture du son:`, soundError);
  }
  
  // Afficher une notification
  try {
    const notificationText = `Nouveau message de ${message.full_name || 'un visiteur'}`;
    console.log(`[${timestamp}] 💬 Affichage de la notification:`, notificationText);
    showNotification(notificationText, 'info');
  } catch (notifError) {
    console.error(`[${timestamp}] ❌ Erreur lors de l'affichage de la notification:`, notifError);
  }
  
  // Vérifier la section active
  const activeSection = document.querySelector('.content-section:not(.hidden)');
  console.log(`[${timestamp}] 🏷️ Section active détectée:`, activeSection ? activeSection.id : 'aucune');
  
  // Si on est sur la page des messages, recharger la liste
  if (activeSection && activeSection.id === 'messages') {
    console.log(`[${timestamp}] 🔄 Rechargement des messages...`);
    loadMessages()
      .then(() => console.log(`[${timestamp}] ✅ Messages rechargés avec succès`))
      .catch(err => console.error(`[${timestamp}] ❌ Erreur lors du rechargement des messages:`, err));
  } else {
    console.log(`[${timestamp}] ℹ️ Section active n'est pas 'messages', pas de rechargement automatique`);
  }
});

// Gestion des erreurs de connexion WebSocket
socket.on('connect_error', (error) => {
  const errorMessage = error.message || 'Erreur inconnue';
  const timestamp = formatTimestamp();
  console.error(`[${timestamp}] ❌ Erreur de connexion WebSocket:`, errorMessage);
  
  // Mettre à jour le statut de connexion dans l'interface
  const statusIndicator = document.getElementById('connection-status');
  if (statusIndicator) {
    statusIndicator.className = 'inline-block w-3 h-3 rounded-full bg-red-500 mr-2';
    statusIndicator.title = `Déconnecté: ${errorMessage}`;
  }
  
  // Afficher une notification d'erreur
  showNotification('Erreur de connexion au serveur. Tentative de reconnexion...', 'error');
  
  // Tenter de se reconnecter avec un délai exponentiel
  const reconnectDelay = Math.min(socket.io.reconnectionAttempts * 1000, 30000); // Max 30s
  
  console.log(`[${timestamp}] 🔄 Tentative de reconnexion dans ${reconnectDelay/1000} secondes...`);
  
  setTimeout(() => {
    console.log(`[${formatTimestamp()}] 🔄 Tentative de reconnexion...`);
    socket.connect();
  }, reconnectDelay);
});

// Gestion de la déconnexion WebSocket
socket.on('disconnect', (reason) => {
  const timestamp = formatTimestamp();
  console.log(`[${timestamp}] 🔌 Déconnecté du serveur WebSocket. Raison:`, reason);
  
  // Mettre à jour le statut de connexion dans l'interface
  const statusIndicator = document.getElementById('connection-status');
  if (statusIndicator) {
    statusIndicator.className = 'inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2';
    statusIndicator.title = 'Déconnecté';
  }
  
  if (reason === 'io server disconnect') {
    // Si le serveur a déconnecté, on se reconnecte
    console.log(`[${timestamp}] 🔄 Tentative de reconnexion au serveur...`);
    socket.connect();
  }
});

console.log('🌐 URL de l\'API configurée sur:', API_URL);

// Log de débogage
console.log('admin.js chargé avec succès');

// Initialisation de l'interface
// Fonction pour mettre à jour les compteurs du tableau de bord
async function updateDashboardCounters() {
  try {
    console.log('Mise à jour des compteurs du tableau de bord...');
    const response = await fetch(`${API_URL}/api/stats/overview`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Données des compteurs reçues:', data);
    
    // Mettre à jour les compteurs du tableau de bord
    if (data) {
      // Mettre à jour le nombre de nouvelles commandes
      const newOrdersElement = document.getElementById('new-orders-count');
      if (newOrdersElement) {
        // Utiliser data.newOrders pour les nouvelles commandes
        const newOrdersCount = data.newOrders || 0;
        newOrdersElement.textContent = newOrdersCount;
        console.log('🔢 Compteur de nouvelles commandes mis à jour:', newOrdersCount);
      }
      
      // Mettre à jour le nombre de messages non lus
      const unreadMessagesElement = document.getElementById('unread-messages-count');
      if (unreadMessagesElement) {
        unreadMessagesElement.textContent = data.unreadMessages || 0;
      }
      
      // Mettre à jour le chiffre d'affaires
      const revenueElement = document.getElementById('revenue');
      if (revenueElement) {
        const revenue = parseFloat(data.revenue || 0);
        revenueElement.textContent = `${revenue.toFixed(2)} DH`;
      }
    }
    
    console.log('Compteurs du tableau de bord mis à jour avec succès');
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des compteurs du tableau de bord:', error);
    
    // En cas d'erreur, essayer de mettre à jour avec les données locales
    try {
      const pendingCount = allOrders.filter(order => order.status === 'pending' || order.status === 'en_attente').length;
      
      const totalOrdersElement = document.getElementById('total-orders');
      if (totalOrdersElement) {
        totalOrdersElement.textContent = allOrders.length;
      }
      
      const pendingOrdersElement = document.getElementById('pending-orders');
      if (pendingOrdersElement) {
        pendingOrdersElement.textContent = pendingCount;
      }
      
      const totalRevenue = allOrders.reduce((sum, order) => {
        return sum + parseFloat(order.total || 0);
      }, 0);
      
      const revenueElement = document.getElementById('revenue');
      if (revenueElement) {
        revenueElement.textContent = `${totalRevenue.toFixed(2)} DH`;
      }
      
      console.log('Compteurs mis à jour localement avec succès');
    } catch (localError) {
      console.error('Erreur lors de la mise à jour locale des compteurs:', localError);
    }
    
    throw error; // Propager l'erreur pour une gestion ultérieure
  }
}

// Fonction pour afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Ajouter la notification au conteneur
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        // Créer le conteneur s'il n'existe pas
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }
    
    document.getElementById('notification-container').appendChild(notification);
    
    // Supprimer la notification après 5 secondes
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Fonction pour formater la date
function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation de l\'interface');
    
    // Fonction utilitaire pour forcer la mise à jour de l'interface
    const forceUIRefresh = () => {
        console.log('🔁 Forçage de la mise à jour de l\'interface...');
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            if (activeSection.id === 'dashboard') {
                console.log('📊 Mise à jour du tableau de bord...');
                updateDashboard();
            } else if (activeSection.id === 'orders-section') {
                console.log('🔄 Rechargement des commandes...');
                loadOrders();
            }
        }
    };
    
    // Fonction pour gérer une nouvelle commande
    const handleNewOrder = async (orderData) => {
        try {
            console.log('🆕 Nouvelle commande reçue:', orderData);
            
            // Afficher une notification
            const customerName = orderData.first_name && orderData.last_name 
                ? `${orderData.first_name} ${orderData.last_name}` 
                : 'un client';
                
            showNotification(
                `Nouvelle commande #${orderData.id} de ${customerName}`,
                'success'
            );
            
            // Jouer un son de notification
            playNotificationSound();
            
            // Mettre à jour le tableau de bord en priorité
            try {
                console.log('🔄 Mise à jour des compteurs du tableau de bord...');
                
                // Mettre à jour le compteur de nouvelles commandes immédiatement
                const newOrdersElement = document.getElementById('new-orders-count');
                if (newOrdersElement) {
                    // Récupérer le nombre actuel de commandes en attente
                    const currentCount = parseInt(newOrdersElement.textContent) || 0;
                    // Si la commande est en attente, incrémenter le compteur
                    if (orderData.status === 'pending' || orderData.status === 'En attente') {
                        newOrdersElement.textContent = currentCount + 1;
                        console.log('➕ Compteur de nouvelles commandes incrémenté à:', currentCount + 1);
                    }
                }
                
                // Mettre à jour les autres compteurs
                await updateDashboard();
                console.log('✅ Tableau de bord mis à jour avec succès');
            } catch (error) {
                console.error('❌ Erreur lors de la mise à jour des compteurs:', error);
            }
            
            // Mettre à jour la liste des commandes si nécessaire
            const activeSection = document.querySelector('.content-section.active');
            const shouldUpdateOrders = activeSection && 
                (activeSection.id === 'orders-section' || activeSection.id === 'dashboard');
                
            if (shouldUpdateOrders) {
                console.log('🔄 Mise à jour de la liste des commandes...');
                try {
                    // Ajouter la nouvelle commande au tableau existant
                    if (Array.isArray(allOrders)) {
                        // Vérifier que la commande n'existe pas déjà
                        const orderExists = allOrders.some(o => o.id === orderData.id);
                        if (!orderExists) {
                            allOrders.unshift(orderData);
                            console.log('✅ Nouvelle commande ajoutée à la liste');
                            
                            // Mettre à jour l'affichage
                            if (activeSection.id === 'dashboard') {
                                // Pour le dashboard, on recharge tout pour être sûr
                                updateDashboard();
                            } else {
                                // Pour la page des commandes, on met à jour en incrémental
                                filterAndDisplayOrders();
                            }
                        } else {
                            console.log('ℹ️ Commande déjà présente dans la liste, mise à jour...');
                            // Mettre à jour la commande existante
                            const index = allOrders.findIndex(o => o.id === orderData.id);
                            if (index !== -1) {
                                allOrders[index] = orderData;
                                filterAndDisplayOrders();
                            }
                        }
                    } else {
                        // Si allOrders n'est pas un tableau, recharger complètement
                        console.log('ℹ️ Rechargement complet des commandes...');
                        await loadOrders();
                    }
                } catch (error) {
                    console.error('❌ Erreur lors de la mise à jour des commandes:', error);
                }
            }
            
        } catch (error) {
            console.error('Erreur lors du traitement de la nouvelle commande:', error);
            showNotification(
                'Erreur lors de la mise à jour des commandes',
                'error'
            );
        }
    };
    
    // Écouter les nouvelles commandes
    socket.on('new_order', handleNewOrder);
    console.log('👂 Écoute des nouvelles commandes activée');
    
    // Écouter les mises à jour de statut des commandes
    socket.on('order_updated', (data) => {
        console.log('🔄 Mise à jour du statut de la commande reçue:', data);
        
        // Mettre à jour la commande dans le tableau allOrders
        if (Array.isArray(allOrders)) {
            const orderIndex = allOrders.findIndex(o => o.id === data.orderId);
            if (orderIndex !== -1) {
                // Mettre à jour le statut de la commande
                allOrders[orderIndex].status = data.newStatus;
                allOrders[orderIndex].updated_at = data.updatedAt;
                
                // Afficher une notification
                showNotification(
                    `Statut de la commande #${data.orderId} mis à jour: ${data.oldStatus} → ${data.newStatus}`,
                    'info'
                );
                
                // Mettre à jour l'affichage
                const activeSection = document.querySelector('.content-section.active');
                if (activeSection && activeSection.id === 'dashboard') {
                    updateDashboard();
                } else if (activeSection && activeSection.id === 'orders-section') {
                    filterAndDisplayOrders();
                }
                
                // Mettre à jour la vue détaillée si la commande est actuellement affichée
                if (currentOrderId === data.orderId) {
                    viewOrder(data.orderId);
                }
            } else {
                console.log('Commande non trouvée dans la liste, rechargement...');
                loadOrders();
            }
        }
        
        // Mettre à jour les compteurs du tableau de bord
        updateDashboardCounters().catch(error => {
            console.error('Erreur lors de la mise à jour des compteurs:', error);
        });
    });
    console.log('👂 Écoute des mises à jour de statut des commandes activée');
    
    // Fonction pour jouer un son de notification
    function playNotificationSound() {
        try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alert-quick-chime-766.mp3');
            audio.volume = 0.3; // Réduire le volume
            audio.play().catch(e => console.log('Impossible de lire le son de notification:', e));
        } catch (error) {
            console.error('Erreur lors de la lecture du son de notification:', error);
        }
    }
    
    // Initialisation des écouteurs d'événements
    function initEventListeners() {
        // Suppression des écouteurs existants pour éviter les doublons
        const removeAllListeners = (element, event) => {
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            return newElement;
        };

        // Navigation
        const dashboardTab = removeAllListeners(document.getElementById('dashboard-tab'), 'click');
        dashboardTab.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('dashboard');
        });

        const ordersTab = removeAllListeners(document.getElementById('orders-tab'), 'click');
        ordersTab.addEventListener('click', (e) => {
            e.preventDefault();
            // Afficher un indicateur de chargement
            const container = document.getElementById('orders-list');
            if (container) {
                container.innerHTML = '<div class="p-8 text-center text-gray-500">Chargement des commandes...</div>';
            }
            // La fonction showSection appellera loadOrders automatiquement
            showSection('orders');
        });

        const messagesTab = removeAllListeners(document.getElementById('messages-tab'), 'click');
        messagesTab.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('messages');
            loadMessages();
        });

        // Filtres
        const orderFilter = removeAllListeners(document.getElementById('order-filter'), 'change');
        orderFilter.addEventListener('change', loadOrders);
        
        const messageFilter = removeAllListeners(document.getElementById('message-filter'), 'change');
        messageFilter.addEventListener('change', loadMessages);
    }

    // Initialisation
    initEventListeners();
    
    // Restaurer la section active après l'initialisation complète
    setTimeout(() => {
        restoreActiveSection();
    }, 50);
});

// Fonction pour restaurer la section active au chargement de la page
function restoreActiveSection() {
    // Vérifier d'abord l'URL pour un hash
    const hashSection = window.location.hash.replace('#', '');
    
    // Vérifier ensuite le localStorage
    const savedSection = localStorage.getItem('activeSection');
    
    // Déterminer quelle section afficher (hash > localStorage > 'dashboard' par défaut)
    const sectionToShow = hashSection || savedSection || 'dashboard';
    
    // Afficher la section
    showSection(sectionToShow);
}

// Fonctions d'affichage
function showSection(sectionId) {
    console.log(`Affichage de la section: ${sectionId}`);
    
    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Désactiver tous les onglets
    document.querySelectorAll('nav a').forEach(tab => {
        tab.classList.remove('bg-indigo-800');
        tab.classList.add('hover:bg-indigo-600');
    });
    
    // Afficher la section demandée
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        
        // Activer l'onglet correspondant
        const tab = document.getElementById(`${sectionId}-tab`);
        if (tab) {
            tab.classList.add('bg-indigo-800');
            tab.classList.remove('hover:bg-indigo-600');
        }
        
        // Sauvegarder la section active
        localStorage.setItem('activeSection', sectionId);
        
        // Mettre à jour l'URL avec le hash
        if (window.location.hash !== `#${sectionId}`) {
            window.history.pushState(null, null, `#${sectionId}`);
        }
        
        // Charger les données si nécessaire
        if (sectionId === 'orders') {
            loadOrders();
        } else if (sectionId === 'messages') {
            loadMessages();
        } else if (sectionId === 'dashboard') {
            updateDashboard();
        }
        
        console.log(`Section ${sectionId} affichée avec succès`);
    } else {
        console.error(`Section non trouvée: ${sectionId}`);
    }
}

// Fonctions pour le tableau de bord
async function updateDashboard() {
    try {
        console.log('Mise à jour du tableau de bord...');
        const response = await fetch(`${API_URL}/api/stats/overview`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur de réponse du serveur:', errorText);
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        const stats = await response.json();
        console.log('Statistiques reçues:', stats);
        
        // Vérifier la structure des données reçues
        console.log('Détails des statistiques reçues:', JSON.stringify(stats, null, 2));
        
        // Mettre à jour les compteurs avec la structure des données reçues
        // La route renvoie { newOrders, unreadMessages, revenue, recentOrders }
        const newOrdersCount = stats.newOrders || 0;
        const unreadMessagesCount = stats.unreadMessages || 0;
        const revenue = stats.revenue || 0;
        
        console.log('Nouvelles commandes:', newOrdersCount);
        console.log('Messages non lus:', unreadMessagesCount);
        console.log('Chiffre d\'affaires:', revenue);
        
        // Mettre à jour les éléments du DOM
        const newOrdersElement = document.getElementById('new-orders-count');
        const unreadMessagesElement = document.getElementById('unread-messages-count');
        const revenueElement = document.getElementById('revenue');
        
        if (newOrdersElement) newOrdersElement.textContent = newOrdersCount;
        if (unreadMessagesElement) unreadMessagesElement.textContent = unreadMessagesCount;
        if (revenueElement) revenueElement.textContent = revenue.toFixed(2);

        // Afficher les commandes récentes
        if (stats.recentOrders && Array.isArray(stats.recentOrders)) {
            console.log('Commandes récentes trouvées:', stats.recentOrders.length);
            displayRecentOrders(stats.recentOrders);
        } else {
            console.warn('Aucune donnée de commandes récentes trouvée dans stats.recentOrders');
            const recentOrdersContainer = document.getElementById('recent-orders');
            if (recentOrdersContainer) {
                recentOrdersContainer.innerHTML = 
                    '<p class="text-gray-500">Aucune commande récente</p>';
            }
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du tableau de bord:', error);
        alert('Erreur lors du chargement des données du tableau de bord');
    }
}

function displayRecentOrders(orders) {
    const container = document.getElementById('recent-orders');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Aucune commande récente</p>';
        return;
    }

    const ordersHtml = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${orders.map(order => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">#${order.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${order.first_name || ''} ${order.last_name || ''}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date inconnue'}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${parseFloat(order.total).toFixed(2)} DH</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(order.status)}">
                                    ${order.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button onclick="viewOrder(${order.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = ordersHtml;
}

// Fonction utilitaire pour obtenir la classe CSS en fonction du statut
function getStatusClass(status) {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('en attente') || statusLower === 'pending') {
        return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower.includes('traitée') || statusLower.includes('en cours') || statusLower === 'processing') {
        return 'bg-blue-100 text-blue-800';
    } else if (statusLower.includes('expédiée') || statusLower === 'shipped') {
        return 'bg-purple-100 text-purple-800';
    } else if (statusLower.includes('livrée') || statusLower.includes('terminée') || statusLower === 'completed' || statusLower === 'delivered') {
        return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('annulée') || statusLower === 'cancelled') {
        return 'bg-red-100 text-red-800';
    } else if (statusLower.includes('remboursée') || statusLower === 'refunded') {
        return 'bg-gray-100 text-gray-800';
    } else {
        return 'bg-gray-100 text-gray-800';
    }
}

// Fonction pour afficher les détails d'une commande
async function viewOrder(orderId) {
    try {
        console.log(`Affichage des détails de la commande #${orderId}`);
        
        // Récupérer les détails complets de la commande
        const response = await fetch(`${API_URL}/api/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const order = await response.json();
        
        // Créer le contenu de la modal
        const modalContent = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Commande #${order.id}</h3>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 class="font-medium text-gray-700 mb-2">Informations client</h4>
                                <p>${order.first_name} ${order.last_name}</p>
                                <p>${order.phone}</p>
                                <p>${order.address}</p>
                                <p>${order.city}</p>
                                ${order.notes ? `<p class="mt-2"><span class="font-medium">Notes :</span> ${order.notes}</p>` : ''}
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-700 mb-2">Détails de la commande</h4>
                                <p><span class="font-medium">Date :</span> ${new Date(order.created_at).toLocaleString()}</p>
                                <p><span class="font-medium">Statut :</span> 
                                    <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(order.status)}">
                                        ${order.status}
                                    </span>
                                </p>
                                <p class="mt-2"><span class="font-medium">Total :</span> ${parseFloat(order.total).toFixed(2)} DH</p>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="font-medium text-gray-700 mb-3">Articles commandés</h4>
                            <div class="border rounded-lg overflow-hidden">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        ${(order.items || []).map(item => `
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        ${item.image ? `
                                                            <div class="flex-shrink-0 h-10 w-10">
                                                                <img class="h-10 w-10 rounded-md object-cover" src="${item.image}" alt="${item.name}">
                                                            </div>
                                                        ` : ''}
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900">${item.name}</div>
                                                            ${item.description ? `<div class="text-sm text-gray-500">${item.description}</div>` : ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${parseFloat(item.price).toFixed(2)} DH
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${item.quantity}
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)} DH
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="flex justify-between items-center pt-4 border-t">
                            <div class="text-lg font-semibold">
                                Total : ${parseFloat(order.total).toFixed(2)} DH
                            </div>
                            <div class="space-x-2">
                                <button onclick="updateOrderStatus(${order.id}, 'cancelled')" 
                                        class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                                    Annuler
                                </button>
                                <button onclick="updateOrderStatus(${order.id}, 'completed')" 
                                        class="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
                                    Marquer comme terminée
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter la modal au document
        document.body.insertAdjacentHTML('beforeend', modalContent);
        
    } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande:', error);
        alert('Erreur lors du chargement des détails de la commande');
    }
}

// Fonction pour mettre à jour le statut d'une commande
async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log(`Mise à jour du statut de la commande #${orderId} vers: ${newStatus}`);
        
        const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Statut mis à jour avec succès:', result);
        
        // Mettre à jour l'affichage
        const orderElement = document.querySelector(`tr[data-order-id="${orderId}"]`);
        if (orderElement) {
            const statusElement = orderElement.querySelector('.status-badge');
            if (statusElement) {
                statusElement.className = `status-badge px-2 py-1 rounded ${getStatusClass(newStatus)}`;
                statusElement.textContent = newStatus;
            }
        }
        
        // Fermer la modal
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
            modal.remove();
        }
        
        // Rafraîchir le tableau de bord
        updateDashboard();
        
        // Afficher une notification
        showNotification(`Statut de la commande #${orderId} mis à jour avec succès`, 'success');
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la commande:', error);
        alert('Erreur lors de la mise à jour du statut de la commande');
    }
}

// Fonctions pour la gestion des commandes
let allOrders = [];
let currentFilter = 'all';
let currentSearchTerm = '';

// Fonction appelée par la modal pour mettre à jour le statut sélectionné
function updateSelectedOrderStatus() {
    const select = document.getElementById('order-status');
    if (!select) return;
    const frStatus = select.value;
    // Mapping français -> valeurs API
    const statusMap = {
        'Nouvelle': 'pending',
        'En cours': 'processing',
        'Terminée': 'completed',
        'Annulée': 'cancelled'
    };
    const newStatus = statusMap[frStatus];
    if (!newStatus) {
        alert('Statut non reconnu');
        return;
    }
    if (!currentOrderId) {
        alert('ID de la commande introuvable');
        return;
    }
    updateOrderStatus(currentOrderId, newStatus);
}

// Fonction utilitaire pour obtenir le nom de l'expéditeur d'un message
function getMessageSenderName(message) {
    if (!message) return 'Expéditeur inconnu';
    
    // Essayer différents champs de nom possibles
    if (message.full_name) return message.full_name;
    if (message.name) return message.name;
    if (message.first_name || message.last_name) {
        return `${message.first_name || ''} ${message.last_name || ''}`.trim();
    }
    if (message.email) return message.email;
    
    return 'Expéditeur inconnu';
}

// Fonction pour filtrer et afficher les commandes
function filterAndDisplayOrders() {
    const filteredOrders = allOrders.filter(order => {
        // Filtre par statut
        const statusMatch = currentFilter === 'all' || order.status === currentFilter;
        
        // Filtre par recherche
        const searchTerm = currentSearchTerm.toLowerCase();
        const searchMatch = !searchTerm || 
            (order.id && order.id.toString().includes(searchTerm)) ||
            (order.first_name && order.first_name.toLowerCase().includes(searchTerm)) ||
            (order.last_name && order.last_name.toLowerCase().includes(searchTerm)) ||
            (order.phone && order.phone.includes(searchTerm)) ||
            (order.address && order.address.toLowerCase().includes(searchTerm)) ||
            (order.city && order.city.toLowerCase().includes(searchTerm));
        
        return statusMatch && searchMatch;
    });
    
    // Mise à jour du statut de recherche
    const searchStatus = document.getElementById('search-status');
    if (searchStatus) {
        if (currentSearchTerm) {
            searchStatus.textContent = `${filteredOrders.length} commande(s) trouvée(s) pour "${currentSearchTerm}"`;
        } else {
            searchStatus.textContent = '';
        }
    }
    
    // Utiliser displayOrders pour afficher les commandes dans la section principale
    const ordersSection = document.getElementById('orders-list');
    if (ordersSection) {
        if (typeof displayOrders === 'function') {
            displayOrders(filteredOrders);
        } else {
            console.error('La fonction displayOrders n\'est pas définie');
            ordersSection.innerHTML = `
                <div class="p-4 text-red-600">
                    Erreur: Impossible d'afficher les commandes. La fonction d'affichage est manquante.
                </div>
            `;
        }
    } else {
        console.error('Élément orders-list non trouvé dans le DOM');
    }
}

// Charger les commandes
async function loadOrders() {
    try {
        const url = `${API_URL}/api/orders`;
        console.log('Tentative de chargement des commandes depuis:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Erreur HTTP:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Réponse du serveur:', errorText);
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Réponse de l\'API (brute):', result);
        
        // Vérifier si la réponse a une propriété data qui est un tableau
        if (result && result.data && Array.isArray(result.data)) {
            console.log('Format de réponse: {data: [...]}');
            allOrders = result.data;
        } 
        // Si la réponse est directement un tableau
        else if (Array.isArray(result)) {
            console.log('Format de réponse: tableau');
            allOrders = result;
        }
        // Si la réponse est un objet avec des propriétés de commande
        else if (result && typeof result === 'object' && !Array.isArray(result)) {
            console.log('Format de réponse: objet unique');
            allOrders = [result];
        }
        // Autres cas
        else {
            console.error('Format de réponse inattendu:', result);
            throw new Error('Format de réponse inattendu du serveur');
        }
        
        console.log('Commandes chargées avec succès:', allOrders.length, 'commandes');
        
        // Trier les commandes par date (les plus récentes d'abord)
        allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Mettre à jour l'affichage
        filterAndDisplayOrders();
        
        // Mettre à jour les compteurs du tableau de bord
        await updateDashboardCounters();
        
        return allOrders;
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        const errorContainer = document.getElementById('orders-list');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="p-4 text-red-600">
                    Erreur lors du chargement des commandes: ${error.message}
                </div>
            `;
        }
        throw error; // Propager l'erreur pour une gestion ultérieure
    }
}

// Afficher la liste des messages dans le tableau
if (typeof window.displayMessages === 'undefined') {
  function displayMessages(messages) {
    const container = document.getElementById('messages-list');
    if (!container) return;
    if (!Array.isArray(messages) || messages.length === 0) {
      container.innerHTML = '<p class="text-gray-500">Aucun message trouvé.</p>';
      return;
    }

    const rows = messages.map(msg => {
      const statusClass = msg.is_read ? 'status-read' : 'status-unread';
      const senderName = msg.full_name || msg.name || msg.email || 'Sans nom';
      const created = new Date(msg.created_at).toLocaleString('fr-FR');
      return `
        <tr class="border-b hover:bg-gray-50 ${statusClass}">
          <td class="px-4 py-2 whitespace-nowrap">${msg.id}</td>
          <td class="px-4 py-2">${senderName}</td>
          <td class="px-4 py-2">${created}</td>
          <td class="px-4 py-2 text-right">
            <button class="text-indigo-600 hover:text-indigo-900 mr-2" onclick="viewMessage(${msg.id})"><i class="fas fa-eye"></i></button>
            <button class="text-red-600 hover:text-red-900" onclick="deleteMessage(${msg.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${rows}
        </tbody>
      </table>`;
  }
  window.displayMessages = displayMessages;
}

// Charger les messages depuis l'API
async function loadMessages() {
    try {
        const url = `${API_URL}/api/messages`;
        console.log('Chargement des messages depuis:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Erreur HTTP:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Réponse du serveur:', errorText);
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const messages = await response.json();
        console.log('Messages reçus de l\'API:', messages);
        
        // Vérifier si le conteneur des messages existe
        const messagesContainer = document.getElementById('messages-list');
        console.log('Conteneur des messages:', messagesContainer ? 'trouvé' : 'non trouvé');
        
        if (!messagesContainer) {
            console.error('Le conteneur des messages n\'a pas été trouvé dans le DOM');
            return;
        }
        
        displayMessages(messages);
    } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        document.getElementById('messages-list').innerHTML = `
            <div class="p-4 text-red-600">
                Erreur lors du chargement des messages. Veuillez réessayer.
            </div>
        `;
    }
}

// Afficher les détails d'une commande
if (typeof window.currentOrderId === 'undefined') {
  window.currentOrderId = null;
}

if (!window.viewOrder) {
async function viewOrder(orderId) {
    try {
        const url = `${API_URL}/api/orders/${orderId}`;
        console.log(`Chargement de la commande #${orderId} depuis:`, url);
        const response = await fetch(url);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors du chargement de la commande');
        }
        
        const order = result.data;
        window.currentOrderId = order.id;
        
        // Mettre à jour le modal avec les détails de la commande
        document.getElementById('order-id').textContent = `#${order.id}`;
        document.getElementById('customer-name').textContent = `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Non spécifié';
        document.getElementById('customer-phone').textContent = order.phone || 'Non spécifié';
        document.getElementById('customer-address').textContent = [order.address, order.city].filter(Boolean).join(', ') || 'Adresse non spécifiée';
        document.getElementById('order-city').textContent = order.city || 'Ville non spécifiée';
        document.getElementById('order-notes').textContent = order.notes || 'Aucune note';
        document.getElementById('order-status').value = order.status || 'pending';
        document.getElementById('order-date').textContent = order.created_at ? new Date(order.created_at).toLocaleString() : 'Date inconnue';
        document.getElementById('order-total').textContent = order.total ? parseFloat(order.total).toFixed(2) : '0.00';
        
        // Afficher les articles
        const itemsContainer = document.getElementById('order-items');
        // Vérifier si items est une chaîne (JSON) ou déjà un objet
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        
        itemsContainer.innerHTML = items.map(item => {
            // S'assurer que le prix et la quantité sont des nombres valides
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            const total = (price * quantity).toFixed(2);
            
            return `
            <div class="p-4 flex justify-between items-center border-b border-gray-100">
                <div class="flex items-center">
                    <img src="${item.image || 'https://via.placeholder.com/64'}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
                    <div>
                        <h5 class="font-medium">${item.name || 'Produit sans nom'}</h5>
                        <p class="text-sm text-gray-500">Quantité: ${quantity}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-medium">${total} DH</p>
                    <p class="text-sm text-gray-500">${price.toFixed(2)} DH × ${quantity}</p>
                </div>
            </div>`;
        }).join('');
        
        // Afficher le modal
        document.getElementById('order-modal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        
    } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        alert('Erreur lors du chargement des détails de la commande');
    }
}

// Afficher la liste des commandes
function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                Aucune commande trouvée.
            </div>
        `;
        return;
    }

    const ordersHtml = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${orders.map(order => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">#${order.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${order.first_name || ''} ${order.last_name || ''}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date inconnue'}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${parseFloat(order.total).toFixed(2)} DH</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(order.status)}">
                                ${order.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button onclick="viewOrder(${order.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">
                                <i class="fas fa-eye"></i> Voir
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = ordersHtml;
}

// Afficher la liste des messages
function displayMessages(messages) {
    console.log('Affichage des messages:', messages);
    const container = document.getElementById('messages-list');
    
    if (!container) {
        console.error('Le conteneur des messages n\'a pas été trouvé dans le DOM');
        return;
    }
    
    if (!Array.isArray(messages)) {
        console.error('Les messages ne sont pas un tableau:', messages);
        container.innerHTML = `
            <div class="p-8 text-center text-red-600">
                Erreur: Format de données invalide
            </div>
        `;
        return;
    }
    
    if (messages.length === 0) {
        console.log('Aucun message à afficher');
        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                Aucun message trouvé.
            </div>
        `;
        return;
    }
    
    // Trier les messages par date décroissante (les plus récents en premier)
    messages.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const messagesHtml = `
        <div class="divide-y divide-gray-200">
            ${messages.map(message => {
                const messageDate = message.created_at || message.createdAt || new Date();
                const formattedDate = new Date(messageDate).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const isUnread = message.status === 'Non lu' || message.is_read === false;
                const messageContent = message.message || '';
                const truncatedContent = messageContent.length > 100 
                    ? messageContent.substring(0, 100) + '...' 
                    : messageContent;
                
                return `
                <div class="p-4 hover:bg-gray-50 cursor-pointer ${isUnread ? 'bg-blue-50' : ''}" 
                     onclick="viewMessage(${message.id})">
                    <div class="flex justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="mb-1">
                                <p class="text-sm font-medium ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-600'}">
                                    ${getMessageSenderName(message)}
                                    ${message.email ? `<span class="text-gray-500"> &lt;${message.email}&gt;</span>` : ''}
                                </p>
                                <p class="text-xs mt-1 ${isUnread ? 'font-semibold text-indigo-700' : 'text-indigo-600'}">
                                    <span class="bg-indigo-50 px-2 py-0.5 rounded-full">
                                        ${message.subject || 'Sans objet'}
                                    </span>
                                </p>
                            </div>
                            <p class="text-sm text-gray-500 truncate mt-1">
                                ${messageContent ? truncatedContent : 'Aucun contenu'}
                            </p>
                        </div>
                        <div class="ml-4 flex-shrink-0 flex flex-col items-end">
                            <p class="text-xs text-gray-500 whitespace-nowrap">
                                ${formattedDate}
                            </p>
                            ${isUnread ? `
                                <span class="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Nouveau
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;

    container.innerHTML = messagesHtml;
}

// Fonction utilitaire pour obtenir la classe CSS en fonction du statut
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'en attente':
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'en cours':
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'expédiée':
        case 'shipped':
            return 'bg-indigo-100 text-indigo-800';
        case 'livrée':
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'annulée':
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'terminée':
        case 'completed':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Filtrer et afficher les commandes en fonction des critères de recherche
function filterAndDisplayOrders() {
    try {
        const searchTerm = document.getElementById('order-search')?.value?.toLowerCase() || '';
        const filterValue = document.getElementById('order-filter')?.value || 'all';
        
        // Si nous n'avons pas encore chargé de commandes, on ne fait rien
        if (!Array.isArray(allOrders)) {
            console.error('Aucune commande chargée');
            return;
        }

        let filteredOrders = [...allOrders];

        // Filtrer par statut
        if (filterValue !== 'all') {
            filteredOrders = filteredOrders.filter(order => 
                order.status?.toLowerCase() === filterValue.toLowerCase()
            );
        }

        // Filtrer par terme de recherche
        if (searchTerm) {
            filteredOrders = filteredOrders.filter(order => 
                (order.first_name?.toLowerCase().includes(searchTerm) ||
                 order.last_name?.toLowerCase().includes(searchTerm) ||
                 order.id.toString().includes(searchTerm) ||
                 order.phone?.includes(searchTerm))
            );
        }

        // Afficher les résultats
        displayOrders(filteredOrders);
    } catch (error) {
        console.error('Erreur lors du filtrage des commandes:', error);
        const container = document.getElementById('orders-list');
        if (container) {
            container.innerHTML = `
                <div class="p-4 text-red-600">
                    Erreur lors du chargement des commandes. Veuillez réessayer.
                </div>
            `;
        }
    }
}

// Afficher les détails d'un message
async function viewMessage(messageId) {
    try {
        const url = `${API_URL}/api/messages/${messageId}`;
        console.log(`Chargement du message #${messageId} depuis:`, url);
        const response = await fetch(url);
        const message = await response.json();
        console.log('Détails du message chargé:', message);
        
        currentMessageId = message.id;
        
        // Mettre à jour le modal avec les détails du message
        document.getElementById('message-subject').textContent = message.subject || 'Sans objet';
        
        // Afficher le nom de l'expéditeur avec gestion des champs manquants
        const senderName = getMessageSenderName(message);
        const senderEmail = message.email ? `&lt;${message.email}&gt;` : '';
        document.getElementById('message-sender').innerHTML = `
            <span class="font-medium">${senderName}</span>
            ${senderEmail ? `<span class="text-gray-500 ml-1">${senderEmail}</span>` : ''}
        `;
        
        document.getElementById('message-phone').textContent = message.phone || 'Non renseigné';
        document.getElementById('message-subject-display').textContent = message.subject || 'Sans objet';
        document.getElementById('message-date').textContent = message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Date inconnue';
        document.getElementById('message-content').textContent = message.message || '';
        
        // Mettre à jour le bouton de marquage comme lu
        const markReadBtn = document.getElementById('mark-read-btn');
        if (message.status === 'Non lu') {
            markReadBtn.classList.remove('hidden');
        } else {
            markReadBtn.classList.add('hidden');
        }
        
        // Mettre à jour le lien de réponse par email
        document.getElementById('reply-email').href = `mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || '')}`;
        
        // Afficher le modal
        document.getElementById('message-modal').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        
    } catch (error) {
        console.error('Erreur lors du chargement du message:', error);
        alert('Erreur lors du chargement du message');
    }
}

async function markAsRead() {
    if (!currentMessageId) return;
    
    try {
        const response = await fetch(`${API_URL}/api/messages/${currentMessageId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Lu' })
        });
        
        if (response.ok) {
            // Recharger les messages et le tableau de bord
            loadMessages();
            updateDashboard();
            
            // Mettre à jour l'interface
            document.getElementById('mark-read-btn').classList.add('hidden');
        } else {
            throw new Error('Échec du marquage comme lu');
        }
    } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        alert('Erreur lors du marquage du message comme lu');
    }
}

// Supprimer un message
async function deleteMessage(messageId) {
    console.log('Fonction deleteMessage appelée avec messageId:', messageId);
    
    if (!messageId) {
        console.error('Erreur: Aucun ID de message fourni');
        alert('Erreur: Impossible de supprimer le message - ID manquant');
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.')) {
        console.log('Suppression annulée par l\'utilisateur');
        return;
    }

    try {
        console.log('Tentative de suppression du message ID:', messageId);
        const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cache': 'no-cache'
            },
            credentials: 'include',
            mode: 'cors'
        });

        console.log('Réponse reçue:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur lors de la suppression:', response.status, errorText);
            throw new Error(errorText || 'Erreur lors de la suppression du message');
        }

        const result = await response.json().catch(e => {
            console.error('Erreur lors du parsing de la réponse JSON:', e);
            return { success: true }; // On considère que la suppression a réussi même sans réponse JSON valide
        });
        
        console.log('Résultat de la suppression:', result);

        // Fermer le modal
        closeMessageModal();
        
        // Recharger la liste des messages
        loadMessages();
        
        // Mettre à jour le tableau de bord
        updateDashboard();
        
        alert('Message supprimé avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression du message:', error);
        alert('Erreur lors de la suppression du message: ' + (error.message || 'Erreur inconnue'));
    }
}

// Mettre à jour le statut choisi dans le modal
if (typeof window.updateSelectedOrderStatus === 'undefined') {
  function updateSelectedOrderStatus() {
    const select = document.getElementById('order-status');
    if (!select) return;
    const frStatus = select.value;
    const statusMap = {
      'Nouvelle': 'pending',
      'En cours': 'processing',
      'Terminée': 'completed',
      'Annulée': 'cancelled'
    };
    const newStatus = statusMap[frStatus];
    if (!newStatus) {
      alert('Statut non reconnu');
      return;
    }
    if (!window.currentOrderId) {
      alert('ID de la commande introuvable');
      return;
    }
    updateOrderStatus(window.currentOrderId, newStatus);
  }
  window.updateSelectedOrderStatus = updateSelectedOrderStatus;
}

// Fonctions utilitaires
if (typeof window.getStatusClass === 'undefined') {
  window.getStatusClass = function(status) {
    switch(status) {
      case 'Nouvelle':
        return 'bg-blue-100 text-blue-800';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminée':
        return 'bg-green-100 text-green-800';
      case 'Annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
}

function closeModal() {
    document.getElementById('order-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function closeMessageModal() {
    document.getElementById('message-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// Supprimer une commande
async function deleteOrder() {
    if (!currentOrderId || !confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/orders/${currentOrderId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de la commande');
        }

        // Fermer le modal et recharger la liste des commandes
        closeModal();
        loadOrders();
        
        // Afficher un message de succès
        alert('Commande supprimée avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
        alert('Une erreur est survenue lors de la suppression de la commande');
    }
}

// Fonction utilitaire pour obtenir le nom de l'expéditeur d'un message
function getMessageSenderName(message) {
    if (!message) return 'Sans nom';
    console.log('Détails du message dans getMessageSenderName:', message);
    
    // Essayer différents champs possibles pour le nom (avec priorité)
    if (message.full_name) return message.full_name; // Champ utilisé par l'API
    if (message.name) return message.name;
    if (message.fullName) return message.fullName;
    if (message.first_name || message.last_name) {
        return `${message.first_name || ''} ${message.last_name || ''}`.trim();
    }
    
    // Vérifier s'il y a un email mais pas de nom
    if (message.email) {
        const emailPart = message.email.split('@')[0];
        // Essayer d'extraire un nom à partir de l'email (ex: john.doe@example.com -> John Doe)
        return emailPart
            .split(/[._+]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }
    
    return 'Sans nom';
}

// Exposer les fonctions au scope global
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.viewMessage = viewMessage;
window.deleteOrder = deleteOrder;
window.markAsRead = markAsRead;
window.deleteMessage = deleteMessage;
window.closeModal = closeModal;
window.closeMessageModal = closeMessageModal;
window.displayOrders = displayOrders;
}

