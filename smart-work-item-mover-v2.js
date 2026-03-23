/**
 * 🚀 SMART WORK ITEM MOVER V2 - VERSION GRADIN
 * Système intelligent de déplacement des work items avec positionnement en gradin
 * 
 * Nouvelles fonctionnalités V2:
 * - Positionnement en gradin (staircase layout)
 * - Tri par date d'échéance (due date)
 * - Espacement de 1K Feature entre les gradins
 * - Meilleur centrage dans les rectangles
 * - Gestion des itérations non trouvées (placement à côté des features)
 */

const axios = require('axios');

class SmartWorkItemMoverV2 {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/api`;
        this.FEATURE_SPACING = 1000; // Espacement de 1K Feature entre les gradins
    }

    /**
     * Récupère les données de la board
     */
    async getBoardData(worldId, boardId) {
        try {
            const response = await axios.get(`${this.apiUrl}/board-io`, {
                params: { worldId, boardId },
                headers: {
                    'User-Agent': 'SmartWorkItemMoverV2/2.0',
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
     * Analyse la structure de la board pour identifier les zones d'équipes
     */
    analyzeTeamZones(objects) {
        const teamZones = {};

        // Trouver les containers d'équipes (objets avec team, job mais sans name)
        const teamContainers = objects.filter(obj =>
            obj.object.data.team &&
            obj.object.data.job &&
            !obj.object.data.name
        );

        teamContainers.forEach(container => {
            const team = container.object.data.team;
            const iteration = container.object.data.iteration || 'default';

            if (!teamZones[team]) {
                teamZones[team] = {};
            }

            teamZones[team][iteration] = {
                positionId: container.positionId,
                top: container.position.data.top,
                left: container.position.data.left,
                width: container.position.data.width,
                height: container.position.data.height,
                zIndex: container.position.data.zIndex
            };
        });

        // Créer un mapping des équipes nommées vers les équipes numérotées
        this.teamMapping = this.createTeamMapping(teamZones);

        return teamZones;
    }

    /**
     * Crée un mapping intelligent entre les équipes nommées et numérotées
     */
    createTeamMapping(teamZones) {
        const mapping = {};

        // Mapping basé sur les patterns courants
        const teamPatterns = {
            'ac': '1',    // Architecture/Conception
            'ai': '1',    // Architecture/Infrastructure  
            'rc': '2',    // Recherche/Conception
            'sc': '2',    // Support/Conception
            'tt': '2',    // Test/Technique
            'dev': '1',   // Développement
            'test': '2',  // Test
            'ops': '2'    // Opérations
        };

        // Si on trouve des équipes numérotées, on les utilise comme base
        const numberedTeams = Object.keys(teamZones).filter(team => /^\d+$/.test(team));

        if (numberedTeams.length > 0) {
            // Créer un mapping basé sur l'ordre alphabétique des équipes nommées
            const namedTeams = Object.keys(teamZones).filter(team => !/^\d+$/.test(team));
            namedTeams.sort().forEach((team, index) => {
                if (numberedTeams[index]) {
                    mapping[team] = numberedTeams[index];
                }
            });
        }

        // Ajouter les patterns prédéfinis
        Object.assign(mapping, teamPatterns);

        console.log('🗺️  Mapping des équipes:', mapping);
        return mapping;
    }

    /**
     * Trouve les work items (objets avec un nom) et les trie par due date
     */
    findWorkItems(objects) {
        const workItems = objects.filter(obj =>
            obj.object.data.name &&
            obj.object.data.team &&
            obj.object.data.name.trim() !== ''
        );

        // Trier par due date (les items sans due date vont à la fin)
        return workItems.sort((a, b) => {
            const dueDateA = a.object.data.dueDate;
            const dueDateB = b.object.data.dueDate;

            // Si les deux ont une due date, trier par date
            if (dueDateA && dueDateB) {
                return new Date(dueDateA) - new Date(dueDateB);
            }

            // Si seulement A a une due date, A vient en premier
            if (dueDateA && !dueDateB) return -1;

            // Si seulement B a une due date, B vient en premier
            if (!dueDateA && dueDateB) return 1;

            // Si aucun n'a de due date, trier par nom
            return (a.object.data.name || '').localeCompare(b.object.data.name || '');
        });
    }

    /**
     * Calcule la position en gradin pour un work item dans sa zone d'équipe
     * Chaque gradin est décalé de 1K Feature vers la droite et vers le bas
     */
    calculateStaircasePosition(workItem, teamZone, existingItems, itemIndex) {
        const { top, left, width, height } = teamZone;

        // Dimensions d'un work item (standard)
        const itemWidth = 310;
        const itemHeight = 300;

        // Marges pour le centrage amélioré
        const marginX = 30;
        const marginY = 30;

        // Calculer le nombre d'items par gradin (moins d'items par ligne pour l'effet gradin)
        const itemsPerStair = Math.max(1, Math.floor((width - marginX * 2) / (itemWidth + marginX)) - 1);

        // Calculer sur quel gradin se trouve cet item
        const stairLevel = Math.floor(itemIndex / itemsPerStair);
        const positionInStair = itemIndex % itemsPerStair;

        // Décalage en gradin : chaque niveau est décalé de FEATURE_SPACING pixels
        const stairOffsetX = stairLevel * (this.FEATURE_SPACING / 10); // Réduire le décalage pour qu'il reste dans la zone
        const stairOffsetY = stairLevel * (this.FEATURE_SPACING / 20); // Décalage vertical plus petit

        // Centrage amélioré dans le rectangle
        const availableWidth = width - (marginX * 2);
        const totalItemsWidth = Math.min(itemsPerStair, itemsPerStair) * itemWidth + (Math.min(itemsPerStair, itemsPerStair) - 1) * marginX;
        const centerOffsetX = Math.max(0, (availableWidth - totalItemsWidth) / 2);

        // Position finale avec centrage et effet gradin
        const finalLeft = left + marginX + centerOffsetX + (positionInStair * (itemWidth + marginX)) + stairOffsetX;
        const finalTop = top + marginY + stairOffsetY;

        // S'assurer que l'item reste dans les limites de la zone
        const boundedLeft = Math.max(left + marginX, Math.min(finalLeft, left + width - itemWidth - marginX));
        const boundedTop = Math.max(top + marginY, Math.min(finalTop, top + height - itemHeight - marginY));

        return {
            top: boundedTop,
            left: boundedLeft,
            width: itemWidth,
            height: itemHeight,
            zIndex: teamZone.zIndex + 1 + stairLevel // Z-index plus élevé pour les gradins supérieurs
        };
    }

    /**
     * Calcule la position pour les itérations non trouvées (à côté des features)
     */
    calculateMissingIterationPosition(workItem, teamZones, itemIndex) {
        // Trouver la zone la plus à droite pour placer les items "orphelins"
        let rightmostZone = null;
        let maxRight = 0;

        Object.values(teamZones).forEach(iterations => {
            Object.values(iterations).forEach(zone => {
                const zoneRight = zone.left + zone.width;
                if (zoneRight > maxRight) {
                    maxRight = zoneRight;
                    rightmostZone = zone;
                }
            });
        });

        if (!rightmostZone) {
            // Position par défaut si aucune zone n'est trouvée
            return {
                top: 100,
                left: 100,
                width: 310,
                height: 300,
                zIndex: 1000
            };
        }

        // Placer les items orphelins à droite de la zone la plus à droite
        const orphanMargin = 50;
        const itemWidth = 310;
        const itemHeight = 300;
        const itemSpacing = 20;

        return {
            top: rightmostZone.top + (itemIndex * (itemHeight + itemSpacing)),
            left: maxRight + orphanMargin,
            width: itemWidth,
            height: itemHeight,
            zIndex: rightmostZone.zIndex + 1
        };
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
                    'User-Agent': 'SmartWorkItemMoverV2/2.0',
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
     * 🎯 FONCTION PRINCIPALE V2 : Organise intelligemment tous les work items en gradin
     */
    async organizeWorkItems(worldId, boardId) {
        this.worldId = worldId;
        this.boardId = boardId;

        console.log('🚀 Démarrage de l\'organisation intelligente V2 (gradin) des work items...\n');

        try {
            // 1. Récupérer les données de la board
            console.log('📊 Récupération des données de la board...');
            const boardData = await this.getBoardData(worldId, boardId);

            // 2. Analyser les zones d'équipes
            console.log('🔍 Analyse des zones d\'équipes...');
            const teamZones = this.analyzeTeamZones(boardData.objects);
            console.log('Zones d\'équipes trouvées:', Object.keys(teamZones));

            // 3. Trouver et trier les work items par due date
            console.log('📋 Recherche et tri des work items par due date...');
            const workItems = this.findWorkItems(boardData.objects);
            console.log(`${workItems.length} work items trouvés et triés`);

            // 4. Grouper les work items par équipe et itération
            const groupedItems = {};
            const orphanItems = [];

            workItems.forEach((workItem, globalIndex) => {
                const { team, iteration, name, dueDate } = workItem.object.data;
                const normalizedIteration = iteration || 'default';
                const mappedTeam = this.teamMapping[team] || team;

                // Vérifier si la zone d'équipe existe
                if (teamZones[mappedTeam] && teamZones[mappedTeam][normalizedIteration]) {
                    if (!groupedItems[mappedTeam]) {
                        groupedItems[mappedTeam] = {};
                    }
                    if (!groupedItems[mappedTeam][normalizedIteration]) {
                        groupedItems[mappedTeam][normalizedIteration] = [];
                    }
                    groupedItems[mappedTeam][normalizedIteration].push({
                        workItem,
                        globalIndex,
                        dueDate: dueDate || null
                    });
                } else {
                    // Item orphelin (itération non trouvée)
                    orphanItems.push({
                        workItem,
                        globalIndex,
                        team: mappedTeam,
                        iteration: normalizedIteration,
                        dueDate: dueDate || null
                    });
                    console.log(`🏠 Item orphelin: "${name}" (Équipe: ${team} -> ${mappedTeam}, Itération: ${normalizedIteration})`);
                }
            });

            // 5. Organiser chaque groupe en gradin
            const results = [];
            let totalMoved = 0;

            for (const [team, iterations] of Object.entries(groupedItems)) {
                for (const [iteration, items] of Object.entries(iterations)) {
                    console.log(`\n🏗️  Organisation en gradin - Équipe ${team}, Itération ${iteration} (${items.length} items)`);

                    const teamZone = teamZones[team][iteration];

                    for (let i = 0; i < items.length; i++) {
                        const { workItem } = items[i];
                        const { name, dueDate } = workItem.object.data;
                        const positionId = workItem.positionId;

                        console.log(`\n🎯 Traitement "${name}" (${i + 1}/${items.length})`);
                        if (dueDate) {
                            console.log(`📅 Due date: ${new Date(dueDate).toLocaleDateString('fr-FR')}`);
                        }

                        // Calculer la position en gradin
                        const newPosition = this.calculateStaircasePosition(
                            workItem.object.data,
                            teamZone,
                            items,
                            i
                        );

                        // Déplacer l'item
                        console.log(`📦 Déplacement gradin ${Math.floor(i / 2) + 1}: top=${Math.round(newPosition.top)}, left=${Math.round(newPosition.left)}`);
                        const result = await this.moveWorkItem(positionId, newPosition);

                        if (result.success) {
                            totalMoved++;
                            results.push({
                                name,
                                team,
                                iteration,
                                dueDate,
                                stairLevel: Math.floor(i / 2) + 1,
                                oldPosition: {
                                    top: workItem.position.data.top,
                                    left: workItem.position.data.left
                                },
                                newPosition: {
                                    top: newPosition.top,
                                    left: newPosition.left
                                }
                            });
                            console.log('✅ Déplacé avec succès');
                        } else {
                            console.log('❌ Échec du déplacement');
                        }

                        // Pause pour éviter de surcharger l'API
                        await new Promise(resolve => setTimeout(resolve, 150));
                    }
                }
            }

            // 6. Traiter les items orphelins (itérations non trouvées)
            if (orphanItems.length > 0) {
                console.log(`\n🏠 Traitement des ${orphanItems.length} items orphelins...`);

                for (let i = 0; i < orphanItems.length; i++) {
                    const { workItem, team, iteration } = orphanItems[i];
                    const { name } = workItem.object.data;
                    const positionId = workItem.positionId;

                    console.log(`\n🏠 Placement orphelin "${name}" (${team}/${iteration})`);

                    // Calculer la position pour les orphelins
                    const newPosition = this.calculateMissingIterationPosition(
                        workItem.object.data,
                        teamZones,
                        i
                    );

                    // Déplacer l'item orphelin
                    console.log(`📦 Déplacement orphelin: top=${Math.round(newPosition.top)}, left=${Math.round(newPosition.left)}`);
                    const result = await this.moveWorkItem(positionId, newPosition);

                    if (result.success) {
                        totalMoved++;
                        results.push({
                            name,
                            team,
                            iteration,
                            isOrphan: true,
                            oldPosition: {
                                top: workItem.position.data.top,
                                left: workItem.position.data.left
                            },
                            newPosition: {
                                top: newPosition.top,
                                left: newPosition.left
                            }
                        });
                        console.log('✅ Orphelin placé avec succès');
                    } else {
                        console.log('❌ Échec du placement orphelin');
                    }

                    // Pause pour éviter de surcharger l'API
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }

            // 7. Résumé des résultats
            console.log('\n🎉 ORGANISATION EN GRADIN TERMINÉE !');
            console.log(`📊 ${totalMoved} work items organisés`);
            console.log(`🏗️  ${results.filter(r => !r.isOrphan).length} items en gradin`);
            console.log(`🏠 ${results.filter(r => r.isOrphan).length} items orphelins placés`);

            // Affichage détaillé des résultats
            const groupedResults = {};
            results.forEach(result => {
                if (result.isOrphan) {
                    if (!groupedResults['ORPHELINS']) {
                        groupedResults['ORPHELINS'] = [];
                    }
                    groupedResults['ORPHELINS'].push(result);
                } else {
                    const key = `${result.team}/${result.iteration}`;
                    if (!groupedResults[key]) {
                        groupedResults[key] = [];
                    }
                    groupedResults[key].push(result);
                }
            });

            Object.entries(groupedResults).forEach(([group, items]) => {
                console.log(`\n📦 ${group}:`);
                items.forEach(result => {
                    if (result.isOrphan) {
                        console.log(`   🏠 ${result.name} (orphelin)`);
                    } else {
                        console.log(`   🏗️  ${result.name} (gradin ${result.stairLevel})`);
                        if (result.dueDate) {
                            console.log(`      📅 Due: ${new Date(result.dueDate).toLocaleDateString('fr-FR')}`);
                        }
                    }
                    console.log(`      📍 (${Math.round(result.oldPosition.left)}, ${Math.round(result.oldPosition.top)}) → (${Math.round(result.newPosition.left)}, ${Math.round(result.newPosition.top)})`);
                });
            });

            return results;

        } catch (error) {
            console.error('💥 Erreur lors de l\'organisation V2:', error.message);
            throw error;
        }
    }

    /**
     * 🎨 FONCTION BONUS : Affiche un résumé visuel de la board V2
     */
    async displayBoardSummary(worldId, boardId) {
        console.log('📊 RÉSUMÉ DE LA BOARD V2\n');

        const boardData = await this.getBoardData(worldId, boardId);
        const teamZones = this.analyzeTeamZones(boardData.objects);
        const workItems = this.findWorkItems(boardData.objects);

        console.log('🏢 ZONES D\'ÉQUIPES:');
        Object.entries(teamZones).forEach(([team, iterations]) => {
            console.log(`\n  Équipe ${team}:`);
            Object.entries(iterations).forEach(([iteration, zone]) => {
                console.log(`    Itération ${iteration}: (${zone.left}, ${zone.top}) - ${zone.width}x${zone.height}`);
            });
        });

        console.log('\n📋 WORK ITEMS (triés par due date):');
        workItems.forEach((item, index) => {
            const { name, team, iteration, dueDate } = item.object.data;
            const { top, left } = item.position.data;
            const dueDateStr = dueDate ? ` [Due: ${new Date(dueDate).toLocaleDateString('fr-FR')}]` : ' [Pas de due date]';
            console.log(`  ${index + 1}. ${name}: Équipe ${team}, Itération ${iteration}${dueDateStr} - Position (${left}, ${top})`);
        });

        console.log(`\n📈 STATISTIQUES:`);
        console.log(`   Total work items: ${workItems.length}`);
        console.log(`   Items avec due date: ${workItems.filter(item => item.object.data.dueDate).length}`);
        console.log(`   Équipes trouvées: ${Object.keys(teamZones).length}`);

        const totalIterations = Object.values(teamZones).reduce((sum, iterations) => sum + Object.keys(iterations).length, 0);
        console.log(`   Total itérations: ${totalIterations}`);
    }
}

// 🚀 EXEMPLE D'UTILISATION V2
async function main() {
    const mover = new SmartWorkItemMoverV2();

    const worldId = '68932ca97baa671b9427c55f';
    const boardId = '68eff5caa686e9736c5a6e28';

    try {
        // Afficher le résumé avant organisation
        await mover.displayBoardSummary(worldId, boardId);

        // Organiser les work items en gradin
        await mover.organizeWorkItems(worldId, boardId);

    } catch (error) {
        console.error('💥 Erreur:', error.message);
    }
}

// Exporter pour utilisation
module.exports = SmartWorkItemMoverV2;

// Exécuter si appelé directement
if (require.main === module) {
    main();
}
