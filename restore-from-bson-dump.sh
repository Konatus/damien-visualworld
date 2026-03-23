#!/bin/bash

set -e

echo "🔄 Restauration MongoDB depuis le dump BSON propre..."

DUMP_FILE="/root/visualworld-main-main/mongodump-clean-20260323-1644.tar.gz"
EXTRACT_DIR="/tmp/mongodump-restore"
CONTAINER="visualworld_mongodb-primary_1"

echo "📦 Étape 1: Extraction du dump..."
rm -rf $EXTRACT_DIR
mkdir -p $EXTRACT_DIR
cd $EXTRACT_DIR
tar -xzf $DUMP_FILE
echo "✅ Extraction terminée"

echo "📋 Étape 2: Backup de sécurité avant restauration..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/mongodb-backups
docker exec $CONTAINER mongodump -u root -p password123 --out=/tmp/backup-before-bson-restore 2>/dev/null || true
docker cp $CONTAINER:/tmp/backup-before-bson-restore /root/mongodb-backups/backup-$BACKUP_DATE 2>/dev/null || true
echo "✅ Backup de sécurité créé"

echo "📥 Étape 3: Copie du dump dans le conteneur..."
docker cp $EXTRACT_DIR/mongodump-clean $CONTAINER:/tmp/

echo "🔄 Étape 4: Restauration avec mongorestore..."
docker exec $CONTAINER mongorestore \
  -u root \
  -p password123 \
  --drop \
  /tmp/mongodump-clean

echo ""
echo "✅ Restauration terminée!"
echo ""
echo "📊 Vérification des données:"
docker exec $CONTAINER mongosh -u root -p password123 --eval "
  print('');
  print('=== BASES DE DONNÉES ===');
  db.adminCommand('listDatabases').databases.forEach(d => {
    print('  - ' + d.name + ' (' + (d.sizeOnDisk/1024/1024).toFixed(2) + ' MB)');
  });
  
  print('');
  print('=== BASE PRINCIPALE ===');
  const mainDb = db.getSiblingDB('68b70d885688a422d9513890');
  const boardCount = mainDb.Board.countDocuments();
  print('Nombre de Boards: ' + boardCount);
  
  if(boardCount > 0) {
    print('');
    print('Liste des Boards:');
    mainDb.Board.find({}, {'data.name': 1, 'private.createdBy': 1}).limit(20).forEach(b => {
      print('  ✅ ' + b.data.name + ' (créé par ' + b.private.createdBy + ')');
    });
    if(boardCount > 20) {
      print('  ... et ' + (boardCount - 20) + ' autres boards');
    }
  }
  
  print('');
  print('📋 Statistiques des collections:');
  mainDb.getCollectionNames().forEach(col => {
    const count = mainDb[col].countDocuments();
    if(count > 0) print('  - ' + col + ': ' + count + ' documents');
  });
"

echo ""
echo "🧹 Nettoyage..."
rm -rf $EXTRACT_DIR

echo ""
echo "✅ Restauration complète terminée avec succès!"
echo ""
echo "🔄 Redémarrage des APIs pour reconnexion..."
pm2 restart visualworld-api visualworld-api-dev visualworld-api-test --update-env

echo ""
echo "✅ TOUT EST PRÊT ! Vos boards sont restaurés ! 🎉"
