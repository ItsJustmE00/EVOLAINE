"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Créer le dossier de données s'il n'existe pas
if (!fs_1.default.existsSync(config_1.config.dataDir)) {
    fs_1.default.mkdirSync(config_1.config.dataDir, { recursive: true });
}
const ORDERS_FILE = path_1.default.join(config_1.config.dataDir, config_1.config.ordersFile);
// Initialiser le fichier des commandes s'il n'existe pas
if (!fs_1.default.existsSync(ORDERS_FILE)) {
    fs_1.default.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}
// Lire les commandes depuis le fichier
const readOrders = () => {
    try {
        const data = fs_1.default.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Erreur lors de la lecture des commandes:', error);
        return [];
    }
};
// Écrire les commandes dans le fichier
const writeOrders = (orders) => {
    try {
        fs_1.default.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    }
    catch (error) {
        console.error('Erreur lors de l\'écriture des commandes:', error);
    }
};
// Routes API
app.get('/api/orders', (req, res) => {
    const orders = readOrders();
    res.json(orders);
});
app.post('/api/orders', (req, res) => {
    try {
        const order = {
            id: (0, uuid_1.v4)(),
            status: 'pending',
            created_at: new Date().toISOString(),
            ...req.body
        };
        const orders = readOrders();
        orders.push(order);
        writeOrders(orders);
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
});
app.patch('/api/orders/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const orders = readOrders();
        const orderIndex = orders.findIndex((o) => o.id === id);
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        orders[orderIndex] = {
            ...orders[orderIndex],
            status,
            updated_at: new Date().toISOString()
        };
        writeOrders(orders);
        res.json(orders[orderIndex]);
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
    }
});
// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('Erreur non capturée :', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet de promesse non géré :', reason);
});
// Démarrer le serveur
const server = app.listen(config_1.config.port, () => {
    console.log(`Serveur API démarré sur http://localhost:${config_1.config.port}`);
});
// Gestion de l'arrêt propre du serveur
const shutdown = () => {
    console.log('Arrêt du serveur...');
    server.close(() => {
        console.log('Serveur arrêté.');
        process.exit(0);
    });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
