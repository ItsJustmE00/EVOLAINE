// Variables globales
let currentOrderId = null;
let currentMessageId = null;

// Configuration de l'URL de l'API
const API_BASE_URL = window.location.protocol + '//' + window.location.hostname + ':3003';
const API_URL = `${API_BASE_URL}/api`;
console.log('URL de l\'API configurée sur:', API_URL);

// Log de débogage
console.log('admin.js chargé avec succès');

// Initialisation de l'interface
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation de l\'interface');
    // Navigation
    document.getElementById('dashboard-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('dashboard');
        updateDashboard();
    });

    document.getElementById('orders-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('orders');
        loadOrders();
    });

    document.getElementById('messages-tab').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('messages');
        loadMessages();
    });

    // Filtres
    document.getElementById('order-filter').addEventListener('change', loadOrders);
    document.getElementById('message-filter').addEventListener('change', loadMessages);

    // Chargement initial
    showSection('dashboard');
    updateDashboard();
});

// Fonctions d'affichage
function showSection(sectionId) {
    console.log(`Affichage de la section: ${sectionId}`);
    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Afficher la section demandée
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden');
        console.log(`Section ${sectionId} affichée avec succès`);
    } else {
        console.error(`Section non trouvée: ${sectionId}`);
    }
    
    // Mettre à jour l'onglet actif
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('bg-indigo-800');
        link.classList.add('hover:bg-indigo-600');
    });
    
    // Mettre à jour l'onglet actif en utilisant l'ID du format 'dashboard-tab', 'orders-tab', etc.
    const activeTab = document.getElementById(`${sectionId}-tab`);
    if (activeTab) {
        activeTab.classList.add('bg-indigo-800');
        activeTab.classList.remove('hover:bg-indigo-600');
        console.log(`Onglet actif mis à jour pour: ${sectionId}`);
    } else {
        console.error(`Onglet non trouvé pour la section: ${sectionId}`);
    }
}

// Fonctions pour le tableau de bord
async function updateDashboard() {
    try {
        // Récupérer les statistiques
        const [orders, messages] = await Promise.all([
            fetch('http://localhost:3003/api/orders').then(res => res.json()),
            fetch('http://localhost:3003/api/messages').then(res => res.json())
        ]);

        // Mettre à jour les compteurs
        const newOrders = orders.filter(order => order.status === 'pending' || order.status === 'Nouvelle').length;
        const unreadMessages = messages.filter(msg => msg.status === 'unread' || msg.status === 'Non lu').length;
        const revenue = orders
            .filter(order => order.status === 'completed' || order.status === 'Terminée')
            .reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

        document.getElementById('new-orders-count').textContent = newOrders;
        document.getElementById('unread-messages-count').textContent = unreadMessages;
        document.getElementById('revenue').textContent = revenue.toFixed(2);

        // Afficher les commandes récentes
        displayRecentOrders(orders.slice(0, 5));
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
                            <td class="px-6 py-4 whitespace-nowrap">${order.firstName} ${order.lastName}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${new Date(order.createdAt).toLocaleDateString()}</td>
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

// Fonctions pour la gestion des commandes
let allOrders = [];
let currentFilter = 'all';
let currentSearchTerm = '';

// Fonction pour filtrer et afficher les commandes
function filterAndDisplayOrders() {
    const filteredOrders = allOrders.filter(order => {
        // Filtre par statut
        const statusMatch = currentFilter === 'all' || order.status === currentFilter;
        
        // Filtre par recherche
        const searchTerm = currentSearchTerm.toLowerCase();
        const searchMatch = !searchTerm || 
            (order.id && order.id.toString().includes(searchTerm)) ||
            (order.firstName && order.firstName.toLowerCase().includes(searchTerm)) ||
            (order.lastName && order.lastName.toLowerCase().includes(searchTerm)) ||
            (order.phone && order.phone.includes(searchTerm)) ||
            (order.address && order.address.toLowerCase().includes(searchTerm)) ||
            (order.city && order.city.toLowerCase().includes(searchTerm));
        
        return statusMatch && searchMatch;
    });
    
    // Mise à jour du statut de recherche
    const searchStatus = document.getElementById('search-status');
    if (currentSearchTerm) {
        searchStatus.textContent = `${filteredOrders.length} commande(s) trouvée(s) pour "${currentSearchTerm}"`;
    } else {
        searchStatus.textContent = '';
    }
    
    displayOrders(filteredOrders);
}

// Charger les commandes
async function loadOrders() {
    const filter = document.getElementById('order-filter').value;
    currentFilter = filter;
    
    try {
        const response = await fetch('http://localhost:3003/api/orders');
        allOrders = await response.json();
        
        // Trier les commandes par date (les plus récentes d'abord)
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        filterAndDisplayOrders();
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        document.getElementById('orders-list').innerHTML = `
            <div class="p-4 text-red-600">
                Erreur lors du chargement des commandes. Veuillez réessayer.
            </div>
        `;
    }
}

// Gestionnaire d'événement pour la recherche
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('order-search');
    const filterSelect = document.getElementById('order-filter');
    
    // Recherche avec délai pour éviter trop de requêtes
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        currentSearchTerm = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
            filterAndDisplayOrders();
        }, 300);
    });
    
    // Filtrer lors du changement de statut
    filterSelect.addEventListener('change', () => {
        currentFilter = filterSelect.value;
        filterAndDisplayOrders();
    });
});

function displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        const noResults = currentSearchTerm 
            ? `Aucune commande ne correspond à votre recherche "${currentSearchTerm}"`
            : 'Aucune commande trouvée.';
            
        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                ${noResults}
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
                        <td class="px-6 py-4 whitespace-nowrap">${order.firstName} ${order.lastName}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${new Date(order.createdAt).toLocaleDateString()}</td>
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

async function viewOrder(orderId) {
    try {
        const response = await fetch(`http://localhost:3003/api/orders/${orderId}`);
        const order = await response.json();
        
        currentOrderId = order.id;
        
        // Mettre à jour le modal avec les détails de la commande
        document.getElementById('order-id').textContent = `#${order.id}`;
        document.getElementById('customer-name').textContent = `${order.firstName} ${order.lastName}`;
        document.getElementById('customer-phone').textContent = order.phone;
        document.getElementById('customer-address').textContent = `${order.address}, ${order.city}`;
        document.getElementById('order-city').textContent = order.city;
        document.getElementById('order-notes').textContent = order.notes || 'Aucune note';
        document.getElementById('order-status').value = order.status;
        document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleString();
        document.getElementById('order-total').textContent = parseFloat(order.total).toFixed(2);
        
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

async function updateOrderStatus() {
    if (!currentOrderId) return;
    
    const status = document.getElementById('order-status').value;
    
    try {
        const response = await fetch(`http://localhost:3003/api/orders/${currentOrderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            // Recharger les commandes et le tableau de bord
            loadOrders();
            updateDashboard();
            closeModal();
        } else {
            throw new Error('Échec de la mise à jour du statut');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        alert('Erreur lors de la mise à jour du statut de la commande');
    }
}

// Fonctions pour la gestion des messages
async function loadMessages() {
    const filter = document.getElementById('message-filter').value;
    let url = 'http://localhost:3003/api/messages';
    
    if (filter !== 'all') {
        url += `?status=${encodeURIComponent(filter)}`;
    }

    try {
        const response = await fetch(url);
        const messages = await response.json();
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

function displayMessages(messages) {
    const container = document.getElementById('messages-list');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                Aucun message trouvé.
            </div>
        `;
        return;
    }

    const messagesHtml = `
        <div class="divide-y divide-gray-200">
            ${messages.map(message => `
                <div class="p-4 hover:bg-gray-50 cursor-pointer ${message.status === 'Non lu' ? 'bg-blue-50' : ''}" 
                     onclick="viewMessage(${message.id})">
                    <div class="flex justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="mb-1">
                                <p class="text-sm font-medium ${message.status === 'Non lu' ? 'text-gray-900' : 'text-gray-600'}">
                                    ${message.fullName || message.name || 'Sans nom'} <span class="text-gray-500">${message.email ? `&lt;${message.email}&gt;` : ''}</span>
                                </p>
                                <p class="text-xs mt-0.5 ${message.status === 'Non lu' ? 'font-semibold text-indigo-700' : 'text-indigo-600'}">
                                    <span class="bg-indigo-50 px-2 py-0.5 rounded-full">
                                        ${message.subject || 'Sans objet'}
                                    </span>
                                </p>
                            </div>
                            <p class="text-sm text-gray-500 truncate">
                                ${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}
                            </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                            <p class="text-xs text-gray-500">
                                ${new Date(message.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = messagesHtml;
}

async function viewMessage(messageId) {
    try {
        const response = await fetch(`http://localhost:3003/api/messages/${messageId}`);
        const message = await response.json();
        
        currentMessageId = message.id;
        
        // Mettre à jour le modal avec les détails du message
        document.getElementById('message-subject').textContent = message.subject || 'Sans objet';
        document.getElementById('message-sender').textContent = `${message.fullName || message.name || 'Sans nom'}${message.email ? ` <${message.email}>` : ''}`;
        document.getElementById('message-phone').textContent = message.phone || 'Non renseigné';
        document.getElementById('message-subject-display').textContent = message.subject || 'Sans objet';
        document.getElementById('message-date').textContent = new Date(message.createdAt).toLocaleString();
        document.getElementById('message-content').textContent = message.message;
        
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
        const response = await fetch(`http://localhost:3003/api/messages/${currentMessageId}/status`, {
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
        const response = await fetch(`http://localhost:3003/api/messages/${messageId}`, {
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

// Fonctions utilitaires
function getStatusClass(status) {
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
        const response = await fetch(`http://localhost:3003/api/orders/${currentOrderId}`, {
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

// Exposer les fonctions au scope global
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.viewMessage = viewMessage;
window.deleteOrder = deleteOrder;
window.markAsRead = markAsRead;
window.deleteMessage = deleteMessage;
window.closeModal = closeModal;
window.closeMessageModal = closeMessageModal;
