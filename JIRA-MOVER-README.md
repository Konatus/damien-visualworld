# 🚀 Smart Work Item Mover - Version Jira Optimisée

## 📋 Vue d'ensemble

Système intelligent qui organise automatiquement les work items Jira par projet avec une disposition professionnelle et uniformisée.

## 🏷️ Projets supportés

| Préfixe | Nom complet du projet |
|---------|----------------------|
| **FF**  | Forfait Familial |
| **REP** | Nouveau programme Réparation |
| **FID** | Nv programme Fidélité |
| **L1**  | Abonnement Ligue1 |

## 📐 Organisation visuelle

### Disposition par projet

Chaque projet est organisé sur une rangée horizontale avec deux zones distinctes :

```
Projet FF - Forfait Familial:
                                               🎯 🎯 🎯  ← Features (-80px vers le haut)
                                              ┌───┬───┬───┐
  📌📌📌📌📌📌📌📌📌📌                     ← Marge 100px →  └───┴───┴───┘
  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
  ↑ 20px entre chaque                            ↑
  Work Items (serrés et uniformes)              Features (à droite, plus hautes)

Projet REP - Nouveau programme Réparation:
                                      🎯 🎯
                                     ┌───┬───┐
  📌📌📌📌📌📌                  ← +100px →  └───┴───┘
  └─┴─┴─┴─┴─┴─┘

[Légende]
📌 = K Work Item (310×300px) - espacement 20px
🎯 = K Feature (220×300px) - à droite avec delta -80px
```

### Règles de placement

1. **K Work Items** 📌
   - Alignés horizontalement de gauche à droite
   - Ligne de base du projet
   - Espacement serré et uniforme de **20px** entre chaque carte
   - Positionnés à partir de x=40px

2. **K Features** 🎯
   - **UNE Feature par projet** (représente le projet lui-même)
   - Placées **À DROITE de l'écran** (position X fixe = 3200px)
   - **Alignées verticalement** avec leur ligne de Work Items
   - **Décalage de -80px vers le haut** par rapport à la ligne de base (effet delta visuel fort)
   - Chaque Feature suit le même espacement vertical que son projet (400px entre lignes)
   - Z-index plus élevé (au-dessus des Work Items)

## 📏 Dimensions et espacements

### Dimensions des composants
- **K Work Item**: 310×300px
- **K Feature**: 220×300px

### Espacements uniformisés
- **Horizontal Work Items**: 20px entre les cartes (serré et uniforme)
- **Horizontal Features**: 15px entre Features
- **Vertical entre projets**: 100px
- **Delta Features**: -80px vers le haut (effet visuel fort)

### Points de départ
- **Work Items** - Position X: 40px (à gauche)
- **Features** - Position X: 1600px (À DROITE, position fixe)
- Position Y initiale: 120px
- Z-index de base: 100 (Work Items), 1100+ (Features)

## 🎯 Fonctionnalités

### Détection automatique
- ✅ Reconnaissance des préfixes de projet (FF, REP, FID, L1)
- ✅ Support des patterns: `Rep9`, `FF.24`, `Fid31`, `L1-13`
- ✅ Tri alphabétique automatique des projets
- ✅ Affichage des noms complets

### Organisation intelligente
- ✅ Séparation Work Items / Features
- ✅ Placement en deux phases par projet
- ✅ Distances uniformes et professionnelles
- ✅ Hiérarchie visuelle claire (delta vertical)

### Compatibilité
- ✅ K - Work Item (`681bd1c4fe6d77d26c416b9a`)
- ✅ K - Feature (`681bccf2fe6d770bea41690d`)
- ✅ Ancien modèle Jira (`56575f6a6972615f75735f6d`)

## 🧪 Utilisation

### Test complet avec organisation
```bash
node test-jira-mover.js
```

### Détection seulement (sans modification)
```bash
node test-jira-mover.js -d
# ou
node test-jira-mover.js --detect-only
```

### Aide
```bash
node test-jira-mover.js --help
```

## 📊 Exemple de sortie

```
🏷️ PROJETS DÉTECTÉS:
   📦 FF (Forfait Familial): 5 Work Items + 3 Features = 8 total
   📦 FID (Nv programme Fidélité): 3 Work Items + 2 Features = 5 total
   📦 L1 (Abonnement Ligue1): 4 Work Items + 1 Features = 5 total
   📦 REP (Nouveau programme Réparation): 7 Work Items + 4 Features = 11 total

🎯 Organisation du projet: FF - Forfait Familial (8 items)
   📊 5 Work Items + 3 Features
   📌 Work Item: "FF.24 - Dashboard principal" (FF-24)
      📍 Position: (100, 100)
      ✅ Déplacé avec succès
   ...
   🎯 Feature: "FF - Forfait Familial" (FF-1)
      📍 Position (avec delta): (1850, 50)
      ✅ Déplacé avec succès

🎉 ORGANISATION TERMINÉE !
📊 29 work items Jira organisés

📈 STATISTIQUES PAR PROJET:
   🎯 FF - Forfait Familial: 5 Work Items + 3 Features = 8 total
   🎯 FID - Nv programme Fidélité: 3 Work Items + 2 Features = 5 total
   🎯 L1 - Abonnement Ligue1: 4 Work Items + 1 Features = 5 total
   🎯 REP - Nouveau programme Réparation: 7 Work Items + 4 Features = 11 total
```

## 🔧 Configuration API

### IDs requis
- **World ID**: `68b70d885688a422d9513890`
- **Board ID**: `693007754e841f6d3dbbed07`

### Endpoint
- Base URL: `http://localhost:8080`
- API: `/api/board-io` (GET)
- Update: `/api/position-update` (PUT)

## ✨ Améliorations apportées

### Version optimisée (actuelle)
1. ✅ Espacements uniformisés (40px horiz, 80px vert)
2. ✅ Placement intelligent des Features à droite avec delta visuel
3. ✅ Noms complets des projets affichés
4. ✅ Séparation claire Work Items / Features
5. ✅ Documentation complète et logs détaillés
6. ✅ Organisation professionnelle et cohérente

### Version précédente
- ❌ Espacement non uniforme (largeur moyenne)
- ❌ Pas de distinction visuelle Features/Work Items
- ❌ Pas de noms complets de projets
- ❌ Placement mélangé Work Items et Features

## 📝 Notes importantes

- **K Features = Projets** : Les K Features représentent les projets eux-mêmes
- **Delta visuel** : Le décalage de -50px vers le haut crée une hiérarchie visuelle
- **Uniformité** : Les espacements sont maintenant constants (40px) pour un rendu professionnel
- **Délai API** : 150ms entre chaque déplacement pour éviter la surcharge

## 🎨 Résultat visuel attendu

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  FF - Forfait Familial:                                           │
│                                                       🎯 🎯 🎯     │
│  📌📌📌📌📌📌📌📌📌                            ← +100px → └┬┬┬┘    │
│  └┴┴┴┴┴┴┴┴┴┘                                          ↑          │
│   20px (serré)                                    Features -80px  │
│                                                                    │
│  ↓ 100px entre projets                                            │
│                                                                    │
│  REP - Nouveau programme Réparation:                              │
│                                              🎯 🎯                 │
│  📌📌📌📌📌📌                     ← +100px → └┬┬┘                 │
│  └┴┴┴┴┴┴┘                                                        │
│   20px                                                            │
│                                                                    │
│  ↓ 100px                                                          │
│                                                                    │
│  FID - Nv programme Fidélité:                                     │
│                                                     🎯             │
│  📌📌📌📌📌📌📌                           ← +100px → └┘            │
│  └┴┴┴┴┴┴┴┘                                                       │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Rendu professionnel, structuré et facile à naviguer ! 🎉
