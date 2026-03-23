# 🚀 API d'Export Excel pour Visual World

## 📋 Description

Cette API permet d'exporter les données d'un tableau Visual World en format Excel, exactement comme le fait le bouton d'export du frontend.

## 🔧 Installation

### 1. Installer la dépendance XLSX

```bash
cd api
npm install xlsx
```

### 2. Redémarrer l'API

```bash
npm start
```

## 📡 Utilisation

### Endpoint

```
GET /api/board-export-excel?worldId={worldId}&boardId={boardId}
```

### Paramètres

- `worldId` (requis) : ID du monde Visual World
- `boardId` (requis) : ID du tableau à exporter

### Exemple d'utilisation

```bash
curl -X GET "http://localhost:8080/api/board-export-excel?worldId=68932ca97baa671b9427c55f&boardId=68a5ad99a7a68e06dca31859" \
     -H "x-forwarded-email: votre@email.com" \
     -H "x-forwarded-access-token: votre-token" \
     --output "mon_tableau.xlsx"
```

### Avec Python

```python
import requests

url = "http://localhost:8080/api/board-export-excel"
params = {
    "worldId": "68932ca97baa671b9427c55f",
    "boardId": "68a5ad99a7a68e06dca31859"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    with open("export.xlsx", "wb") as f:
        f.write(response.content)
    print("✅ Fichier Excel créé avec succès")
else:
    print(f"❌ Erreur: {response.status_code}")
```

## 📊 Format du fichier Excel

Le fichier Excel généré contient exactement les mêmes données que l'export frontend :

### Feuille "Objets"
- Nom du composant
- Position (Gauche, Haut, Largeur, Hauteur)
- Propriétés visuelles (Z-Index, Rotation, Couche)
- Couleurs (Fond, Contour, Texte)
- Toutes les propriétés dynamiques de l'objet

### Feuille "Liens"
- Origine et Fin (références aux lignes d'objets)
- Modèle de lien
- Propriétés visuelles (Libellé, Couleur, Taille, Courbe, Tiret)
- Formes des extrémités

## 🔒 Authentification

L'endpoint utilise le même système d'authentification que les autres endpoints Visual World :

- `x-forwarded-email` : Email de l'utilisateur
- `x-forwarded-access-token` : Token d'accès

## 🧪 Test

Utilisez le script de test fourni :

```bash
python test_excel_export_api.py
```

## ⚠️ Notes importantes

1. **Permissions** : L'utilisateur doit avoir les droits `board-io/get` sur le tableau
2. **Performance** : L'export peut prendre du temps pour les gros tableaux
3. **Limite de taille** : Les cellules Excel sont limitées à 32765 caractères
4. **Images** : Les images ne sont pas incluses dans l'export (comme dans le frontend)

## 🔄 Différences avec le frontend

- **Identique** : Structure des données, format des colonnes, calculs
- **Différent** : Pas d'interface utilisateur, génération côté serveur
- **Avantage** : Peut être appelé programmatiquement, pas besoin de navigateur
