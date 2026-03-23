# Makefile pour compilation du programme d'optimisation
# Compatible C++17

# Compilateur et options
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -pthread
LDFLAGS = -pthread

# Nom de l'exécutable
TARGET = Programme

# Répertoires
SRCDIR = .
OBJDIR = obj
OUTDIR = Output
LOGDIR = log

# Fichiers sources
SOURCES = $(wildcard $(SRCDIR)/*.cpp)
OBJECTS = $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

# Règle par défaut
all: directories $(TARGET)

# Création des répertoires nécessaires
directories:
	@mkdir -p $(OBJDIR) $(OUTDIR) $(LOGDIR)

# Compilation de l'exécutable
$(TARGET): $(OBJECTS)
	$(CXX) $(OBJECTS) -o $(TARGET) $(LDFLAGS)
	@echo "Compilation réussie : $(TARGET)"

# Compilation des fichiers objets
$(OBJDIR)/%.o: $(SRCDIR)/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Nettoyage
clean:
	rm -rf $(OBJDIR) $(TARGET)
	@echo "Nettoyage effectué"

# Nettoyage complet (inclut les répertoires de sortie)
distclean: clean
	rm -rf $(OUTDIR) $(LOGDIR)
	@echo "Nettoyage complet effectué"

# Réinstallation
re: clean all

# Aide
help:
	@echo "Makefile pour compilation du programme d'optimisation"
	@echo ""
	@echo "Cibles disponibles :"
	@echo "  make          - Compile le programme"
	@echo "  make clean    - Supprime les fichiers objets et l'exécutable"
	@echo "  make distclean - Supprime tout (objets, exécutable, sorties)"
	@echo "  make re       - Recompile depuis le début"
	@echo "  make help     - Affiche cette aide"
	@echo ""
	@echo "Options de compilation :"
	@echo "  CXXFLAGS = $(CXXFLAGS)"

.PHONY: all clean distclean re help directories

