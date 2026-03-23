# CI/CD Pipeline - VisualWorld

## 📋 Vue d'ensemble

Pipeline CI/CD automatisée avec 3 environnements pour l'application VisualWorld.

## 🌳 Stratégie de Branches

### Structure des branches :

- **`main`** → **PRODUCTION** (http://damien.konatus.site)
- **`test`** → **TEST** (http://test.damien.konatus.site)
- **`dev`** → **DEVELOPMENT** (http://dev.damien.konatus.site)

### Workflow Git Flow :

```
dev → test → main
 ↓      ↓      ↓
DEV   TEST   PROD
```

1. Développeurs travaillent sur `dev`
2. Merge `dev` → `test` pour tester
3. Merge `test` → `main` pour déployer en prod

## ⚙️ Configuration Technique

### Node.js Version
- **Version** : `18.20.8` (importante pour la compatibilité)

### Commandes de lancement

#### API
```bash
cd api
npm start
```

#### Frontend
```bash
cd front
npm run serve
```

## 🔐 Configuration des Secrets GitHub

### Pour PRODUCTION (branche main) :

Allez sur **https://github.com/Konatus/damien-visualworld/settings/secrets/actions**

1. **SSH_HOST** : `87.106.255.115`
2. **SSH_USERNAME** : `root`
3. **SSH_PRIVATE_KEY** : Votre clé SSH privée (voir ci-dessous)
4. **SSH_PORT** : `22` (optionnel)

### Pour TEST (branche test) - Si environnement séparé :

1. **TEST_SSH_HOST** : Adresse du serveur TEST
2. **TEST_SSH_USERNAME** : Username SSH
3. **TEST_SSH_PRIVATE_KEY** : Clé SSH privée
4. **TEST_SSH_PORT** : Port SSH (optionnel)

### Pour DEV (branche dev) - Si environnement séparé :

1. **DEV_SSH_HOST** : Adresse du serveur DEV
2. **DEV_SSH_USERNAME** : Username SSH
3. **DEV_SSH_PRIVATE_KEY** : Clé SSH privée
4. **DEV_SSH_PORT** : Port SSH (optionnel)

### Générer la clé SSH :

```bash
# Sur le serveur de production
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""

# Afficher la clé PRIVÉE (à copier dans GitHub Secret)
cat ~/.ssh/github_deploy_key

# Ajouter la clé PUBLIQUE aux clés autorisées
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 📦 Installation PM2 (Déjà installé ✅)

PM2 est déjà installé sur votre serveur. Configuration :

```bash
# Démarrer les applications
cd /root/visualworld-main-main
pm2 start ecosystem.config.json

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique au boot
pm2 startup

# Commandes utiles
pm2 status                    # Voir le statut
pm2 logs                      # Voir tous les logs
pm2 logs visualworld-api      # Logs de l'API
pm2 logs visualworld-front    # Logs du frontend
pm2 restart visualworld-api   # Redémarrer l'API
pm2 restart visualworld-front # Redémarrer le frontend
pm2 stop all                  # Tout arrêter
pm2 delete all                # Tout supprimer
```

## 🚀 Flux de Déploiement

### DEV (branche dev)
```bash
git checkout dev
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin dev
# ✅ Déploiement automatique sur l'environnement DEV
```

### TEST (branche test)
```bash
git checkout test
git merge dev
git push origin test
# ✅ Déploiement automatique sur l'environnement TEST
```

### PRODUCTION (branche main)
```bash
git checkout main
git merge test
git push origin main
# ✅ Déploiement automatique sur PRODUCTION
```

## 🔧 Ce que fait la Pipeline

### Pour chaque environnement :

1. **Build & Test**
   - Installation des dépendances avec Node 18.20.8
   - Linting du code
   - Build (pour prod uniquement)

2. **Déploiement**
   - Connexion SSH au serveur
   - Pull du code depuis GitHub
   - Installation des dépendances
   - Redémarrage avec PM2

3. **Health Check** (prod uniquement)
   - Vérification que l'API tourne
   - Vérification que le Frontend tourne
   - Vérification des ports 8080 et 3333

4. **Backup** (prod uniquement)
   - Backup automatique de `visualworld.db`
   - Conservation des 10 derniers backups

## 📊 Monitoring

### Vérifier les logs :

```bash
# Avec PM2
pm2 logs
pm2 logs visualworld-api --lines 100
pm2 logs visualworld-front --lines 100

# Fichiers de logs
tail -f /var/log/visualworld-api-out.log
tail -f /var/log/visualworld-api-error.log
tail -f /var/log/visualworld-front-out.log
tail -f /var/log/visualworld-front-error.log
```

### Vérifier les processus :

```bash
# Avec PM2
pm2 status
pm2 monit  # Interface interactive

# Ports
ss -tlnp | grep -E '3333|8080'

# Nginx
systemctl status nginx
```

## 🐛 Dépannage

### La pipeline échoue ?

1. **Vérifier les secrets GitHub**
   - Allez dans Settings → Secrets → Actions
   - Vérifiez que tous les secrets sont configurés

2. **Vérifier les logs GitHub Actions**
   - https://github.com/Konatus/damien-visualworld/actions
   - Cliquez sur le workflow qui a échoué
   - Regardez les logs détaillés

3. **Tester la connexion SSH manuellement**
   ```bash
   ssh root@87.106.255.115
   ```

### Les services ne démarrent pas ?

```bash
# Vérifier PM2
pm2 status
pm2 logs --err

# Redémarrer manuellement
pm2 restart all

# Ou sans PM2
cd /root/visualworld-main-main
pkill -f "node.*visualworld"
cd api && npm start &
cd ../front && npm run serve &
```

### Problèmes de permissions ?

```bash
# Donner les permissions sur les dossiers
chown -R root:root /root/visualworld-main-main
chmod -R 755 /root/visualworld-main-main
```

## 📁 Structure des Backups

```
/root/visualworld-main-backups/
├── visualworld_20260323_143000.db
├── visualworld_20260323_153000.db
└── ... (10 derniers backups conservés)
```

## 🌐 URLs des Environnements

| Environnement | URL | Branche | Port API | Port Front |
|--------------|-----|---------|----------|------------|
| DEV | http://dev.damien.konatus.site | `dev` | 8081 | 3334 |
| TEST | http://test.damien.konatus.site | `test` | 8082 | 3335 |
| PROD | http://damien.konatus.site | `main` | 8080 | 3333 |

## ✅ Checklist d'Installation

- [x] Node.js v18.20.8 installé
- [x] PM2 installé
- [x] Nginx configuré
- [x] Branches créées (dev, test, main)
- [x] Pipeline CI/CD configurée
- [ ] Secrets GitHub configurés
- [ ] Clé SSH générée et ajoutée
- [ ] Premier déploiement testé
- [ ] PM2 startup configuré

## 🔄 Prochaines Étapes

1. **Configurer les secrets GitHub**
2. **Générer et ajouter la clé SSH**
3. **Faire un premier push pour tester**
4. **Configurer PM2 startup** : `pm2 startup && pm2 save`
5. **Tester les 3 environnements**

## 💡 Bonnes Pratiques

1. **Ne jamais commit directement sur `main`**
2. **Toujours passer par `dev` → `test` → `main`**
3. **Tester sur `test` avant de merger sur `main`**
4. **Vérifier les logs après chaque déploiement**
5. **Faire des commits atomiques avec des messages clairs**

---

**Dernière mise à jour** : 23 Mars 2026
