# Guide de compilation du programme d'optimisation

## Prérequis

- **Compilateur C++** : g++ version 7.0 ou supérieure (support C++17)
- **Système d'exploitation** : Linux

Vérifier la version de g++ :
```bash
g++ --version
```

## Compilation

### Méthode 1 : Utiliser le Makefile (recommandé)

```bash
cd /root/visualworld-main/optimization_code_vw
make
```

Cela va :
1. Créer les répertoires nécessaires (`obj/`, `Output/`, `log/`)
2. Compiler tous les fichiers source
3. Créer l'exécutable `Programme`

### Méthode 2 : Compilation manuelle

Si vous préférez compiler manuellement :

```bash
cd /root/visualworld-main/optimization_code_vw
mkdir -p obj Output log

# Compilation de tous les fichiers
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c AbstractGeneticAlgo.cpp -o obj/AbstractGeneticAlgo.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Commun.cpp -o obj/Commun.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Data.cpp -o obj/Data.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c DateUtils.cpp -o obj/DateUtils.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c GeneticAlgo.cpp -o obj/GeneticAlgo.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c GeneticAlgo_Nokia.cpp -o obj/GeneticAlgo_Nokia.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Logger.cpp -o obj/Logger.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Parameters.cpp -o obj/Parameters.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c main.cpp -o obj/main.o

# Édition de liens
g++ obj/*.o -o Programme -pthread
```

## Options de compilation

Le Makefile utilise les options suivantes :
- `-std=c++17` : Standard C++17 (nécessaire pour éviter les erreurs de compilation)
- `-Wall -Wextra` : Affiche tous les avertissements
- `-O2` : Optimisation niveau 2
- `-pthread` : Support des threads POSIX

## Commandes utiles

### Nettoyage
```bash
make clean        # Supprime les fichiers objets et l'exécutable
make distclean    # Supprime tout (objets, exécutable, répertoires de sortie)
```

### Recompilation
```bash
make re          # Nettoie et recompile depuis le début
```

### Aide
```bash
make help        # Affiche l'aide du Makefile
```

## Exécution

Une fois compilé, vous pouvez exécuter le programme :

```bash
./Programme [options]
```

Pour voir les options disponibles :
```bash
./Programme --help
```

## Corrections apportées pour C++17

Les fichiers suivants ont été corrigés pour être compatibles avec C++17 :

1. **Suppression des spécifications d'exceptions dynamiques** (`throw(const char*)`) :
   - `Data.h` et `Data.cpp`
   - `Parameters.h` et `Parameters.cpp`
   - `AbstractGeneticAlgo.h`
   - `main.cpp`

2. **Résolution du conflit avec `std::sample`** :
   - Ajout du namespace `commun` dans `Commun.h`
   - Remplacement de `sample&` par `commun::sample&` dans `AbstractGeneticAlgo.h` et `AbstractGeneticAlgo.cpp`

## Dépannage

### Erreur : "g++: command not found"
Installez g++ :
```bash
sudo apt-get update
sudo apt-get install g++
```

### Erreur : "error: ISO C++17 does not allow dynamic exception specifications"
Vérifiez que tous les fichiers ont été corrigés (voir section "Corrections apportées").

### Erreur : "reference to 'sample' is ambiguous"
Vérifiez que le namespace `commun` est bien utilisé partout où `sample` est référencé.

## Structure des répertoires

```
optimization_code_vw/
├── Makefile              # Fichier de compilation
├── Programme             # Exécutable (après compilation)
├── obj/                  # Fichiers objets (.o)
├── Output/               # Fichiers de sortie
├── log/                 # Fichiers de log
├── Input/               # Fichiers d'entrée
└── *.cpp, *.h          # Fichiers source
```

