/**
 * 🚀 SMART WORK ITEM MOVER V4 - VERSION PROJECT ROWS
 * Système intelligent qui organise les work items par projet en rangées horizontales
 * 
 * Nouvelles fonctionnalités V4:
 * - Alignement horizontal des work items d'un même projet (rangée)
 * - Saut de ligne intelligent basé sur la surface disponible du rectangle
 * - Gestion des débordements (items avec itération supérieure) placés verticalement
 * - Tri par start_date_test à l'intérieur de chaque projet
 * - Positionnement précis à l'intérieur des rectangles (pas en haut)
 */

const axios = require('axios');

class SmartWorkItemMoverV4 {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/api`;

        // Configuration des dimensions
        this.CARD_WIDTH = 310;
        this.CARD_HEIGHT = 300;
        this.HORIZONTAL_GAP = 75;     // Espacement horizontal entre cartes (même projet) - collées
        this.VERTICAL_GAP = 50;       // Espacement vertical entre rangées (projets différents) - réduit
        this.INNER_PADDING_Y_TOP = 300;   // Marge verticale HAUTE dans le rectangle
        this.INNER_PADDING_Y_BOTTOM = 50; // Marge verticale BASSE dans le rectangle
        this.INNER_PADDING_X = 30;    // Marge horizontale dans le rectangle
        this.MIN_HORIZONTAL_GAP = 10; // Gap minimum si on doit compresser
        this.MIN_VERTICAL_GAP = 10;   // Gap minimum vertical si on doit compresser
    }

    /**
     * Récupère les données de la board
     */
    async getBoardData(worldId, boardId) {
        try {
            const response = await axios.get(`${this.apiUrl}/board-io`, {
                params: { worldId, boardId },
                headers: {
                    'User-Agent': 'SmartWorkItemMoverV4/4.0',
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
                    items: [],
                    teams: new Set(),
                    iterations: new Set()
                };
            }

            projects[projectPrefix].items.push(workItem);
            projects[projectPrefix].teams.add(workItem.object.data.team);
            projects[projectPrefix].iterations.add(workItem.object.data.iteration);
        });

        // Convertir les Sets en Arrays et trier les items par start_date_test (STABLE SORT)
        Object.values(projects).forEach(project => {
            project.teams = Array.from(project.teams).sort();
            project.iterations = Array.from(project.iterations).sort();

            // Trier les items par start_date_test (ou start_date si start_date_test n'existe pas)
            project.items.sort((a, b) => {
                const dateStrA = a.object.data.start_date_test || a.object.data.start_date;
                const dateStrB = b.object.data.start_date_test || b.object.data.start_date;

                const dateA = this.parseDate(dateStrA);
                const dateB = this.parseDate(dateStrB);

                if (dateA && dateB) {
                    const diff = dateA - dateB;
                    if (diff !== 0) return diff;
                    // En cas d'égalité, garder l'ordre initial (stable sort)
                    return 0;
                }
                if (dateA && !dateB) return -1;
                if (!dateA && dateB) return 1;

                // Si pas de dates, garder l'ordre initial
                return 0;
            });
        });

        return projects;
    }

    /**
     * Trouve tous les work items
     */
    findWorkItems(objects) {
        return objects.filter(obj =>
            obj.object.data.name &&
            obj.object.data.team &&
            obj.object.data.name.trim() !== ''
        );
    }

    /**
     * Calcule le gap dynamique horizontal pour qu'un projet tienne dans la largeur disponible
     */
    calculateDynamicHorizontalGap(numCards, availableWidth) {
        if (numCards <= 1) return this.HORIZONTAL_GAP;

        const totalCardWidth = numCards * this.CARD_WIDTH;
        const remainingSpace = availableWidth - totalCardWidth;
        const dynamicGap = remainingSpace / (numCards - 1);

        // Ne pas descendre en dessous du gap minimum
        return Math.max(dynamicGap, this.MIN_HORIZONTAL_GAP);
    }

    /**
     * Calcule le gap vertical dynamique pour que tous les projets rentrent dans le rectangle
     */
    calculateDynamicVerticalGap(numProjects, availableHeight) {
        if (numProjects <= 1) return this.VERTICAL_GAP;

        const totalCardHeight = numProjects * this.CARD_HEIGHT;
        const totalPadding = this.INNER_PADDING_Y_TOP + this.INNER_PADDING_Y_BOTTOM;
        const remainingSpace = availableHeight - totalCardHeight - totalPadding;
        const dynamicGap = remainingSpace / (numProjects - 1);

        // Ne pas descendre en dessous du gap minimum
        return Math.max(dynamicGap, this.MIN_VERTICAL_GAP);
    }

    /**
     * Calcule les positions pour un projet entier (rangée horizontale de gauche à droite)
     */
    calculateProjectRowPositions(zone, items, rowTop) {
        const availableWidth = zone.width - 2 * this.INNER_PADDING_X;
        const numCards = items.length;

        // Calculer le gap à utiliser
        const totalWidthWithNormalGap = numCards * this.CARD_WIDTH + (numCards - 1) * this.HORIZONTAL_GAP;
        let gap = this.HORIZONTAL_GAP;

        if (totalWidthWithNormalGap > availableWidth) {
            // Les cartes ne rentrent pas, calculer un gap dynamique
            gap = this.calculateDynamicHorizontalGap(numCards, availableWidth);
        }

        // Calculer les positions (gauche → droite)
        const positions = [];
        let currentLeft = zone.left + this.INNER_PADDING_X;

        for (let i = 0; i < items.length; i++) {
            positions.push({
                top: rowTop,
                left: currentLeft,
                width: this.CARD_WIDTH,
                height: this.CARD_HEIGHT,
                zIndex: zone.zIndex + 10 + i,
                cardIndex: i,
                gap: gap
            });

            currentLeft += this.CARD_WIDTH + gap;
        }

        return positions;
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
                    'User-Agent': 'SmartWorkItemMoverV4/4.0',
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
     * 🎯 FONCTION PRINCIPALE V4 : Organise par projet en rangées horizontales À L'INTÉRIEUR des carrés
     */
    async organizeWorkItems(worldId, boardId) {
        this.worldId = worldId;
        this.boardId = boardId;

        console.log('🚀 Démarrage de l\'organisation intelligente V4 (Project Rows)...\n');

        try {
            // 1. Récupérer les données
            console.log('📊 Récupération des données de la board...');
            const boardData = await this.getBoardData(worldId, boardId);

            // 2. Analyser les zones d'équipes
            console.log('🔍 Analyse des zones d\'équipes...');
            const teamZones = this.analyzeTeamZones(boardData.objects);

            // 3. Trouver les work items
            console.log('📋 Recherche des work items...');
            const workItems = this.findWorkItems(boardData.objects);

            // 4. Détecter les projets automatiquement
            console.log('🎯 Détection automatique des projets...');
            const projects = this.detectProjects(workItems);

            console.log('\n🏷️  PROJETS DÉTECTÉS:');
            Object.entries(projects).forEach(([projectName, project]) => {
                console.log(`   📦 ${projectName}: ${project.items.length} items`);
                console.log(`      Équipes: ${project.teams.join(', ')}`);
                console.log(`      Itérations: ${project.iterations.join(', ')}`);
            });

            // 5. Organiser par équipe/itération avec rangées par projet À L'INTÉRIEUR
            const results = [];

            // Grouper par équipe/itération
            for (const [team, iterations] of Object.entries(teamZones)) {
                for (const [iteration, zone] of Object.entries(iterations)) {
                    console.log(`\n🏗️  Traitement Équipe ${team} / Itération ${iteration}`);
                    console.log(`   📐 Rectangle: ${Math.round(zone.width)}x${Math.round(zone.height)}px`);

                    // Grouper les items par projet pour cette zone (déjà triés par start_date_test)
                    const projectItemsInZone = {};
                    const overflowItems = [];

                    Object.entries(projects).forEach(([projectName, project]) => {
                        project.items.forEach(item => {
                            const itemTeam = this.teamMapping[item.object.data.team] || item.object.data.team;
                            const itemIteration = String(item.object.data.iteration || 'default');
                            const zoneIteration = String(iteration);

                            // Comparer en string pour éviter les problèmes de type
                            if (String(itemTeam) === String(team) && itemIteration === zoneIteration) {
                                if (!projectItemsInZone[projectName]) {
                                    projectItemsInZone[projectName] = [];
                                }
                                projectItemsInZone[projectName].push(item);
                            } else if (String(itemTeam) === String(team) && parseInt(itemIteration) > parseInt(zoneIteration)) {
                                overflowItems.push({ projectName, item });
                            }
                        });
                    });

                    // Compter le total d'items
                    const totalItems = Object.values(projectItemsInZone).reduce((sum, items) => sum + items.length, 0);
                    const numProjects = Object.keys(projectItemsInZone).length;
                    console.log(`   📋 ${totalItems} items à placer (${numProjects} projets)`);

                    // Calculer le gap vertical dynamique si nécessaire
                    const verticalGap = this.calculateDynamicVerticalGap(numProjects, zone.height);
                    if (verticalGap < this.VERTICAL_GAP) {
                        console.log(`   📏 Gap vertical réduit: ${Math.round(verticalGap)}px (au lieu de ${this.VERTICAL_GAP}px) pour faire rentrer ${numProjects} projets`);
                    }

                    // Placer les items projet par projet en RANGÉES HORIZONTALES
                    // Chaque projet = une rangée, changement de projet = nouvelle rangée en dessous
                    let currentRowTop = zone.top + this.INNER_PADDING_Y_TOP;
                    let placedItemsCount = 0;

                    for (const [projectName, items] of Object.entries(projectItemsInZone)) {
                        console.log(`\n   🎯 Projet: ${projectName} (${items.length} items)`);

                        // Vérifier si on a assez de place verticalement
                        if (currentRowTop + this.CARD_HEIGHT > zone.top + zone.height - this.INNER_PADDING_Y_BOTTOM) {
                            console.log(`   ⚠️  Plus de place verticalement, ${items.length} items en débordement`);
                            items.forEach(item => overflowItems.push({ projectName, item }));
                            continue;
                        }

                        // Calculer les positions pour toutes les cartes de ce projet (rangée horizontale)
                        const positions = this.calculateProjectRowPositions(zone, items, currentRowTop);

                        console.log(`   📏 Gap utilisé: ${Math.round(positions[0].gap)}px (${items.length} cartes sur la rangée)`);

                        // Placer chaque carte du projet
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            const newPosition = positions[i];

                            const { name, start_date_test, start_date } = item.object.data;
                            const displayDate = start_date_test || start_date;

                            console.log(`      📌 "${name}"`);
                            if (displayDate) {
                                console.log(`         🗓️  ${displayDate}`);
                            }
                            console.log(`         📍 Position ${i + 1}/${items.length}: (${Math.round(newPosition.left)}, ${Math.round(newPosition.top)})`);

                            // Déplacer l'item
                            const result = await this.moveWorkItem(item.positionId, newPosition);

                            if (result.success) {
                                results.push({
                                    name,
                                    project: projectName,
                                    team,
                                    iteration,
                                    cardIndex: i,
                                    isOverflow: false,
                                    oldPosition: {
                                        top: item.position.data.top,
                                        left: item.position.data.left
                                    },
                                    newPosition: {
                                        top: newPosition.top,
                                        left: newPosition.left
                                    }
                                });
                                placedItemsCount++;
                                console.log('         ✅ Déplacé avec succès');
                            } else {
                                console.log('         ❌ Échec du déplacement');
                            }

                            await new Promise(resolve => setTimeout(resolve, 150));
                        }

                        // Passer à la rangée suivante (nouveau projet = nouvelle rangée en dessous)
                        // Utiliser le gap vertical dynamique
                        currentRowTop += this.CARD_HEIGHT + verticalGap;
                    }

                    // Vérifier qu'on a bien placé tous les items prévus
                    if (placedItemsCount < totalItems) {
                        console.log(`\n   ⚠️  ATTENTION: ${totalItems - placedItemsCount} items n'ont pas été placés !`);
                    } else {
                        console.log(`\n   ✅ Tous les ${placedItemsCount} items ont été placés avec succès`);
                    }

                    // Placer les items en débordement (en dehors du rectangle)
                    if (overflowItems.length > 0) {
                        console.log(`\n   ⚠️  Placement des items en débordement (${overflowItems.length})`);

                        let overflowTop = zone.top + this.INNER_PADDING_Y_TOP;
                        for (let i = 0; i < overflowItems.length; i++) {
                            const { projectName, item } = overflowItems[i];

                            const newPosition = {
                                top: overflowTop,
                                left: zone.left + zone.width + 50,
                                width: this.CARD_WIDTH,
                                height: this.CARD_HEIGHT,
                                zIndex: zone.zIndex + 1000 + i
                            };

                            const { name } = item.object.data;
                            console.log(`      📌 "${name}" (${projectName})`);
                            console.log(`         📍 Débordement ${i + 1}: (${Math.round(newPosition.left)}, ${Math.round(newPosition.top)})`);

                            const result = await this.moveWorkItem(item.positionId, newPosition);

                            if (result.success) {
                                results.push({
                                    name,
                                    project: projectName,
                                    team,
                                    iteration: item.object.data.iteration,
                                    cardIndex: i,
                                    isOverflow: true,
                                    oldPosition: {
                                        top: item.position.data.top,
                                        left: item.position.data.left
                                    },
                                    newPosition: {
                                        top: newPosition.top,
                                        left: newPosition.left
                                    }
                                });
                                console.log('         ✅ Déplacé avec succès');
                            }

                            overflowTop += this.CARD_HEIGHT + 20;
                            await new Promise(resolve => setTimeout(resolve, 150));
                        }
                    }
                }
            }

            // 6. Résumé des résultats
            console.log('\n🎉 ORGANISATION PROJECT ROWS TERMINÉE !');
            console.log(`📊 ${results.length} work items organisés`);

            const projectStats = {};
            results.forEach(result => {
                if (!projectStats[result.project]) {
                    projectStats[result.project] = {
                        count: 0,
                        overflow: 0
                    };
                }
                projectStats[result.project].count++;
                if (result.isOverflow) {
                    projectStats[result.project].overflow++;
                }
            });

            console.log('\n📈 STATISTIQUES PAR PROJET:');
            Object.entries(projectStats).forEach(([project, stats]) => {
                console.log(`   🎯 ${project}:`);
                console.log(`      Items: ${stats.count}`);
                if (stats.overflow > 0) {
                    console.log(`      Items en débordement: ${stats.overflow}`);
                }
            });

            return results;

        } catch (error) {
            console.error('💥 Erreur lors de l\'organisation V4:', error.message);
            throw error;
        }
    }

    /**
     * Affiche un résumé avec détection des projets
     */
    async displayProjectSummary(worldId, boardId) {
        console.log('📊 RÉSUMÉ PROJECT ROWS V4\n');

        const boardData = await this.getBoardData(worldId, boardId);
        const workItems = this.findWorkItems(boardData.objects);
        const projects = this.detectProjects(workItems);

        console.log('🎯 PROJETS DÉTECTÉS:');
        Object.entries(projects).forEach(([projectName, project]) => {
            console.log(`\n  📦 Projet: ${projectName}`);
            console.log(`     Items: ${project.items.length}`);
            console.log(`     Équipes: ${project.teams.join(', ')}`);
            console.log(`     Itérations: ${project.iterations.join(', ')}`);

            // Afficher quelques exemples d'items
            const examples = project.items.slice(0, 3).map(item => item.object.data.name);
            console.log(`     Exemples: ${examples.join(', ')}${project.items.length > 3 ? '...' : ''}`);
        });

        console.log(`\n📈 RÉSUMÉ GLOBAL:`);
        console.log(`   Total projets: ${Object.keys(projects).length}`);
        console.log(`   Total work items: ${workItems.length}`);
    }
}

module.exports = SmartWorkItemMoverV4;

