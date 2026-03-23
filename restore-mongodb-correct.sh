#!/bin/bash

# Script de restauration MongoDB CORRECTE via dump/restore
set -e

echo "🔄 Restauration MongoDB CORRECTE via mongodump/mongorestore..."

BACKUP_EXTRACT="/tmp/check-backup/mongodb/data"
TEMP_PORT=27027
DUMP_DIR="/tmp/mongodb-dump"

echo "📦 Étape 1: Démarrage conteneur temporaire avec les données du backup..."
docker run -d --name mongodb-temp-restore \
  -p $TEMP_PORT:27017 \
  -v $BACKUP_EXTRACT:/bitnami/mongodb/data \
  -e MONGODB_ROOT_PASSWORD=temppass123 \
  -e ALLOW_EMPTY_PASSWORD=no \
  -e MONGODB_EXTRA_FLAGS="--wiredTigerCacheSizeGB=1" \
  bitnami/mongodb:latest

echo "⏳ Attente du démarrage (40 secondes)..."
sleep 40

echo "🔍 Vérification du conteneur..."
docker logs mongodb-temp-restore --tail 20

echo "📤 Étape 2: Dump de toutes les bases depuis le backup..."
docker exec mongodb-temp-restore mongodump -u root -p temppass123 --out=/tmp/dump || {
  echo "❌ Erreur lors du dump, affichage des logs complets:"
  docker logs mongodb-temp-restore
  docker stop mongodb-temp-restore 2>/dev/null || true
  docker rm mongodb-temp-restore 2>/dev/null || true
  exit 1
}

echo "📥 Étape 3: Copie du dump hors du conteneur..."
rm -rf $DUMP_DIR
docker cp mongodb-temp-restore:/tmp/dump $DUMP_DIR

echo "🛑 Étape 4: Arrêt du conteneur temporaire..."
docker stop mongodb-temp-restore
docker rm mongodb-temp-restore

echo "📋 Étape 5: Sauvegarde des données actuelles..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/mongodb-backups
docker exec visualworld_mongodb-primary_1 mongodump -u root -p password123 --out=/tmp/backup-before-restore
docker cp visualworld_mongodb-primary_1:/tmp/backup-before-restore /root/mongodb-backups/backup-$BACKUP_DATE

echo "📋 Étape 6: Restauration dans MongoDB principal..."
# Copier le dump dans le conteneur principal
docker cp $DUMP_DIR visualworld_mongodb-primary_1:/tmp/

# Restaurer chaque base
docker exec visualworld_mongodb-primary_1 mongorestore \
  -u root \
  -p password123 \
  --drop \
  /tmp/dump

echo "✅ Restauration terminée!"
echo ""
echo "📊 Vérification des Boards:"
docker exec visualworld_mongodb-primary_1 mongosh -u root -p password123 --eval "
  const db = db.getSiblingDB('69a05e00abb4a3efc22ee531');
  print('Nombre de Boards:', db.Board.countDocuments());
  print('');
  print('Liste des Boards:');
  db.Board.find({}, {'data.name': 1, 'private.createdBy': 1}).forEach(b => {
    print('  - ' + b.data.name + ' (créé par ' + b.private.createdBy + ')');
  });
"

echo ""
echo "🧹 Nettoyage..."
rm -rf $DUMP_DIR

echo ""
echo "✅ Restauration complète terminée!"
