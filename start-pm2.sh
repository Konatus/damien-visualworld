#!/bin/bash

# Script de démarrage VisualWorld avec PM2

set -e

echo "🚀 Démarrage de VisualWorld avec PM2..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 n'est pas installé${NC}"
    echo "Installation de PM2..."
    npm install -g pm2
fi

# Vérifier la version de Node
NODE_VERSION=$(node --version)
echo -e "${YELLOW}📦 Version de Node.js: $NODE_VERSION${NC}"

if [[ "$NODE_VERSION" != "v18.20.8" ]]; then
    echo -e "${YELLOW}⚠️  La version recommandée est v18.20.8${NC}"
fi

# Se déplacer dans le répertoire du projet
cd "$(dirname "$0")"

echo -e "${YELLOW}📂 Répertoire: $(pwd)${NC}"

# Arrêter les anciennes instances si elles existent
echo "🛑 Arrêt des anciennes instances..."
pm2 delete visualworld-api 2>/dev/null || true
pm2 delete visualworld-front 2>/dev/null || true

# Installer les dépendances
echo "📦 Installation des dépendances..."

echo "  → API..."
cd api
npm install

echo "  → Frontend..."
cd ../front
npm install --legacy-peer-deps

cd ..

# Démarrer avec PM2
echo "🚀 Démarrage des services avec PM2..."
pm2 start ecosystem.config.json

# Sauvegarder la configuration
pm2 save

# Afficher le statut
echo ""
echo -e "${GREEN}✅ VisualWorld démarré avec succès!${NC}"
echo ""
pm2 status

echo ""
echo -e "${GREEN}📊 Pour voir les logs:${NC}"
echo "  pm2 logs"
echo "  pm2 logs visualworld-api"
echo "  pm2 logs visualworld-front"
echo ""
echo -e "${GREEN}🌐 URLs:${NC}"
echo "  Frontend: http://damien.konatus.site/"
echo "  API: http://87.106.255.115:8080/"
echo ""
echo -e "${YELLOW}💡 Commandes utiles:${NC}"
echo "  pm2 status              - Voir le statut"
echo "  pm2 restart all         - Redémarrer tout"
echo "  pm2 stop all            - Arrêter tout"
echo "  pm2 delete all          - Supprimer tout"
echo "  pm2 monit               - Monitoring en temps réel"
