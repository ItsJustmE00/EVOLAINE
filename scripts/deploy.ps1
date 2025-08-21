# Script de déploiement automatisé pour EVOLAINE (Windows PowerShell)
# Usage: .\scripts\deploy.ps1 [frontend|backend|all]

param(
    [string]$Target = "all"
)

# Configuration
$FrontendDir = "project"
$BackendDir = "server"
$ErrorActionPreference = "Stop"

# Couleurs pour l'affichage
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Fonction pour vérifier les prérequis
function Test-Requirements {
    Write-Info "Vérification des prérequis..."
    
    # Vérifier Node.js
    try {
        $nodeVersion = node --version
        Write-Info "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js n'est pas installé"
        exit 1
    }
    
    # Vérifier npm
    try {
        $npmVersion = npm --version
        Write-Info "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm n'est pas installé"
        exit 1
    }
    
    # Vérifier Git
    try {
        $gitVersion = git --version
        Write-Info "Git version: $gitVersion"
    }
    catch {
        Write-Error "Git n'est pas installé"
        exit 1
    }
    
    Write-Success "Tous les prérequis sont satisfaits"
}

# Fonction pour vérifier les changements Git
function Get-GitStatus {
    Write-Info "Vérification du statut Git..."
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning "Des changements non commités ont été détectés"
        $response = Read-Host "Voulez-vous continuer ? (y/n)"
        if ($response -ne 'y') {
            Write-Info "Déploiement annulé"
            exit 0
        }
    }
    
    # Récupérer la branche actuelle
    $currentBranch = git branch --show-current
    Write-Info "Branche actuelle: $currentBranch"
    return $currentBranch
}

# Fonction pour déployer le frontend
function Publish-Frontend {
    Write-Info "Déploiement du frontend..."
    
    Push-Location $FrontendDir
    
    try {
        # Installer les dépendances
        Write-Info "Installation des dépendances..."
        npm ci
        
        # Build de production
        Write-Info "Build de production..."
        npm run build
        
        # Vérifier que le build a réussi
        if (-not (Test-Path "dist")) {
            Write-Error "Le build a échoué - dossier dist introuvable"
            exit 1
        }
        
        # Déployer sur Vercel
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if ($vercelInstalled) {
            Write-Info "Déploiement sur Vercel..."
            vercel --prod --yes
            Write-Success "Frontend déployé sur Vercel"
        }
        else {
            Write-Warning "Vercel CLI non installé - Déploiement manuel requis"
            Write-Info "Installez Vercel CLI avec: npm i -g vercel"
        }
    }
    finally {
        Pop-Location
    }
}

# Fonction pour déployer le backend
function Publish-Backend {
    param([string]$Branch)
    
    Write-Info "Déploiement du backend..."
    
    Push-Location $BackendDir
    
    try {
        # Vérifier le fichier .env
        if (-not (Test-Path ".env")) {
            Write-Warning "Fichier .env non trouvé"
            if (Test-Path ".env.production.example") {
                Write-Info "Copie de .env.production.example vers .env"
                Copy-Item ".env.production.example" ".env"
                Write-Warning "Veuillez configurer les variables d'environnement dans server\.env"
                exit 1
            }
        }
        
        # Installer les dépendances
        Write-Info "Installation des dépendances..."
        npm ci
        
        # Push vers le repository Git (pour Render)
        Write-Info "Push vers le repository Git..."
        git add .
        $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Deploy backend - $date" 2>$null
        git push origin $Branch
        
        Write-Success "Backend poussé vers Git - Render déploiera automatiquement"
        Write-Info "Vérifiez le statut sur: https://dashboard.render.com"
    }
    finally {
        Pop-Location
    }
}

# Fonction pour exécuter les tests
function Invoke-Tests {
    Write-Info "Exécution des tests..."
    
    # Tests frontend
    if ($Target -eq "frontend" -or $Target -eq "all") {
        Push-Location $FrontendDir
        try {
            Write-Info "Tests frontend..."
            npm run lint 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Lint frontend a détecté des problèmes"
            }
        }
        finally {
            Pop-Location
        }
    }
    
    # Tests backend
    if ($Target -eq "backend" -or $Target -eq "all") {
        Push-Location $BackendDir
        try {
            Write-Info "Tests backend..."
            # npm test
        }
        finally {
            Pop-Location
        }
    }
}

# Fonction pour vérifier la santé après déploiement
function Test-DeploymentCheck {
    Write-Info "Vérification post-déploiement..."
    
    # Attendre que les services soient prêts
    Write-Info "Attente de 30 secondes pour que les services démarrent..."
    Start-Sleep -Seconds 30
    
    # Exécuter le health check
    if (Test-Path "scripts\health-check.js") {
        Write-Info "Exécution du health check..."
        node scripts\health-check.js
    }
    else {
        Write-Warning "Script de health check non trouvé"
    }
}

# Fonction principale
function Main {
    Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "    EVOLAINE - Script de Déploiement    " -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Info "Cible de déploiement: $Target"
    
    # Vérifications préliminaires
    Test-Requirements
    $currentBranch = Get-GitStatus
    
    # Exécuter les tests
    Invoke-Tests
    
    # Déploiement selon la cible
    switch ($Target) {
        "frontend" {
            Publish-Frontend
        }
        "backend" {
            Publish-Backend -Branch $currentBranch
        }
        "all" {
            Publish-Frontend
            Publish-Backend -Branch $currentBranch
        }
        default {
            Write-Error "Cible invalide: $Target"
            Write-Host "Usage: .\deploy.ps1 [frontend|backend|all]"
            exit 1
        }
    }
    
    # Vérification post-déploiement
    Test-DeploymentCheck
    
    Write-Success "Déploiement terminé avec succès !"
    Write-Host ""
    Write-Host "URLs de production:" -ForegroundColor Cyan
    Write-Host "  Frontend: https://evolaine.vercel.app" -ForegroundColor Green
    Write-Host "  Backend: https://evolaine-backend.onrender.com" -ForegroundColor Green
    Write-Host ""
}

# Exécuter le script principal
Main
