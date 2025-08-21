#!/bin/bash

# Script de déploiement automatisé pour EVOLAINE
# Usage: ./scripts/deploy.sh [frontend|backend|all]

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="project"
BACKEND_DIR="server"
DEPLOYMENT_TARGET=${1:-all}

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Fonction pour vérifier les prérequis
check_requirements() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Fonction pour vérifier les changements Git
check_git_status() {
    log_info "Vérification du statut Git..."
    
    if [[ -n $(git status -s) ]]; then
        log_warning "Des changements non commités ont été détectés"
        read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Déploiement annulé"
            exit 0
        fi
    fi
    
    # Récupérer la branche actuelle
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Branche actuelle: $CURRENT_BRANCH"
}

# Fonction pour déployer le frontend
deploy_frontend() {
    log_info "Déploiement du frontend..."
    
    cd $FRONTEND_DIR
    
    # Installer les dépendances
    log_info "Installation des dépendances..."
    npm ci
    
    # Build de production
    log_info "Build de production..."
    npm run build
    
    # Vérifier que le build a réussi
    if [ ! -d "dist" ]; then
        log_error "Le build a échoué - dossier dist introuvable"
        exit 1
    fi
    
    # Déployer sur Vercel
    if command -v vercel &> /dev/null; then
        log_info "Déploiement sur Vercel..."
        vercel --prod --yes
        log_success "Frontend déployé sur Vercel"
    else
        log_warning "Vercel CLI non installé - Déploiement manuel requis"
        log_info "Installez Vercel CLI avec: npm i -g vercel"
    fi
    
    cd ..
}

# Fonction pour déployer le backend
deploy_backend() {
    log_info "Déploiement du backend..."
    
    cd $BACKEND_DIR
    
    # Vérifier le fichier .env
    if [ ! -f ".env" ]; then
        log_warning "Fichier .env non trouvé"
        if [ -f ".env.production.example" ]; then
            log_info "Copie de .env.production.example vers .env"
            cp .env.production.example .env
            log_warning "Veuillez configurer les variables d'environnement dans server/.env"
            exit 1
        fi
    fi
    
    # Installer les dépendances
    log_info "Installation des dépendances..."
    npm ci
    
    # Push vers le repository Git (pour Render)
    log_info "Push vers le repository Git..."
    git add .
    git commit -m "Deploy backend - $(date '+%Y-%m-%d %H:%M:%S')" || true
    git push origin $CURRENT_BRANCH
    
    log_success "Backend poussé vers Git - Render déploiera automatiquement"
    log_info "Vérifiez le statut sur: https://dashboard.render.com"
    
    cd ..
}

# Fonction pour exécuter les tests
run_tests() {
    log_info "Exécution des tests..."
    
    # Tests frontend
    if [ "$DEPLOYMENT_TARGET" = "frontend" ] || [ "$DEPLOYMENT_TARGET" = "all" ]; then
        cd $FRONTEND_DIR
        log_info "Tests frontend..."
        npm run lint || log_warning "Lint frontend a détecté des problèmes"
        # npm test || log_warning "Tests frontend ont échoué"
        cd ..
    fi
    
    # Tests backend
    if [ "$DEPLOYMENT_TARGET" = "backend" ] || [ "$DEPLOYMENT_TARGET" = "all" ]; then
        cd $BACKEND_DIR
        log_info "Tests backend..."
        # npm test || log_warning "Tests backend ont échoué"
        cd ..
    fi
}

# Fonction pour vérifier la santé après déploiement
post_deployment_check() {
    log_info "Vérification post-déploiement..."
    
    # Attendre que les services soient prêts
    log_info "Attente de 30 secondes pour que les services démarrent..."
    sleep 30
    
    # Exécuter le health check
    if [ -f "scripts/health-check.js" ]; then
        log_info "Exécution du health check..."
        node scripts/health-check.js
    else
        log_warning "Script de health check non trouvé"
    fi
}

# Fonction principale
main() {
    echo "════════════════════════════════════════"
    echo "    EVOLAINE - Script de Déploiement    "
    echo "════════════════════════════════════════"
    echo ""
    
    log_info "Cible de déploiement: $DEPLOYMENT_TARGET"
    
    # Vérifications préliminaires
    check_requirements
    check_git_status
    
    # Exécuter les tests
    run_tests
    
    # Déploiement selon la cible
    case $DEPLOYMENT_TARGET in
        frontend)
            deploy_frontend
            ;;
        backend)
            deploy_backend
            ;;
        all)
            deploy_frontend
            deploy_backend
            ;;
        *)
            log_error "Cible invalide: $DEPLOYMENT_TARGET"
            echo "Usage: $0 [frontend|backend|all]"
            exit 1
            ;;
    esac
    
    # Vérification post-déploiement
    post_deployment_check
    
    log_success "Déploiement terminé avec succès !"
    echo ""
    echo "URLs de production:"
    echo "  Frontend: https://evolaine.vercel.app"
    echo "  Backend: https://evolaine-backend.onrender.com"
    echo ""
}

# Exécuter le script principal
main
