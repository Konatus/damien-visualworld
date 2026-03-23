# 🔐 Configuration des Secrets GitHub pour CI/CD

## ✅ Clé SSH Générée

La clé SSH a été générée avec succès sur le serveur.

### 📋 Étapes à suivre :

## 1. Ajouter les Secrets sur GitHub

Allez sur : **https://github.com/Konatus/damien-visualworld/settings/secrets/actions**

### Cliquez sur "New repository secret" et ajoutez :

#### Secret 1 : SSH_HOST
```
Name: SSH_HOST
Value: 87.106.255.115
```

#### Secret 2 : SSH_USERNAME
```
Name: SSH_USERNAME
Value: root
```

#### Secret 3 : SSH_PORT (optionnel)
```
Name: SSH_PORT
Value: 22
```

#### Secret 4 : SSH_PRIVATE_KEY
```
Name: SSH_PRIVATE_KEY
Value: [Copier la CLÉ PRIVÉE ci-dessous]
```

## 🔑 CLÉ PRIVÉE À COPIER

**⚠️ IMPORTANT : Copiez TOUT le contenu entre les lignes BEGIN et END, incluant ces lignes**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDUhdyNyWJaAJ+c13qGWhKwl5/9hIXF3IV5W6Fsr6GapQAAAJjsrTCz7K0w
swAAAAtzc2gtZWQyNTUxOQAAACDUhdyNyWJaAJ+c13qGWhKwl5/9hIXF3IV5W6Fsr6GapQ
AAAEBurPtcss7LRKBANBpdCqT17qbLj1klEihh0nm1L15yNtSF3I3JYloAn5zXeoZaErCX
n/2EhcXchXlboWyvoZqlAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

## 2. Tester la Configuration

Une fois les secrets ajoutés, testez le déploiement :

```bash
# Faire un petit changement
cd /root/visualworld-main
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: vérification CI/CD"
git push origin main
```

Puis allez voir : **https://github.com/Konatus/damien-visualworld/actions**

## 3. Configurer PM2 Startup (Important)

Pour que PM2 redémarre automatiquement après un reboot du serveur :

```bash
pm2 startup
# Exécutez la commande affichée par PM2

pm2 save
```

## 4. Démarrer l'Application avec PM2

```bash
cd /root/visualworld-main
./start-pm2.sh
```

Ou manuellement :

```bash
cd /root/visualworld-main
pm2 start ecosystem.config.json
pm2 save
```

## 📊 Vérifier que tout fonctionne

```bash
# Statut PM2
pm2 status

# Logs
pm2 logs

# Ports ouverts
ss -tlnp | grep -E '3333|8080'

# Nginx
systemctl status nginx

# Tester l'accès
curl http://damien.konatus.site
curl http://87.106.255.115:3333
curl http://87.106.255.115:8080
```

## 🌳 Workflow Git

### Développement (branche dev)
```bash
git checkout dev
# ... faire des modifications ...
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin dev
# ✅ Déploiement automatique sur DEV (si configuré)
```

### Test (branche test)
```bash
git checkout test
git merge dev
git push origin test
# ✅ Déploiement automatique sur TEST (si configuré)
```

### Production (branche main)
```bash
git checkout main
git merge test
git push origin main
# ✅ Déploiement automatique sur PRODUCTION
```

## 🚨 Important

- ✅ La clé SSH a été ajoutée à `~/.ssh/authorized_keys`
- ✅ Les branches dev, test et main ont été créées
- ✅ La pipeline CI/CD est configurée
- ⏳ Les secrets GitHub doivent être configurés manuellement
- ⏳ PM2 startup doit être configuré

## 📚 Documentation

Consultez `CICD-README.md` pour plus de détails sur :
- La stratégie de branches
- Les commandes PM2
- Le monitoring
- Le dépannage

## 🎯 Prochaines étapes

1. ✅ Configurer les secrets GitHub (voir ci-dessus)
2. ✅ Configurer PM2 startup : `pm2 startup && pm2 save`
3. ✅ Démarrer l'application : `./start-pm2.sh`
4. ✅ Tester le déploiement avec un push sur main
5. ✅ Vérifier les logs : `pm2 logs`

---

**Date de génération** : 23 Mars 2026
**Serveur** : 87.106.255.115
**Repository** : https://github.com/Konatus/damien-visualworld
