#!/usr/bin/env node

/**
 * Script de vérification de santé pour EVOLAINE
 * Vérifie que tous les services sont opérationnels
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  frontend: {
    url: process.env.FRONTEND_URL || 'https://evolaine.vercel.app',
    timeout: 10000
  },
  backend: {
    url: process.env.BACKEND_URL || 'https://evolaine-backend.onrender.com',
    healthEndpoint: '/api/health',
    timeout: 10000
  }
};

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Fonction pour vérifier une URL
function checkUrl(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    console.log(`${colors.blue}Vérification de ${name}...${colors.reset}`);
    
    const req = protocol.get(url, { timeout: config.frontend.timeout }, (res) => {
      const responseTime = Date.now() - startTime;
      
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`${colors.green}✓ ${name} est opérationnel${colors.reset}`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Temps de réponse: ${responseTime}ms`);
        resolve({ 
          success: true, 
          service: name, 
          statusCode: res.statusCode, 
          responseTime 
        });
      } else {
        console.log(`${colors.yellow}⚠ ${name} a répondu avec le code ${res.statusCode}${colors.reset}`);
        resolve({ 
          success: false, 
          service: name, 
          statusCode: res.statusCode, 
          responseTime 
        });
      }
    });
    
    req.on('error', (err) => {
      console.log(`${colors.red}✗ ${name} est inaccessible${colors.reset}`);
      console.log(`  Erreur: ${err.message}`);
      resolve({ 
        success: false, 
        service: name, 
        error: err.message 
      });
    });
    
    req.on('timeout', () => {
      console.log(`${colors.red}✗ ${name} - Timeout après ${config.frontend.timeout}ms${colors.reset}`);
      req.destroy();
      resolve({ 
        success: false, 
        service: name, 
        error: 'Timeout' 
      });
    });
  });
}

// Fonction pour vérifier la base de données via l'API
async function checkDatabase() {
  const url = `${config.backend.url}/api/products`;
  
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    console.log(`${colors.blue}Vérification de la base de données...${colors.reset}`);
    
    const req = protocol.get(url, { timeout: config.backend.timeout }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const products = JSON.parse(data);
          if (Array.isArray(products) || (products && typeof products === 'object')) {
            console.log(`${colors.green}✓ Base de données accessible${colors.reset}`);
            console.log(`  Temps de réponse: ${responseTime}ms`);
            resolve({ 
              success: true, 
              service: 'Database', 
              responseTime 
            });
          } else {
            throw new Error('Format de réponse invalide');
          }
        } catch (err) {
          console.log(`${colors.yellow}⚠ Base de données - Réponse invalide${colors.reset}`);
          resolve({ 
            success: false, 
            service: 'Database', 
            error: err.message 
          });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`${colors.red}✗ Base de données inaccessible${colors.reset}`);
      console.log(`  Erreur: ${err.message}`);
      resolve({ 
        success: false, 
        service: 'Database', 
        error: err.message 
      });
    });
  });
}

// Fonction principale
async function runHealthCheck() {
  console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}    EVOLAINE - Vérification de Santé    ${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════${colors.reset}\n`);
  
  const results = [];
  
  // Vérifier le frontend
  results.push(await checkUrl(config.frontend.url, 'Frontend'));
  console.log();
  
  // Vérifier le backend
  results.push(await checkUrl(
    `${config.backend.url}${config.backend.healthEndpoint}`, 
    'Backend API'
  ));
  console.log();
  
  // Vérifier la base de données
  results.push(await checkDatabase());
  
  // Résumé
  console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}             RÉSUMÉ                     ${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════${colors.reset}\n`);
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const icon = result.success ? '✓' : '✗';
    const color = result.success ? colors.green : colors.red;
    console.log(`${color}${icon} ${result.service}${colors.reset}`);
  });
  
  console.log(`\n${colors.blue}Score: ${successCount}/${totalCount} services opérationnels${colors.reset}`);
  
  // Calculer le temps de réponse moyen
  const responseTimes = results
    .filter(r => r.responseTime)
    .map(r => r.responseTime);
  
  if (responseTimes.length > 0) {
    const avgResponseTime = Math.round(
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    );
    console.log(`${colors.blue}Temps de réponse moyen: ${avgResponseTime}ms${colors.reset}`);
  }
  
  // Code de sortie
  const exitCode = successCount === totalCount ? 0 : 1;
  
  if (exitCode === 0) {
    console.log(`\n${colors.green}✓ Tous les systèmes sont opérationnels !${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}✗ Certains services nécessitent une attention${colors.reset}\n`);
  }
  
  process.exit(exitCode);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error(`${colors.red}Erreur non gérée: ${err.message}${colors.reset}`);
  process.exit(1);
});

// Lancer la vérification
runHealthCheck();
