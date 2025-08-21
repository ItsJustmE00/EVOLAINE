/**
 * Configuration de l'application d'administration
 */

const API_BASE_URL = '/api';
const WS_URL = window.location.hostname === 'localhost' 
  ? 'ws://localhost:3005' 
  : `wss://${window.location.hostname}`;

const CONFIG = {
  API: {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
      AUTH: {
        LOGIN: `${API_BASE_URL}/admin/login`,
        LOGOUT: `${API_BASE_URL}/admin/logout`,
        VERIFY_TOKEN: `${API_BASE_URL}/admin/verify-token`,
      },
      ORDERS: {
        BASE: `${API_BASE_URL}/orders`,
        STATUS: `${API_BASE_URL}/orders/:id/status`,
      },
      PRODUCTS: {
        BASE: `${API_BASE_URL}/products`,
      },
      MESSAGES: {
        BASE: `${API_BASE_URL}/messages`,
      },
      STATS: {
        BASE: `${API_BASE_URL}/stats`,
      },
    },
  },
  WS: {
    URL: WS_URL,
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 3000,
  },
  AUTH: {
    TOKEN_KEY: 'adminToken',
    TOKEN_EXPIRY: 8 * 60 * 60 * 1000, // 8 heures en millisecondes
  },
  UI: {
    DEFAULT_PAGE_SIZE: 10,
    DATE_FORMAT: 'DD/MM/YYYY HH:mm',
    NOTIFICATION_DURATION: 5000, // 5 secondes
  },
};

// Exporter la configuration
window.CONFIG = CONFIG;
