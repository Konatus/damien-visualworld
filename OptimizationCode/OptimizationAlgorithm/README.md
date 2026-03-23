
# Résumé du programme ProManOrd

Le programme ProManOrd est un outil d'aide à la décision à utiliser dans le cadre de la gestion de projets. Il permet de fournir une solution à différentes variantes d'un problème d'ordonnancement de taches de multiple projets sous contraintes de ressources. Plusieurs fonctions d'évaluation sont proposées : **(i)** le non-respect des dates de rendu et deadlines, **(ii)** l'inactivité des ressources, **(iii)** la date de fin, **(iv)** la durée des projets ou lots et, **(v)** le coût des ressources. Dans la version actuelle du programme, 3 versions sont proposées : \textbf{(i)} classique (bases 6, 7.2 et 7.4) : Classe *GeneticAlgo*, **(ii)** avec skillset (bases 7.1 et 7.3 mais non testé pour le moment) : Classe *GeneticAlgoSkills* et, **(iii)** problème Nokia (base nokia) : Classe *GeneticAlgo\_Nokia*. 

A noter que la version avec skillset n'a pas encore été testée sur les bases 7.1 et 7.3 mais un problème potentiel a déjà été identifié pour les niveaux max et étendu: les affectations se font par équipes dans la base et non par personne de l'équipe. Il y a donc un total par skillset mais pour chaque équipe mais ça laisse supposer que n'importe qui peut faire n'importe quel skillset une fois les données lues. Il faudrait donc bien penser à mettre dans les bases qu'une activité requiert tous les skillsets que la personne affectée est capable de faire, afin d'éviter qu'elle soit affectée ailleurs sur un autre skillset en parallèle.

# Installation et compilation

Le programme est directement utilisable sous Windows sous la forme d'un exécutable disponible à *x64/Release/Programme.exe*.
L'exécutable est déjà existant au départ, il n'est donc pas obligatoire de compiler le code. Cela peut toutefois être nécessaire en cas de modification des codes sources. Dans ce cas, il faut donc télécharger tous les codes sources (fichiers .h et .cpp).

* **Sous Windows** : Un projet Visual Studio est déjà existant (fichier Programme.vcxproj) mais n'importe quel éditeur de code C++ fait l'affaire, il faut simplement récréer un projet faisant le lien entre les différents fichiers C++.
* **Sous Linux** : Un fichier Makefile peut permettre de faire le lien entre les différents fichiers C++ et la compilation et l'exécutations peuvent après se faire directement en ligne de commande. Sinon des IDE existent aussi sous Linux.

# Utilisation

Le programme est directement utilisable sous Windows sous la forme d'un exécutable disponible à *x64/Release/Programme.exe*. On peut le lancer en double-cliquant dessus mais il va alors utiliser les paramètres actuels (y compris les fichiers d'entrée et de sortie). Il peut aussi être appelé dans un fichier .bat, par exemple, contenant le nom de l'exécutable et, **(i)** soit la liste de paramètres à mettre à la suite, **(ii)** soit le chemin vers un fichier contenant toute la configuration voulue. La 2ème option est celle qui permet de passer plus facilement d'une configuration à une autre sans avoir à tout réécrire.

Pour plus de détails sur l'utilisation et la modification du programme, se référer à la documentation du programme.
