# 🚀 Smart Work Item Mover V2 - Version Gradin

## 🎯 Nouvelles Fonctionnalités V2

La version V2 du Smart Work Item Mover apporte des améliorations majeures pour un positionnement plus intelligent et visuellement attrayant des work items :

### ✨ Positionnement en Gradin (Staircase Layout)
- Les work items sont maintenant organisés en **gradin** comme sur votre photo
- Chaque niveau de gradin est décalé vers la droite et vers le bas
- Effet visuel d'escalier pour une meilleure lisibilité

### 📅 Tri par Date d'Échéance
- **Tri automatique** par `dueDate` avant positionnement
- Les items avec due date sont placés en premier
- Les items sans due date sont triés alphabétiquement et placés après

### 📏 Espacement 1K Feature
- **Espacement de 1000 pixels** entre chaque gradin
- Respecte la contrainte "1K Feature" demandée
- Ajustement automatique pour rester dans les zones

### 🎯 Centrage Amélioré
- **Centrage intelligent** dans les rectangles d'équipe
- Marges optimisées pour un meilleur rendu visuel
- Calcul automatique de l'espace disponible

### 🏠 Gestion des Itérations Non Trouvées
- Les work items avec des itérations inexistantes sont **placés à côté** des features
- Positionnement automatique dans une zone "orpheline"
- Aucun work item n'est perdu

## 📁 Fichiers

### `smart-work-item-mover-v2.js`
Le nouveau moteur avec toutes les améliorations :
- Classe `SmartWorkItemMoverV2`
- Algorithme de positionnement en gradin
- Tri par due date intégré
- Gestion des orphelins

### `test-smart-mover-v2.js`
Script de test complet avec options :
```bash
# Test complet avec déplacement
node test-smart-mover-v2.js

# Analyse seulement (pas de déplacement)
node test-smart-mover-v2.js -d

# Afficher l'aide
node test-smart-mover-v2.js --help
```

### `smart-work-item-mover.js` (Original)
L'ancienne version est **conservée** pour les tests et comparaisons.

## 🚀 Utilisation

### Test Rapide
```bash
# Lancer le test V2 avec toutes les nouvelles fonctionnalités
node test-smart-mover-v2.js
```

### Utilisation Programmatique
```javascript
const SmartWorkItemMoverV2 = require('./smart-work-item-mover-v2.js');

const mover = new SmartWorkItemMoverV2();
const worldId = 'votre-world-id';
const boardId = 'votre-board-id';

// Organiser en gradin avec tri par due date
await mover.organizeWorkItems(worldId, boardId);
```

## 🎨 Algorithme de Positionnement

### 1. Tri Initial
```
Work Items → Tri par due date → Groupement par équipe/itération
```

### 2. Calcul des Gradins
```
Pour chaque groupe:
  - Gradin 1: Position de base
  - Gradin 2: Décalage +1000px droite, +500px bas
  - Gradin 3: Décalage +2000px droite, +1000px bas
  - etc.
```

### 3. Centrage Intelligent
```
Position finale = Position base + Centrage + Décalage gradin
```

### 4. Gestion des Orphelins
```
Itération non trouvée → Zone orpheline à droite des features
```

## 📊 Statistiques Affichées

Le nouveau système affiche des statistiques détaillées :
- ✅ Total items traités
- 🏗️ Items en gradin
- 🏠 Items orphelins
- 📶 Nombre de gradins créés
- 📅 Items avec due date
- 🏢 Équipes/Itérations organisées

## 🔧 Configuration

### Espacement des Gradins
```javascript
this.FEATURE_SPACING = 1000; // 1K Feature comme demandé
```

### Dimensions des Work Items
```javascript
const itemWidth = 310;
const itemHeight = 300;
```

### Marges et Centrage
```javascript
const marginX = 30;  // Marge horizontale améliorée
const marginY = 30;  // Marge verticale améliorée
```

## 🎯 Comparaison V1 vs V2

| Fonctionnalité | V1 | V2 |
|---|---|---|
| Positionnement | Grille simple | **Gradin en escalier** |
| Tri | Aucun | **Par due date** |
| Espacement | Standard | **1K Feature** |
| Centrage | Basique | **Intelligent** |
| Itérations manquantes | Ignorées | **Placées à côté** |
| Statistiques | Basiques | **Détaillées** |

## 🎉 Résultat

Avec la V2, vos work items sont maintenant :
- ✨ **Organisés en gradin** comme sur votre photo
- 📅 **Triés par priorité** (due date)
- 📏 **Espacés de 1K Feature** entre les niveaux
- 🎯 **Parfaitement centrés** dans leurs zones
- 🏠 **Tous visibles** même si l'itération n'existe pas

L'ancien fichier est conservé pour les tests et la compatibilité ! 🛡️

