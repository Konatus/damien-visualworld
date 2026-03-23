# Corrections appliquées pour la compatibilité C++17

## Résumé des corrections

Tous les fichiers ont été corrigés pour être compatibles avec C++17. La compilation réussit maintenant sans erreurs.

## Fichiers corrigés

### 1. **Data.h** et **Data.cpp**
- ✅ Suppression de toutes les spécifications d'exceptions `throw(const char*)` (10 fonctions)

### 2. **Parameters.h** et **Parameters.cpp**
- ✅ Suppression de toutes les spécifications d'exceptions `throw(const char*)` (2 fonctions)

### 3. **AbstractGeneticAlgo.h** et **AbstractGeneticAlgo.cpp**
- ✅ Suppression de toutes les spécifications d'exceptions `throw(const char*)` (5 fonctions)
- ✅ Remplacement de `sample&` par `commun::sample&` (10 occurrences)
- ✅ Suppression du typedef local `sample_vector`

### 4. **main.cpp**
- ✅ Suppression de toutes les spécifications d'exceptions `throw(const char*)` (3 fonctions)

### 5. **Commun.h** et **Commun.cpp**
- ✅ Ajout du namespace `commun` pour encapsuler le typedef `sample` (évite le conflit avec `std::sample`)
- ✅ Remplacement de `__stdcall` par `STDCALL` dans `myStrcmp()` (compatibilité Linux)

### 6. **Logger.h** et **Logger.cpp**
- ✅ Remplacement de `throw()` par `noexcept` dans `getM_File()`

### 7. **GeneticAlgo.cpp** et **GeneticAlgo_Nokia.cpp**
- ✅ Remplacement de `sample` par `commun::sample` pour les variables locales

## Compilation

### Méthode recommandée : Makefile

```bash
cd /root/visualworld/optimization_code_vw
make
```

### Méthode manuelle

```bash
cd /root/visualworld/optimization_code_vw
mkdir -p obj Output log

g++ -std=c++17 -Wall -Wextra -O2 -pthread -c AbstractGeneticAlgo.cpp -o obj/AbstractGeneticAlgo.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Commun.cpp -o obj/Commun.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Data.cpp -o obj/Data.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c DateUtils.cpp -o obj/DateUtils.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c GeneticAlgo.cpp -o obj/GeneticAlgo.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c GeneticAlgo_Nokia.cpp -o obj/GeneticAlgo_Nokia.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Logger.cpp -o obj/Logger.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c Parameters.cpp -o obj/Parameters.o
g++ -std=c++17 -Wall -Wextra -O2 -pthread -c main.cpp -o obj/main.o

g++ obj/*.o -o Programme -pthread
```

## Exécution

```bash
./Programme [options]
```

Pour voir les options disponibles :
```bash
./Programme --help
```

## Notes

- Les warnings affichés lors de la compilation sont normaux et n'empêchent pas l'exécution
- Le code est maintenant compatible avec C++17
- Tous les conflits avec `std::sample` ont été résolus via le namespace `commun`

