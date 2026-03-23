/**
 * 🚀 SMART WORK ITEM MOVER - VERSION SIMPLE
 * Système intelligent qui organise les work items par projet sur une board vide
 * 
 * Fonctionnalités:
 * - Détection automatique des projets basée sur les préfixes des noms
 * - Organisation en rangées horizontales par projet
 * - Tri par start_date_test à l'intérieur de chaque projet
 * - Placement simple de gauche à droite, haut en bas
 */

const axios = require('axios');

class SmartWorkItemMoverSimple {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/api`;

        // Configuration des dimensions
        this.CARD_WIDTH = 310;
        this.CARD_HEIGHT = 300;
        this.HORIZONTAL_GAP = 75;     // Espacement horizontal entre cartes
        this.VERTICAL_GAP = 100;      // Espacement vertical entre projets
        this.START_X = 100;           // Position X de départ
        this.START_Y = 100;           // Position Y de départ
        this.BASE_Z_INDEX = 100;      // Z-index de base
    }

    /**
     * Récupère les données de la board
     */
    async getBoardData(worldId, boardId) {
        try {
            const response = await axios.get(`${this.apiUrl}/board-io`, {
                params: { worldId, boardId },
                headers: {
                    'User-Agent': 'SmartWorkItemMoverSimple/1.0',
                    'x-forwarded-email': 'alupin@visual.world',
                    'x-forwarded-access-token': 'dummy-token-for-dev'
                }
            });
            return response.data.VW;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données:', error.message);
            throw error;
        }
    }

    /**
     * Parse une date au format DD/MM/YYYY ou YYYY-MM-DD
     */
    parseDate(dateString) {
        if (!dateString) return null;

        // Vérifier que dateString est bien une chaîne de caractères
        if (typeof dateString !== 'string') {
            dateString = String(dateString);
        }

        // Format DD/MM/YYYY
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            return new Date(year, month - 1, day);
        }
        // Format YYYY-MM-DD
        else if (dateString.includes('-')) {
            return new Date(dateString);
        }

        return null;
    }

    /**
     * Détecte automatiquement les projets basés sur les préfixes des noms
     */
    detectProjects(workItems) {
        const projects = {};

        workItems.forEach(workItem => {
            const name = workItem.object.data.name;

            // Extraire le préfixe du projet
            let projectPrefix = name;

            // Pattern 1: Rep9, Rep7, Fid31, FF27, L1-13 (lettres suivies de chiffres ou tiret)
            // Extraire uniquement la partie lettres avant les chiffres ou le tiret
            const matchLetters = name.match(/^([A-Za-z]+)/);
            if (matchLetters) {
                projectPrefix = matchLetters[1];
            }
            // Pattern 2: FF.24, Fid.29 (préfixe avant le point)
            else if (name.includes('.')) {
                projectPrefix = name.split('.')[0];
            }
            // Pattern 3: "nouveau programme", "Nv program" (premiers mots)
            else if (name.includes(' ')) {
                const words = name.split(' ');
                if (words.length >= 2) {
                    projectPrefix = words[0] + ' ' + words[1];
                } else {
                    projectPrefix = words[0];
                }
            }

            // Normaliser le préfixe
            projectPrefix = projectPrefix.trim().toUpperCase();

            if (!projects[projectPrefix]) {
                projects[projectPrefix] = {
                    name: projectPrefix,
                    items: []
                };
            }

            projects[projectPrefix].items.push(workItem);
        });

        // Trier les items par start_date_test (ou start_date si start_date_test n'existe pas)
        Object.values(projects).forEach(project => {
            project.items.sort((a, b) => {
                const dateStrA = a.object.data.start_date_test || a.object.data.start_date;
                const dateStrB = b.object.data.start_date_test || b.object.data.start_date;

                const dateA = this.parseDate(dateStrA);
                const dateB = this.parseDate(dateStrB);

                if (dateA && dateB) {
                    const diff = dateA - dateB;
                    if (diff !== 0) return diff;
                    return 0;
                }
                if (dateA && !dateB) return -1;
                if (!dateA && dateB) return 1;

                return 0;
            });
        });

        // Trier les projets par ordre alphabétique
        const sortedProjects = {};
        Object.keys(projects).sort().forEach(key => {
            sortedProjects[key] = projects[key];
        });

        return sortedProjects;
    }

    /**
     * Trouve tous les work items
     */
    findWorkItems(objects) {
        return objects.filter(obj =>
            obj.object.data.name &&
            obj.object.data.name.trim() !== ''
        );
    }

    /**
     * Déplace un work item vers sa nouvelle position
     */
    async moveWorkItem(positionId, newPosition) {
        try {
            const response = await axios.put(`${this.apiUrl}/position-update`, {
                document: [{
                    _id: positionId,
                    data: {
                        top: newPosition.top,
                        left: newPosition.left,
                        width: newPosition.width,
                        height: newPosition.height,
                        zIndex: newPosition.zIndex,
                        rotation: 0
                    },
                    protect: {
                        isBackground: false
                    }
                }]
            }, {
                params: {
                    worldId: this.worldId,
                    boardId: this.boardId
                },
                headers: {
                    'User-Agent': 'SmartWorkItemMoverSimple/1.0',
                    'x-forwarded-email': 'alupin@visual.world',
                    'x-forwarded-access-token': 'dummy-token-for-dev'
                }
            });

            return response.data;
        } catch (error) {
            console.error(`❌ Erreur lors du déplacement de ${positionId}:`, error.message);
            throw error;
        }
    }

    /**
     * 🎯 FONCTION PRINCIPALE : Organise par projet en rangées horizontales
     */
    async organizeWorkItems(worldId, boardId) {
        this.worldId = worldId;
        this.boardId = boardId;

        console.log('🚀 Démarrage de l\'organisation simple par projet...\n');

        try {
            // 1. Récupérer les données
            console.log('📊 Récupération des données de la board...');
            const boardData = await this.getBoardData(worldId, boardId);

            // 2. Trouver les work items
            console.log('📋 Recherche des work items...');
            const workItems = this.findWorkItems(boardData.objects);
            console.log(`   ✅ ${workItems.length} work items trouvés`);

            // 3. Détecter les projets automatiquement
            console.log('\n🎯 Détection automatique des projets...');
            const projects = this.detectProjects(workItems);

            console.log('\n🏷️  PROJETS DÉTECTÉS:');
            Object.entries(projects).forEach(([projectName, project]) => {
                console.log(`   📦 ${projectName}: ${project.items.length} items`);
            });

            // 4. Organiser les work items projet par projet
            const results = [];
            let currentY = this.START_Y;
            let globalItemIndex = 0;

            for (const [projectName, project] of Object.entries(projects)) {
                console.log(`\n🎯 Organisation du projet: ${projectName} (${project.items.length} items)`);

                // Placer les items de gauche à droite
                let currentX = this.START_X;

                for (let i = 0; i < project.items.length; i++) {
                    const item = project.items[i];
                    const { name, start_date_test, start_date } = item.object.data;
                    const displayDate = start_date_test || start_date;

                    const newPosition = {
                        top: currentY,
                        left: currentX,
                        width: this.CARD_WIDTH,
                        height: this.CARD_HEIGHT,
                        zIndex: this.BASE_Z_INDEX + globalItemIndex
                    };

                    console.log(`   📌 "${name}"`);
                    if (displayDate) {
                        console.log(`      🗓️  ${displayDate}`);
                    }
                    console.log(`      📍 Position ${i + 1}/${project.items.length}: (${Math.round(newPosition.left)}, ${Math.round(newPosition.top)})`);

                    // Déplacer l'item
                    const result = await this.moveWorkItem(item.positionId, newPosition);

                    if (result.success) {
                        results.push({
                            name,
                            project: projectName,
                            cardIndex: i,
                            oldPosition: {
                                top: item.position.data.top,
                                left: item.position.data.left
                            },
                            newPosition: {
                                top: newPosition.top,
                                left: newPosition.left
                            }
                        });
                        console.log('      ✅ Déplacé avec succès');
                    } else {
                        console.log('      ❌ Échec du déplacement');
                    }

                    // Passer à la position suivante (droite)
                    currentX += this.CARD_WIDTH + this.HORIZONTAL_GAP;
                    globalItemIndex++;

                    // Petit délai pour ne pas surcharger l'API
                    await new Promise(resolve => setTimeout(resolve, 150));
                }

                // Passer au projet suivant (nouvelle rangée en dessous)
                currentY += this.CARD_HEIGHT + this.VERTICAL_GAP;
            }

            // 5. Résumé des résultats
            console.log('\n🎉 ORGANISATION TERMINÉE !');
            console.log(`📊 ${results.length} work items organisés`);

            const projectStats = {};
            results.forEach(result => {
                if (!projectStats[result.project]) {
                    projectStats[result.project] = 0;
                }
                projectStats[result.project]++;
            });

            console.log('\n📈 STATISTIQUES PAR PROJET:');
            Object.entries(projectStats).forEach(([project, count]) => {
                console.log(`   🎯 ${project}: ${count} items`);
            });

            return results;

        } catch (error) {
            console.error('💥 Erreur lors de l\'organisation:', error.message);
            throw error;
        }
    }

    /**
     * Affiche un résumé avec détection des projets
     */
    async displayProjectSummary(worldId, boardId) {
        console.log('📊 RÉSUMÉ DES PROJETS\n');

        const boardData = await this.getBoardData(worldId, boardId);
        const workItems = this.findWorkItems(boardData.objects);
        const projects = this.detectProjects(workItems);

        console.log('🎯 PROJETS DÉTECTÉS:');
        Object.entries(projects).forEach(([projectName, project]) => {
            console.log(`\n  📦 Projet: ${projectName}`);
            console.log(`     Items: ${project.items.length}`);

            // Afficher quelques exemples d'items
            const examples = project.items.slice(0, 3).map(item => item.object.data.name);
            console.log(`     Exemples: ${examples.join(', ')}${project.items.length > 3 ? '...' : ''}`);
        });

        console.log(`\n📈 RÉSUMÉ GLOBAL:`);
        console.log(`   Total projets: ${Object.keys(projects).length}`);
        console.log(`   Total work items: ${workItems.length}`);
    }
}

module.exports = SmartWorkItemMoverSimple;

