# Tableau de Correspondance Excel → Base de Données AlignIQ

## 📋 Vue d'ensemble

Ce document présente la correspondance entre les 4 feuilles du fichier Excel `Param AlignIQ.xlsx` et les tables de la base de données PostgreSQL AlignIQ.

### Feuilles Excel :
- **Workitem** : Éléments de travail avec leurs attributs
- **Feature** : Programmes/Projets (Features/Epics)
- **Team** : Équipes et leurs capacités
- **depends** : Dépendances entre workitems

---

## 📊 **Feuille 1 : Workitem** → Tables `workelement` + `attribut`

| **Colonne Excel** | **Type** | **Obligatoire** | **Table BDD** | **Colonne BDD** | **Action** | **Règles de Transformation** |
|-------------------|----------|-----------------|---------------|-----------------|------------|------------------------------|
| **WI_id** | integer | ✅ MUST HAVE | workelement | we_id | INSERT | Clé primaire |
| **WI_name** | string | ✅ MUST HAVE | workelement | we_name | INSERT | Copie directe |
| **Feature** | id | ✅ MUST HAVE | workelement | programid | INSERT | Référence vers program_backlog |
| **Job** | string | ✅ MUST HAVE | attribut | id_job | LOOKUP | `SELECT id FROM job WHERE name = ?` |
| **Load** | number | ✅ MUST HAVE | attribut | att_load_demande | INSERT | Conversion numérique |
| **FTE** | number | ✅ MUST HAVE | attribut | att_fte_demande | INSERT | Conversion numérique |
| **Duration** | number | 🔵 System | attribut | att_duration_demande | INSERT | Calculé par le système |
| **Phase** | integer | 🟡 Nice to have | attribut | gateid | LOOKUP | `SELECT id FROM phases WHERE name = ?` |
| **Business Value** | number | 🟡 Nice to have | attribut | att_value | INSERT | Conversion numérique |
| **Due Date** | date | 🔵 System | attribut | att_end_date_demande | INSERT | Date héritée du parent |
| **Priority** | integer | 🟡 Nice to have | attribut | att_priority | INSERT | 1-5 (1=Highest, 5=Lowest) |
| **Start Date** | date | 🔵 System | attribut | att_start_date_demande | INSERT | Calculé par simulation |
| **Team** | string | 🔵 System | attribut | teamid | LOOKUP | `SELECT id FROM team WHERE name = ?` |
| **Due Iteration** | date | 🔵 System | attribut | att_end_date_engage | INSERT | Calculé par IA Konatus |
| **Iteration** | integer | 🔵 System | attribut | att_priority | INSERT | Calculé par IA Konatus |

---

## 📊 **Feuille 2 : Feature** → Table `program_backlog`

| **Colonne Excel** | **Type** | **Obligatoire** | **Table BDD** | **Colonne BDD** | **Action** | **Règles de Transformation** |
|-------------------|----------|-----------------|---------------|-----------------|------------|------------------------------|
| **id_feature** | integer | ✅ MUST HAVE | program_backlog | prbg_id | INSERT | Clé primaire |
| **name** | string | ✅ MUST HAVE | program_backlog | prbg_name | INSERT | Copie directe |
| **priority** | integer | 🟡 Nice to have | program_backlog | prbg_priority | INSERT | Conversion numérique |
| **due date** | date | ✅ MUST HAVE | program_backlog | prbg_deadline | INSERT | Conversion date |

---

## 📊 **Feuille 3 : Team** → Tables `team` + `team_ressources`

| **Colonne Excel** | **Type** | **Obligatoire** | **Table BDD** | **Colonne BDD** | **Action** | **Règles de Transformation** |
|-------------------|----------|-----------------|---------------|-----------------|------------|------------------------------|
| **id_team** | integer | ✅ MUST HAVE | team | id | INSERT | Clé primaire |
| **libelle_team** | string | ✅ MUST HAVE | team | libelle | INSERT | Copie directe |
| **name** | string | ✅ MUST HAVE | team | name | INSERT | Copie directe |
| **capacity_n** | Array[Float] | ✅ MUST HAVE | team_ressources | capacityBySkillset | INSERT | Une ligne par capacité |
| **id_job** | integer | ✅ MUST HAVE | team | job | INSERT | Référence vers job |
| **job** | string | ✅ MUST HAVE | team_ressources | idskillseet | LOOKUP | `SELECT id FROM skillset WHERE name = ?` |

---

## 📊 **Feuille 4 : depends** → Table `depends`

| **Colonne Excel** | **Type** | **Obligatoire** | **Table BDD** | **Colonne BDD** | **Action** | **Règles de Transformation** |
|-------------------|----------|-----------------|---------------|-----------------|------------|------------------------------|
| **WI_id** | integer | ✅ MUST HAVE | depends | childid | INSERT | Référence vers workelement |
| **parentid** | integer | ✅ MUST HAVE | depends | parentid | INSERT | ID du workitem parent |
| **childid** | integer | 🟡 Nice to have | depends | childid | INSERT | ID du workitem enfant |

---

## 🔧 **Script d'Intégration SQL**

### 1. Préparation des tables de référence

```sql
-- Vérifier que les tables de référence existent
SELECT 'job' as table_name, COUNT(*) as count FROM job
UNION ALL
SELECT 'phases', COUNT(*) FROM phases
UNION ALL
SELECT 'skillset', COUNT(*) FROM skillset
UNION ALL
SELECT 'team', COUNT(*) FROM team;
```

### 2. Intégration des Features (obligatoire en premier)

```sql
-- Insérer les Features
INSERT INTO program_backlog (prbg_id, prbg_name, prbg_priority, prbg_deadline)
SELECT 
    id_feature, 
    name, 
    COALESCE(priority, 3), -- Valeur par défaut si null
    "due date"
FROM excel_feature_data
WHERE id_feature IS NOT NULL;
```

### 3. Intégration des Teams

```sql
-- Insérer les Teams
INSERT INTO team (id, libelle, name, job)
SELECT 
    id_team, 
    libelle_team, 
    name, 
    id_job
FROM excel_team_data
WHERE id_team IS NOT NULL;

-- Insérer les capacités des teams
INSERT INTO team_ressources (idteam, idskillseet, capacityBySkillset)
SELECT 
    id_team,
    (SELECT id FROM skillset WHERE name = job),
    capacity_n
FROM excel_team_data
WHERE id_team IS NOT NULL AND job IS NOT NULL;
```

### 4. Intégration des Workitems

```sql
-- Insérer les Workitems
INSERT INTO workelement (we_id, we_name, programid)
SELECT 
    WI_id, 
    WI_name, 
    Feature
FROM excel_workitem_data
WHERE WI_id IS NOT NULL;

-- Insérer les attributs des Workitems
INSERT INTO attribut (
    weid, id_job, att_load_demande, att_fte_demande, att_duration_demande,
    gateid, att_value, att_end_date_demande, att_priority, 
    att_start_date_demande, teamid, att_end_date_engage
)
SELECT 
    WI_id,
    (SELECT id FROM job WHERE name = Job),
    Load,
    FTE,
    Duration,
    (SELECT id FROM phases WHERE name = Phase),
    "Business Value",
    "Due Date",
    COALESCE(Priority, 3), -- Valeur par défaut si null
    "Start Date",
    (SELECT id FROM team WHERE name = Team),
    "Due Iteration"
FROM excel_workitem_data
WHERE WI_id IS NOT NULL;
```

### 5. Intégration des Dépendances

```sql
-- Insérer les dépendances
INSERT INTO depends (parentid, childid)
SELECT 
    parentid, 
    childid
FROM excel_depends_data
WHERE parentid IS NOT NULL AND childid IS NOT NULL;
```

---

## 📋 **Ordre d'Intégration Recommandé**

1. **Features** (program_backlog) - Les programmes doivent exister avant les workitems
2. **Teams** - Les équipes doivent exister avant l'affectation
3. **Workitems** (workelement + attribut) - Les workitems avec leurs attributs
4. **Dépendances** (depends) - Les dépendances entre workitems

---

## ⚠️ **Points d'Attention**

### Contraintes de Clés Étrangères
- `workelement.programid` → `program_backlog.prbg_id`
- `attribut.teamid` → `team.id`
- `attribut.id_job` → `job.id`
- `attribut.gateid` → `phases.id`
- `depends.parentid` → `workelement.we_id`
- `depends.childid` → `workelement.we_id`

### Gestion des Erreurs
- Vérifier l'existence des références avant insertion
- Utiliser des valeurs par défaut pour les champs optionnels
- Gérer les doublons avec `ON CONFLICT`

### Types de Données
- **Dates** : Conversion Excel → PostgreSQL DATE
- **Nombres** : Conversion Excel → PostgreSQL NUMERIC
- **Textes** : Conversion Excel → PostgreSQL VARCHAR/TEXT
- **Lookups** : Recherche par nom → ID numérique

---

## 🎯 **Légende des Couleurs**

| Couleur | Signification | Description |
|---------|---------------|-------------|
| ✅ **MUST HAVE** | Obligatoire | Paramètre obligatoire |
| 🟡 **Nice to have** | Optionnel | Paramètre optionnel permettant des fonctionnalités |
| 🔵 **System** | Calculé | Paramètre calculé par le système ou hérité |
| 🔵 **System (IA)** | IA Konatus | Paramètre calculé par l'IA Konatus |
| ⚫ **Automatique** | Index | Index des tables |

---

*Document généré le : $(date)*
*Version : 1.0*
