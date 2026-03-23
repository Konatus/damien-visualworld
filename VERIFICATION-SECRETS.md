# ✅ Vérification des Secrets GitHub

## 📋 Checklist des Secrets à Configurer

Pour que la pipeline CI/CD fonctionne, vous devez avoir configuré ces **3 secrets** sur GitHub :

**URL** : https://github.com/Konatus/damien-visualworld/settings/secrets/actions

### Secrets requis pour PRODUCTION :

| Secret Name | Valeur | Status |
|------------|--------|--------|
| `SSH_HOST` | `87.106.255.115` | ⏳ À vérifier |
| `SSH_USERNAME` | `root` | ⏳ À vérifier |
| `SSH_PRIVATE_KEY` | Clé SSH complète (voir ci-dessous) | ⏳ À vérifier |

---

## 🔑 Clé SSH Privée à Copier

**⚠️ IMPORTANT : Copiez EXACTEMENT tout le contenu ci-dessous, incluant les lignes BEGIN et END**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDUhdyNyWJaAJ+c13qGWhKwl5/9hIXF3IV5W6Fsr6GapQAAAJjsrTCz7K0w
swAAAAtzc2gtZWQyNTUxOQAAACDUhdyNyWJaAJ+c13qGWhKwl5/9hIXF3IV5W6Fsr6GapQ
AAAEBurPtcss7LRKBANBpdCqT17qbLj1klEihh0nm1L15yNtSF3I3JYloAn5zXeoZaErCX
n/2EhcXchXlboWyvoZqlAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

---

## 📸 Comment Vérifier les Secrets

1. **Allez sur GitHub** : https://github.com/Konatus/damien-visualworld/settings/secrets/actions

2. **Vous devriez voir 3 secrets** :
   ```
   SSH_HOST           Updated X days ago
   SSH_PRIVATE_KEY    Updated X days ago
   SSH_USERNAME       Updated X days ago
   ```

3. **Si vous ne voyez pas les 3 secrets** → Cliquez sur "New repository secret" et ajoutez-les

---

## 🧪 Tester la Configuration

Une fois les secrets configurés, testez avec :

```bash
cd /root/visualworld-main-main
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: vérification pipeline CI/CD avec secrets"
git push origin main
```

Puis vérifiez : **https://github.com/Konatus/damien-visualworld/actions**

---

## ❌ Si la Pipeline Échoue Encore

### Erreur: "missing server host"
→ Le secret `SSH_HOST` n'est pas configuré ou est vide

**Solution** :
1. Allez sur : https://github.com/Konatus/damien-visualworld/settings/secrets/actions
2. Vérifiez que `SSH_HOST` existe
3. Si non, créez-le avec la valeur : `87.106.255.115`

### Erreur: "Permission denied"
→ Le secret `SSH_PRIVATE_KEY` est incorrect ou incomplet

**Solution** :
1. Vérifiez que vous avez copié **TOUTE** la clé (y compris BEGIN et END)
2. Pas d'espaces avant ou après
3. Recréez le secret si nécessaire

### Erreur: "Host key verification failed"
→ Normal la première fois, la pipeline devrait passer au 2ème essai

---

## 🎯 État Actuel

- ✅ Pipeline simplifiée (production uniquement)
- ✅ Node.js v18.20.8 configuré
- ✅ API : `npm start`
- ✅ Frontend : `npm run serve`
- ✅ Clé SSH générée
- ⏳ Secrets GitHub à vérifier

---

## 📞 Ports Configurés

| Environnement | Frontend | API | Statut |
|--------------|----------|-----|--------|
| PROD (main) | 3333 | 8080 | ✅ Configuré |
| TEST (test) | 3335 | 8082 | 🔜 À venir |
| DEV (dev) | 3334 | 8081 | 🔜 À venir |

Pour le moment, seule la **PRODUCTION** est déployée automatiquement.

---

**Dernière mise à jour** : 23 Mars 2026
