/**
 * 🚀 SMART WORK ITEM MOVER
 * Système intelligent de déplacement des work items selon l'équipe et l'itération
 * 
 * Ce script analyse une board Visual World et déplace automatiquement les work items
 * vers les bonnes zones d'équipe et d'itération.
 */

const axios = require('axios');

class SmartWorkItemMover {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/api`;
    }

    /**
     * Récupère les données de la board
     */
    async getBoardData(worldId, boardId) {
        try {
            const response = await axios.get(`${this.apiUrl}/board-io`, {
                params: { worldId, boardId },
                headers: {
                    'User-Agent': 'SmartWorkItemMover/1.0',
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
        // Note: iteration peut être null pour les zones d'équipes
        const teamContainers = objects.filter(obj =>
            obj.object.data.team &&
            obj.object.data.job &&
            !obj.object.data.name
        );

        teamContainers.forEach(container => {
            const team = container.object.data.team;
            const iteration = container.object.data.iteration || 'default'; // Utiliser 'default' si iteration est null

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
     * Trouve les work items (objets avec un nom)
     */
    findWorkItems(objects) {
        return objects.filter(obj =>
            obj.object.data.name &&
            obj.object.data.team &&
            obj.object.data.name.trim() !== ''
        );
    }

    /**
     * Calcule la position optimale pour un work item dans sa zone d'équipe
     */
    calculateOptimalPosition(workItem, teamZone, existingItems) {
        const { top, left, width, height } = teamZone;

        // Dimensions d'un work item (standard)
        const itemWidth = 310;
        const itemHeight = 300;

        // Marges
        const marginX = 20;
        const marginY = 20;

        // Calculer le nombre d'items par ligne
        const itemsPerRow = Math.floor((width - marginX) / (itemWidth + marginX));

        // Trouver la position dans la grille
        const existingInZone = existingItems.filter(item =>
            item.team === workItem.team &&
            (item.iteration || 'default') === (workItem.iteration || 'default')
        );

        const index = existingInZone.length;
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;

        return {
            top: top + marginY + (row * (itemHeight + marginY)),
            left: left + marginX + (col * (itemWidth + marginX)),
            width: itemWidth,
            height: itemHeight,
            zIndex: teamZone.zIndex + 1
        };
    }

    /**
     * Déplace un work item vers sa zone d'équipe et d'itération
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
                    'User-Agent': 'SmartWorkItemMover/1.0',
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
     * 🎯 FONCTION PRINCIPALE : Organise intelligemment tous les work items
     */
    async organizeWorkItems(worldId, boardId) {
        this.worldId = worldId;
        this.boardId = boardId;

        console.log('🚀 Démarrage de l\'organisation intelligente des work items...\n');

        try {
            // 1. Récupérer les données de la board
            console.log('📊 Récupération des données de la board...');
            const boardData = await this.getBoardData(worldId, boardId);

            // 2. Analyser les zones d'équipes
            console.log('🔍 Analyse des zones d\'équipes...');
            const teamZones = this.analyzeTeamZones(boardData.objects);
            console.log('Zones d\'équipes trouvées:', Object.keys(teamZones));

            // 3. Trouver les work items
            console.log('📋 Recherche des work items...');
            const workItems = this.findWorkItems(boardData.objects);
            console.log(`${workItems.length} work items trouvés`);

            // 4. Organiser chaque work item
            const results = [];
            const movedItems = [];

            for (const workItem of workItems) {
                const { team, iteration, name } = workItem.object.data;
                const positionId = workItem.positionId;
                const normalizedIteration = iteration || 'default'; // Utiliser 'default' si iteration est null

                console.log(`\n🎯 Traitement de "${name}" (Équipe: ${team}, Itération: ${normalizedIteration})`);

                // Utiliser le mapping pour trouver la zone d'équipe
                const mappedTeam = this.teamMapping[team] || team;
                console.log(`🗺️  Équipe mappée: ${team} -> ${mappedTeam}`);

                // Vérifier si la zone d'équipe existe
                let targetIteration = normalizedIteration;
                if (!teamZones[mappedTeam] || !teamZones[mappedTeam][normalizedIteration]) {
                    // Essayer avec l'itération 'default' si l'itération spécifique n'existe pas
                    if (teamZones[mappedTeam] && teamZones[mappedTeam]['default']) {
                        targetIteration = 'default';
                        console.log(`🔄 Utilisation de l'itération 'default' pour l'équipe ${mappedTeam}`);
                    } else {
                        console.log(`⚠️  Zone non trouvée pour l'équipe ${mappedTeam}, itération ${normalizedIteration}`);
                        console.log(`   Zones disponibles:`, Object.keys(teamZones));
                        continue;
                    }
                }

                // Calculer la nouvelle position
                const newPosition = this.calculateOptimalPosition(
                    workItem.object.data,
                    teamZones[mappedTeam][targetIteration],
                    movedItems
                );

                // Déplacer l'item
                console.log(`📦 Déplacement vers: top=${newPosition.top}, left=${newPosition.left}`);
                const result = await this.moveWorkItem(positionId, newPosition);

                if (result.success) {
                    movedItems.push(workItem.object.data);
                    results.push({
                        name,
                        team,
                        iteration,
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

                // Petite pause pour éviter de surcharger l'API
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // 5. Résumé des résultats
            console.log('\n🎉 ORGANISATION TERMINÉE !');
            console.log(`📊 ${results.length} work items organisés`);

            results.forEach(result => {
                console.log(`\n📦 ${result.name} (${result.team}/${result.iteration})`);
                console.log(`   Ancienne position: (${result.oldPosition.left}, ${result.oldPosition.top})`);
                console.log(`   Nouvelle position: (${result.newPosition.left}, ${result.newPosition.top})`);
            });

            return results;

        } catch (error) {
            console.error('💥 Erreur lors de l\'organisation:', error.message);
            throw error;
        }
    }

    /**
     * 🎨 FONCTION BONUS : Affiche un résumé visuel de la board
     */
    async displayBoardSummary(worldId, boardId) {
        console.log('📊 RÉSUMÉ DE LA BOARD\n');

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

        console.log('\n📋 WORK ITEMS:');
        workItems.forEach(item => {
            const { name, team, iteration } = item.object.data;
            const { top, left } = item.position.data;
            console.log(`  ${name}: Équipe ${team}, Itération ${iteration} - Position (${left}, ${top})`);
        });
    }
}

// 🚀 EXEMPLE D'UTILISATION
async function main() {
    const mover = new SmartWorkItemMover();

    const worldId = '68932ca97baa671b9427c55f';
    const boardId = '68eff5caa686e9736c5a6e28';

    try {
        // Afficher le résumé avant organisation
        await mover.displayBoardSummary(worldId, boardId);

        // Organiser les work items
        await mover.organizeWorkItems(worldId, boardId);

    } catch (error) {
        console.error('💥 Erreur:', error.message);
    }
}

// Exporter pour utilisation
module.exports = SmartWorkItemMover;

// Exécuter si appelé directement
if (require.main === module) {
    main();
}
