# ✅ Configuration Multi-Environnements Complète !

## 🎉 Tous les services sont en ligne !

### 📊 État des Services

| Environnement | URL | Frontend | API | Nginx | PM2 | Status |
|--------------|-----|----------|-----|-------|-----|--------|
| **PROD** | http://damien.konatus.site | Port 3333 | Port 8080 | ✅ | `visualworld-api`<br>`visualworld-front` | ✅ ONLINE |
| **DEV** | http://dev.damien.konatus.site | Port 3334 | Port 8081 | ✅ | `visualworld-api-dev`<br>`visualworld-front-dev` | ✅ ONLINE |
| **TEST** | http://test.damien.konatus.site | Port 3335 | Port 8082 | ✅ | `visualworld-api-test`<br>`visualworld-front-test` | ✅ ONLINE |

---

## 📁 Structure des Répertoires

```
/root/
├── visualworld-main/          # PRODUCTION (branche main)
│   ├── api/                   # API sur port 8080
│   ├── front/                 # Frontend sur port 3333
│   └── ecosystem.config.json
│
├── visualworld-dev/           # DEVELOPMENT (branche dev)
│   ├── api/                   # API sur port 8081
│   ├── front/                 # Frontend sur port 3334
│   └── ecosystem.config.json
│
└── visualworld-test/          # TEST (branche test)
    ├── api/                   # API sur port 8082
    ├── front/                 # Frontend sur port 3335
    └── ecosystem.config.json
```

---

## 🌐 Configuration Nginx

### PROD - damien.konatus.site
```
/etc/nginx/sites-available/damien.konatus.site
→ Proxy vers 127.0.0.1:3333
```

### DEV - dev.damien.konatus.site
```
/etc/nginx/sites-available/dev.damien.konatus.site
→ Proxy vers 127.0.0.1:3334
```

### TEST - test.damien.konatus.site
```
/etc/nginx/sites-available/test.damien.konatus.site
→ Proxy vers 127.0.0.1:3335
```

---

## 🔧 Commandes PM2

### Voir le statut
```bash
pm2 status
```

### Redémarrer un environnement
```bash
# PROD
pm2 restart visualworld-api visualworld-front

# DEV
pm2 restart visualworld-api-dev visualworld-front-dev

# TEST
pm2 restart visualworld-api-test visualworld-front-test
```

### Voir les logs
```bash
# PROD
pm2 logs visualworld-api
pm2 logs visualworld-front

# DEV
pm2 logs visualworld-api-dev
pm2 logs visualworld-front-dev

# TEST
pm2 logs visualworld-api-test
pm2 logs visualworld-front-test

# Tous
pm2 logs
```

### Arrêter/Démarrer
```bash
# Arrêter un environnement
pm2 stop visualworld-api-dev visualworld-front-dev

# Démarrer un environnement
pm2 start visualworld-api-dev visualworld-front-dev

# Tout arrêter
pm2 stop all

# Tout redémarrer
pm2 restart all
```

---

## 🔄 Workflow Git

### 1. Développement sur DEV
```bash
cd /root/visualworld-main-dev
git checkout dev
# ... faire des modifications ...
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin dev
```

### 2. Test sur TEST
```bash
cd /root/visualworld-main-test
git checkout test
git pull origin test
git merge dev
git push origin test

# Ou via la branche principale
cd /root/visualworld-main-main
git checkout test
git merge dev
git push origin test

# Puis mettre à jour le dossier test
cd /root/visualworld-main-test
git pull origin test
pm2 restart visualworld-api-test visualworld-front-test --update-env
```

### 3. Déploiement en PROD
```bash
cd /root/visualworld-main-main
git checkout main
git merge test
git push origin main

# Le déploiement automatique via CI/CD se lance
# Ou manuel:
git pull origin main
cd api && npm install
cd ../front && npm install --legacy-peer-deps
pm2 restart visualworld-api visualworld-front --update-env
```

---

## 🚨 Dépannage

### Un service ne démarre pas ?
```bash
# Voir les logs d'erreur
pm2 logs <nom-service> --err

# Redémarrer avec mise à jour de l'environnement
pm2 restart <nom-service> --update-env

# Supprimer et relancer
pm2 delete <nom-service>
pm2 start /root/visualworld-main-<env>/ecosystem.config.json
```

### Un port est déjà utilisé ?
```bash
# Trouver qui utilise le port
ss -tlnp | grep :<PORT>

# Tuer le processus
kill -9 <PID>

# Redémarrer le service
pm2 restart <nom-service>
```

### Nginx ne fonctionne pas ?
```bash
# Tester la configuration
nginx -t

# Voir les erreurs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/<site>-error.log

# Redémarrer Nginx
systemctl restart nginx
```

### Les modifications ne sont pas prises en compte ?
```bash
# S'assurer d'être sur la bonne branche
cd /root/visualworld-main-<env>
git branch  # Vérifier la branche actuelle
git pull origin <branche>

# Réinstaller les dépendances
cd api && npm install
cd ../front && npm install --legacy-peer-deps

# Redémarrer avec --update-env
pm2 restart visualworld-api-<env> visualworld-front-<env> --update-env
```

---

## 📊 Monitoring

### Vérifier que tout tourne
```bash
# PM2
pm2 status

# Ports
ss -tlnp | grep -E '3333|3334|3335|8080|8081|8082'

# Nginx
systemctl status nginx

# Tester les URLs
curl http://damien.konatus.site
curl http://dev.damien.konatus.site
curl http://test.damien.konatus.site
```

### Voir l'utilisation des ressources
```bash
pm2 monit
```

---

## 🔐 Sécurité

### Sauvegardes
```bash
# Base de données (si applicable)
ls -lh /root/visualworld-main-backups/

# PM2
pm2 save
```

### Logs
```bash
# Logs PM2
ls -lh /var/log/visualworld-*.log

# Logs Nginx
ls -lh /var/log/nginx/*.log
```

---

## ✅ Checklist de Vérification

- [x] 3 environnements configurés (PROD, DEV, TEST)
- [x] 3 sous-domaines DNS configurés
- [x] 6 services PM2 en ligne
- [x] 6 ports ouverts (3333-3335 frontend, 8080-8082 API)
- [x] 3 configurations Nginx actives
- [x] PM2 sauvegardé
- [ ] PM2 startup configuré pour redémarrage auto
- [x] Pipeline CI/CD pour PROD configurée
- [ ] Pipeline CI/CD pour DEV et TEST (optionnel)

---

## 🎯 Prochaines Étapes

1. **Configurer PM2 startup** (pour redémarrage automatique au boot)
   ```bash
   pm2 startup
   # Exécuter la commande affichée
   pm2 save
   ```

2. **Tester les 3 environnements**
   - http://damien.konatus.site
   - http://dev.damien.konatus.site
   - http://test.damien.konatus.site

3. **Configurer la CI/CD pour DEV et TEST** (optionnel)
   - Mettre à jour `.github/workflows/deploy.yml`
   - Ajouter les secrets pour DEV et TEST

4. **SSL/HTTPS avec Let's Encrypt**
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d damien.konatus.site -d dev.damien.konatus.site -d test.damien.konatus.site
   ```

---

**Date de mise à jour** : 23 Mars 2026  
**Serveur** : 87.106.255.115  
**Node.js** : v18.20.8  
**PM2** : Installé et configuré  
**Nginx** : Actif
