#!/bin/bash

# Script de restauration MongoDB depuis backup tar.gz
# Date: 23 Mars 2026

set -e

echo "🔄 Restauration MongoDB depuis backup..."

# Variables
BACKUP_FILE="/root/visualworld-main-main/mongodb-volume-backup-20260323-1612.tar.gz"
EXTRACT_DIR="/tmp/mongodb-restore"
CONTAINER_NAME="visualworld_mongodb-primary_1"
MONGO_PASSWORD="password123"

echo "📦 Étape 1: Extraction du backup..."
mkdir -p $EXTRACT_DIR
cd $EXTRACT_DIR
tar -xzf $BACKUP_FILE
echo "✅ Extraction terminée"

echo "🛑 Étape 2: Arrêt des conteneurs MongoDB..."
cd /root/visualworld-main
docker-compose stop

echo "⏳ Attente de l'arrêt complet..."
sleep 5

echo "📋 Étape 3: Backup de sécurité des données actuelles..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
docker run --rm -v visualworld_mongodb_master_data:/data -v /root/mongodb-backups:/backup alpine tar czf /backup/mongodb_current_backup_$BACKUP_DATE.tar.gz -C /data .
echo "✅ Backup de sécurité créé: /root/mongodb-backups/mongodb_current_backup_$BACKUP_DATE.tar.gz"

echo "🗑️  Étape 4: Nettoyage du volume existant..."
docker run --rm -v visualworld_mongodb_master_data:/data alpine sh -c "rm -rf /data/*"

echo "📥 Étape 5: Copie des nouvelles données..."
docker run --rm -v visualworld_mongodb_master_data:/data -v $EXTRACT_DIR:/backup alpine sh -c "cp -r /backup/mongodb/data/* /data/"

echo "🔧 Étape 6: Correction des permissions..."
docker run --rm -v visualworld_mongodb_master_data:/data alpine sh -c "chown -R 1001:1001 /data"

echo "🚀 Étape 7: Redémarrage des conteneurs MongoDB..."
cd /root/visualworld-main
docker-compose up -d

echo "⏳ Attente du démarrage complet..."
sleep 15

echo "🏥 Étape 8: Vérification de la connexion..."
docker exec $CONTAINER_NAME mongosh -u root -p $MONGO_PASSWORD --eval "db.adminCommand('ping')" || echo "⚠️ Vérification manuelle nécessaire"

echo "🧹 Nettoyage..."
rm -rf $EXTRACT_DIR

echo ""
echo "✅ Restauration terminée avec succès!"
echo ""
echo "📊 Pour vérifier les données:"
echo "   docker exec -it $CONTAINER_NAME mongosh -u root -p $MONGO_PASSWORD"
echo "   > show dbs"
echo "   > use <nom_de_votre_base>"
echo "   > show collections"
echo ""
echo "🔙 Backup de sécurité disponible:"
echo "   /root/mongodb-backups/mongodb_current_backup_$BACKUP_DATE.tar.gz"
