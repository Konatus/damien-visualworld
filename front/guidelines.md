# Guidelines

## Organisation des répertoires

	visual-world/front/src
	├─assets
	├─components
	├─conf
	├─stores
	├─utils
	└─views

**E.1> Les fichiers source doivent être placés dans le répertoire `src`.**

**E-1.1> Les fichiers statiques doivent être placés dans `src/assets`.**  
Exemple : icône, thème css.

**E-1.2> Les fichiers de paramétrages doivent être placés dans `src/conf`.**  
Exemple : libellés, taille du mur.

**E-1.3> Les fichiers de fonctions partagées doivent être placés dans `src/utils`.**  
Exemple : gestion des clics longs, parser CSS.

**E-1.4> Les fichiers utilisés par le routeur doivent être placés dans `src/views`.**  
Exemple : worlds-in-univers, views-in-world, objects-in-view.

**E-1.5> Les fichiers de représentation des données doivent être placés dans des sous-répertoires de `src/components`.**  
Exemple : affichage d'objets sur un mur.

**E-1.6> Les fichiers d'accès aux données doivent être placés dans des sous-répertoires de `src/store`.**  
Exemple : récupération des vues d'un monde.

## Nommage des fichiers de code

**E-2> Le nom des fichiers de code doit respecter le kebab-case.**

**E-2.1> Les fichiers de représentation des données doivent avoir une extension "vue".**  
Exemple : `layer-2d.vue`, `position-2d-drag.vue`.

**E-2.1.1> Le nom des fichiers utilisés comme component doit être identique à celui du répertoire qui les contient.**  
Exemple : `layer-2d/layer-2d.vue`.

**E-2.1.2> Le nom des fichiers utilisés comme mixin doit commencer comme celui du répertoire qui les contient.**  
Exemple : `layer-2d/layer-2d-multiple-drag.vue`

**E-2.2> Les fichiers d'accès aux données doivent avoir une extension "js".**  
Exemple : `components-of-view.js`, `positions.js`

## Contenu des fichiers "view"

**E-3> Les fichiers "view" doivent importer des fichiers de représentation et définir quels modules d'accès aux données utiliser.**  
Cette règle permet la réunion au plus haut niveau de fonctions de natures différentes (modèle de données et visualisation).

**E-3.1> Les fichiers "view" doivent utiliser les fichiers de représentation des données comme component.**

**E-3.2> Les fichiers "view" doivent injecter un objet $view pouvant précis les modules de Vuex à utiliser.**

(i) Les components de visualisation contiennent par essence des templates et doivent être traités comme tels, alors que les accès aux données relèvent de la partie script pour le traitement.

## Contenu des fichiers d'accès aux données

**E-4> Les fichiers doivent ne pas importer d'autres fichiers que d'autres modules de Vuex ou des utils.**

## Contenu des fichiers de component

**E-5.1> Les fichiers "component" peuvent importer d'autres fichiers de même type.** 

**E-5.2> Les fichiers "component" peuvent importer des fichiers mixin.** 
Nota bene : uniquement des fichiers qui lui sont associés par les règles de nommage.

**E-5.3> Le nom de component doit reprendre le nom du fichier..**  
Exemple : `dock-templates` pour `dock-templates.vue`.

## Contenu des fichiers de mixin

**E-6.1> Les fichiers "mixin" ne doivent pas importer d'autre fichier. (sauf utils)** 
Nota bene : ce qui signifie qu'un mixin doit être un ensemble atomique instanciant une fonctionnalité.

**E-6.2> Le nom de mixin doit reprendre le nom du fichier.**  
Exemple : `dock-templates-drag` pour `dock-templates-drag.vue`.

**E-6.2> Les données et/ou méthodes publiques doivent être préfixées par `nomDuMixin_`.**  
Exemple : `dockTemplatesDrag_` pour `dock-templates-drag`.
