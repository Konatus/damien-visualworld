/**
 * 🚀 SMART WORK ITEM MOVER V3 - VERSION FEATURE-AWARE
 * Système intelligent qui détecte automatiquement les features et organise en gradin
 * 
 * Nouvelles fonctionnalités V3:
 * - Détection automatique des features par préfixe de nom
 * - Groupement par Feature → Équipe → Itération
 * - Espacement intelligent entre features
 * - Couleurs différentes par feature (optionnel)
 */

const axios = require('axios');

class SmartWorkItemMoverV3 {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/api`;
        this.FEATURE_SPACING = 1000; // Espacement entre features
        this.TEAM_SPACING = 500;     // Espacement entre équipes dans une feature
    }

    /**
     * Récupère les données de la board
     */
    async getBoardData(worldId, boardId) {
        try {
            const response = await axios.get(`${this.apiUrl}/board-io`, {
                params: { worldId, boardId },
                headers: {
                    'User-Agent': 'SmartWorkItemMoverV3/3.0',
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
     * Détecte automatiquement les features basées sur les préfixes des noms
     */
    detectFeatures(workItems) {
        const features = {};

        workItems.forEach(workItem => {
            const name = workItem.object.data.name;

            // Extraire le préfixe (avant le point ou l'espace)
            let featurePrefix = name;

            // Pattern 1: HSS.29, NF.1, SI.18 (préfixe avant le point)
            if (name.includes('.')) {
                featurePrefix = name.split('.')[0];
            }
            // Pattern 2: "nouveau programme Réparation" (premier mot)
            else if (name.includes(' ')) {
                const words = name.split(' ');
                if (words.length >= 2) {
                    featurePrefix = words[0] + ' ' + words[1]; // Prendre les 2 premiers mots
                }
            }

            // Normaliser le préfixe
            featurePrefix = featurePrefix.trim().toUpperCase();

            if (!features[featurePrefix]) {
                features[featurePrefix] = {
                    name: featurePrefix,
                    items: [],
                    teams: new Set(),
                    iterations: new Set()
                };
            }

            features[featurePrefix].items.push(workItem);
            features[featurePrefix].teams.add(workItem.object.data.team);
            features[featurePrefix].iterations.add(workItem.object.data.iteration);
        });

        // Convertir les Sets en Arrays pour l'affichage
        Object.values(features).forEach(feature => {
            feature.teams = Array.from(feature.teams).sort();
            feature.iterations = Array.from(feature.iterations).sort();
        });

        return features;
    }

    /**
     * Analyse la structure de la board pour identifier les zones d'équipes
     */
    analyzeTeamZones(objects) {
        const teamZones = {};

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

        this.teamMapping = this.createTeamMapping(teamZones);
        return teamZones;
    }

    /**
     * Crée un mapping intelligent entre les équipes nommées et numérotées
     */
    createTeamMapping(teamZones) {
        const mapping = {};
        const teamPatterns = {
            'ac': '1', 'ai': '1', 'rc': '2', 'sc': '2', 'tt': '2',
            'dev': '1', 'test': '2', 'ops': '2'
        };

        const numberedTeams = Object.keys(teamZones).filter(team => /^\d+$/.test(team));
        if (numberedTeams.length > 0) {
            const namedTeams = Object.keys(teamZones).filter(team => !/^\d+$/.test(team));
            namedTeams.sort().forEach((team, index) => {
                if (numberedTeams[index]) {
                    mapping[team] = numberedTeams[index];
                }
            });
        }

        Object.assign(mapping, teamPatterns);
        console.log('🗺️  Mapping des équipes:', mapping);
        return mapping;
    }

    /**
     * Trouve et trie les work items par start_date puis due_date (logique utilisateur)
     */
    findWorkItems(objects) {
        const workItems = objects.filter(obj =>
            obj.object.data.name &&
            obj.object.data.team &&
            obj.object.data.name.trim() !== ''
        );

        return workItems.sort((a, b) => {
            const startDateA = a.object.data.start_date;
            const startDateB = b.object.data.start_date;
            const dueDateA = a.object.data.due_date;
            const dueDateB = b.object.data.due_date;

            // 1. Trier d'abord par start_date (priorité principale)
            if (startDateA && startDateB) {
                const startComparison = new Date(startDateA) - new Date(startDateB);
                if (startComparison !== 0) return startComparison;
            }
            if (startDateA && !startDateB) return -1;
            if (!startDateA && startDateB) return 1;

            // 2. Si start_date identiques ou manquantes, trier par due_date
            if (dueDateA && dueDateB) {
                const dueComparison = new Date(dueDateA) - new Date(dueDateB);
                if (dueComparison !== 0) return dueComparison;
            }
            if (dueDateA && !dueDateB) return -1;
            if (!dueDateA && dueDateB) return 1;

            // 3. Si tout est identique, trier par nom
            return (a.object.data.name || '').localeCompare(b.object.data.name || '');
        });
    }

    /**
     * Calcule la position en empilement vertical (layered) pour les work items de même feature
     * Empilement vertical avec décalage vers la gauche comme des cartes empilées
     */
    calculateFeatureAwarePosition(workItem, teamZone, itemIndex, featureIndex, totalItemsInGroup) {
        const { top, left, width, height } = teamZone;

        const itemWidth = 310;
        const itemHeight = 300;
        const marginX = 30; // Marge de base
        const marginY = 40; // Marge verticale

        // Décalages pour l'effet d'empilement (layered) - encore plus augmentés
        const layerOffsetX = 40;  // Décalage vers la DROITE pour chaque couche (+40px)
        const layerOffsetY = -50; // Décalage vers le HAUT entre les couches (-50px)

        // Décalage par feature pour séparer les différentes features dans le même carré
        const featureSpacingX = 400; // Espacement horizontal entre features (400px)
        const featureOffsetX = featureIndex * featureSpacingX;

        // Position de base (avec décalage par feature)
        const baseLeft = left + marginX + featureOffsetX;
        const baseTop = top + marginY + height * 0.6; // Commencer plus bas (60% de la hauteur)

        // Calcul de la position avec empilement INVERSÉ (seulement pour la même feature)
        // Le premier item (index 0) est EN BAS, les suivants montent et vont à droite
        const stackOffsetX = itemIndex * layerOffsetX; // Décalage vers la droite
        const stackOffsetY = itemIndex * layerOffsetY; // Décalage vers le haut

        const finalLeft = baseLeft + stackOffsetX;
        const finalTop = baseTop + stackOffsetY;

        // S'assurer que l'item reste dans les limites du rectangle
        const boundedLeft = Math.max(left + marginX, Math.min(finalLeft, left + width - itemWidth - marginX));
        const boundedTop = Math.max(top + marginY, Math.min(finalTop, top + height - itemHeight - marginY));

        return {
            top: boundedTop,
            left: boundedLeft,
            width: itemWidth,
            height: itemHeight,
            zIndex: teamZone.zIndex + 10 + itemIndex, // Z-index croissant (dernier au-dessus)
            featureIndex,
            layerIndex: itemIndex + 1,
            stackOffsetX,
            stackOffsetY
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
                    'User-Agent': 'SmartWorkItemMoverV3/3.0',
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
     * 🎯 FONCTION PRINCIPALE V3 : Organise par Feature → Équipe → Itération
     */
    async organizeWorkItems(worldId, boardId) {
        this.worldId = worldId;
        this.boardId = boardId;

        console.log('🚀 Démarrage de l\'organisation intelligente V3 (Feature-Aware)...\n');

        try {
            // 1. Récupérer les données
            console.log('📊 Récupération des données de la board...');
            const boardData = await this.getBoardData(worldId, boardId);

            // 2. Analyser les zones d'équipes
            console.log('🔍 Analyse des zones d\'équipes...');
            const teamZones = this.analyzeTeamZones(boardData.objects);

            // 3. Trouver et trier les work items
            console.log('📋 Recherche et tri des work items...');
            const workItems = this.findWorkItems(boardData.objects);

            // 4. Détecter les features automatiquement
            console.log('🎯 Détection automatique des features...');
            const features = this.detectFeatures(workItems);

            console.log('\n🏷️  FEATURES DÉTECTÉES:');
            Object.entries(features).forEach(([featureName, feature]) => {
                console.log(`   📦 ${featureName}: ${feature.items.length} items`);
                console.log(`      Équipes: ${feature.teams.join(', ')}`);
                console.log(`      Itérations: ${feature.iterations.join(', ')}`);
            });

            // 5. Organiser par Feature → Équipe → Itération
            const results = [];
            const featureNames = Object.keys(features).sort();

            for (let featureIndex = 0; featureIndex < featureNames.length; featureIndex++) {
                const featureName = featureNames[featureIndex];
                const feature = features[featureName];

                console.log(`\n🎯 TRAITEMENT FEATURE: ${featureName} (${feature.items.length} items)`);

                // Grouper les items de cette feature par équipe/itération
                const groupedItems = {};
                const orphanItems = [];

                feature.items.forEach(workItem => {
                    const { team, iteration } = workItem.object.data;
                    const normalizedIteration = iteration || 'default';
                    const mappedTeam = this.teamMapping[team] || team;

                    if (teamZones[mappedTeam] && teamZones[mappedTeam][normalizedIteration]) {
                        const key = `${mappedTeam}/${normalizedIteration}`;
                        if (!groupedItems[key]) {
                            groupedItems[key] = [];
                        }
                        groupedItems[key].push(workItem);
                    } else {
                        orphanItems.push(workItem);
                    }
                });

                // Organiser chaque groupe de cette feature
                for (const [groupKey, items] of Object.entries(groupedItems)) {
                    const [team, iteration] = groupKey.split('/');
                    console.log(`\n   🏗️  ${featureName} → Équipe ${team}/Itération ${iteration} (${items.length} items)`);

                    const teamZone = teamZones[team][iteration];

                    for (let i = 0; i < items.length; i++) {
                        const workItem = items[i];
                        const { name, due_date } = workItem.object.data;

                        const { start_date } = workItem.object.data;
                        console.log(`\n   🎯 "${name}" (${i + 1}/${items.length})`);
                        if (start_date) {
                            console.log(`      🚀 Start: ${new Date(start_date).toLocaleDateString('fr-FR')}`);
                        }
                        if (due_date) {
                            console.log(`      📅 Due: ${new Date(due_date).toLocaleDateString('fr-FR')}`);
                        }

                        // Calculer la position avec alignement horizontal pour la feature
                        const newPosition = this.calculateFeatureAwarePosition(
                            workItem.object.data,
                            teamZone,
                            i,
                            featureIndex,
                            items.length
                        );

                        console.log(`      📦 Feature ${featureName} - Couche ${newPosition.layerIndex} (Stack: ${newPosition.stackOffsetX}, ${newPosition.stackOffsetY}) [Feature offset: ${featureIndex * 400}]: (${Math.round(newPosition.left)}, ${Math.round(newPosition.top)})`);

                        // Déplacer l'item
                        const result = await this.moveWorkItem(workItem.positionId, newPosition);

                        if (result.success) {
                            results.push({
                                name,
                                feature: featureName,
                                team,
                                iteration,
                                due_date,
                                featureIndex,
                                layerIndex: newPosition.layerIndex,
                                stackOffsetX: newPosition.stackOffsetX,
                                stackOffsetY: newPosition.stackOffsetY,
                                featureOffsetX: featureIndex * 400,
                                oldPosition: {
                                    top: workItem.position.data.top,
                                    left: workItem.position.data.left
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

                        await new Promise(resolve => setTimeout(resolve, 150));
                    }
                }
            }

            // 6. Résumé des résultats
            console.log('\n🎉 ORGANISATION FEATURE-AWARE TERMINÉE !');
            console.log(`📊 ${results.length} work items organisés`);

            // Statistiques par feature
            const featureStats = {};
            results.forEach(result => {
                if (!featureStats[result.feature]) {
                    featureStats[result.feature] = {
                        count: 0,
                        teams: new Set(),
                        maxStairLevel: 0
                    };
                }
                featureStats[result.feature].count++;
                featureStats[result.feature].teams.add(`${result.team}/${result.iteration}`);
                featureStats[result.feature].maxStairLevel = Math.max(
                    featureStats[result.feature].maxStairLevel,
                    result.layerIndex || 1
                );
            });

            console.log('\n📈 STATISTIQUES PAR FEATURE:');
            Object.entries(featureStats).forEach(([feature, stats]) => {
                console.log(`   🎯 ${feature}:`);
                console.log(`      Items: ${stats.count}`);
                console.log(`      Équipes/Itérations: ${Array.from(stats.teams).join(', ')}`);
                console.log(`      Couches empilées: ${stats.maxStairLevel}`);
            });

            return results;

        } catch (error) {
            console.error('💥 Erreur lors de l\'organisation V3:', error.message);
            throw error;
        }
    }

    /**
     * Affiche un résumé avec détection des features
     */
    async displayFeatureAwareSummary(worldId, boardId) {
        console.log('📊 RÉSUMÉ FEATURE-AWARE V3\n');

        const boardData = await this.getBoardData(worldId, boardId);
        const workItems = this.findWorkItems(boardData.objects);
        const features = this.detectFeatures(workItems);

        console.log('🎯 FEATURES DÉTECTÉES:');
        Object.entries(features).forEach(([featureName, feature]) => {
            console.log(`\n  📦 Feature: ${featureName}`);
            console.log(`     Items: ${feature.items.length}`);
            console.log(`     Équipes: ${feature.teams.join(', ')}`);
            console.log(`     Itérations: ${feature.iterations.join(', ')}`);

            // Afficher quelques exemples d'items
            const examples = feature.items.slice(0, 3).map(item => item.object.data.name);
            console.log(`     Exemples: ${examples.join(', ')}${feature.items.length > 3 ? '...' : ''}`);
        });

        console.log(`\n📈 RÉSUMÉ GLOBAL:`);
        console.log(`   Total features: ${Object.keys(features).length}`);
        console.log(`   Total work items: ${workItems.length}`);
        console.log(`   Items avec due date: ${workItems.filter(item => item.object.data.due_date).length}`);
    }
}

module.exports = SmartWorkItemMoverV3;
