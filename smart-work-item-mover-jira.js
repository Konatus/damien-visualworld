/**
 * 🚀 SMART WORK ITEM MOVER - VERSION JIRA OPTIMISÉE
 * Système intelligent qui organise les work items Jira par projet sur une board
 * 
 * 🏷️ Projets supportés:
 * - FF  → Forfait Familial
 * - REP → Nouveau programme Réparation
 * - FID → Nv programme Fidélité
 * - L1  → Abonnement Ligue1
 * 
 * 📐 Organisation:
 * - K Work Items: alignés horizontalement par projet (ligne de base)
 * - K Features: placés à droite avec un décalage vers le haut (effet delta visuel)
 * - Espacements uniformes: 40px horizontal, 80px vertical
 * - Détection automatique des projets basée sur les préfixes
 * 
 * Note: Les K Features représentent les projets eux-mêmes
 */

const axios = require('axios');

class SmartWorkItemMoverJira {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.apiUrl = `${baseUrl}/api`;

        // Configuration des dimensions des composants K
        this.K_FEATURE_WIDTH = 220;
        this.K_FEATURE_HEIGHT = 300;
        this.K_WORK_ITEM_WIDTH = 310;
        this.K_WORK_ITEM_HEIGHT = 300;

        // IDs des composants
        this.K_WORK_ITEM_ID = '681bd1c4fe6d77d26c416b9a';
        this.K_FEATURE_ID = '681bccf2fe6d770bea41690d';
        this.OLD_JIRA_ID = '56575f6a6972615f75735f6d';

        // Configuration de l'espacement - uniformisé et optimisé
        this.HORIZONTAL_GAP = 20;       // Espacement horizontal entre cartes Work Items (serré et uniforme)
        this.VERTICAL_GAP = 100;        // Espacement vertical entre projets
        this.FEATURE_VERTICAL_OFFSET = -80;   // Décalage vers le haut pour les K Features (delta visuel fort)
        this.FEATURES_START_X = 3500;   // Position X fixe pour les Features (très à droite - doublé)
        this.FEATURES_HORIZONTAL_GAP = 15;    // Espacement entre Features
        this.START_X = 40;              // Position X de départ Work Items (plus à gauche)
        this.START_Y = 120;             // Position Y de départ
        this.BASE_Z_INDEX = 100;        // Z-index de base

        // 🏷️ Mapping des préfixes vers les noms complets de projets
        this.PROJECT_NAMES = {
            'FF': 'Forfait Familial',
            'REP': 'Nouveau programme Réparation',
            'FID': 'Nv programme Fidélité',
            'L1': 'Abonnement Ligue1'
        };
    }

    /**
     * Récupère les données de la board
     */
    async getBoardData(worldId, boardId) {
        try {
            const response = await axios.get(`${this.apiUrl}/board-io`, {
                params: { worldId, boardId },
                headers: {
                    'User-Agent': 'SmartWorkItemMoverJira/1.0',
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
     * Récupère le nom complet du projet à partir du préfixe
     */
    getProjectFullName(prefix) {
        const upperPrefix = prefix.toUpperCase();
        return this.PROJECT_NAMES[upperPrefix] || prefix;
    }

    /**
     * Détecte automatiquement les projets basés sur les préfixes des noms
     * Compatible avec K - Work Item (name) et ancien Jira (jira_summary)
     * Note: Les K Features représentent les projets eux-mêmes
     */
    detectProjects(workItems) {
        const projects = {};

        workItems.forEach(workItem => {
            // Chercher le nom dans les nouvelles ou anciennes propriétés
            const name = workItem.object.data.name || workItem.object.data.jira_summary;
            if (!name) return;

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
                    prefix: projectPrefix,
                    name: this.getProjectFullName(projectPrefix),
                    items: []
                };
            }

            projects[projectPrefix].items.push(workItem);
        });

        // Trier les projets par ordre alphabétique
        const sortedProjects = {};
        Object.keys(projects).sort().forEach(key => {
            sortedProjects[key] = projects[key];
        });

        return sortedProjects;
    }

    /**
     * Trouve tous les work items Jira (K - Work Item, K - Feature, ou ancien modèle Jira)
     */
    findWorkItems(objects) {
        return objects.filter(obj => {
            const isKComponent = obj.componentId === this.K_WORK_ITEM_ID || obj.componentId === this.K_FEATURE_ID;
            const isOldJira = obj.componentId === this.OLD_JIRA_ID;

            // Pour les nouveaux composants K, vérifier la propriété 'name'
            if (isKComponent) {
                return obj.object.data.name && obj.object.data.name.trim() !== '';
            }

            // Pour l'ancien modèle Jira, vérifier 'jira_summary'
            if (isOldJira) {
                return obj.object.data.jira_summary && obj.object.data.jira_summary.trim() !== '';
            }

            return false;
        });
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
                    'User-Agent': 'SmartWorkItemMoverJira/1.0',
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
     * - K Work Items : alignés horizontalement (ligne de base du projet)
     * - K Features : placés à droite des Work Items avec un décalage vers le haut (effet delta)
     */
    async organizeWorkItems(worldId, boardId) {
        this.worldId = worldId;
        this.boardId = boardId;

        console.log('🚀 Démarrage de l\'organisation Jira par projet (version optimisée)...\n');

        try {
            // 1. Récupérer les données
            console.log('📊 Récupération des données de la board...');
            const boardData = await this.getBoardData(worldId, boardId);

            // 2. Trouver les work items Jira
            console.log('📋 Recherche des work items Jira...');
            const workItems = this.findWorkItems(boardData.objects);
            console.log(`   ✅ ${workItems.length} work items Jira trouvés`);

            // 3. Détecter les projets automatiquement
            console.log('\n🎯 Détection automatique des projets...');
            const projects = this.detectProjects(workItems);

            console.log('\n🏷️  PROJETS DÉTECTÉS:');
            Object.entries(projects).forEach(([projectPrefix, project]) => {
                const workItemsCount = project.items.filter(i => i.componentId === this.K_WORK_ITEM_ID).length;
                const featuresCount = project.items.filter(i => i.componentId === this.K_FEATURE_ID).length;
                console.log(`   📦 ${projectPrefix} (${project.name}): ${workItemsCount} Work Items + ${featuresCount} Features = ${project.items.length} total`);
            });

            // 4. Organiser les work items projet par projet
            const results = [];
            let currentY = this.START_Y;
            let globalItemIndex = 0;
            let featureYPosition = this.START_Y;  // Position Y pour les Features (colonne de droite)

            for (const [projectPrefix, project] of Object.entries(projects)) {
                console.log(`\n🎯 Organisation du projet: ${projectPrefix} - ${project.name} (${project.items.length} items)`);

                // Séparer les Work Items et les Features
                const workItemsList = project.items.filter(i => i.componentId === this.K_WORK_ITEM_ID);
                const featuresList = project.items.filter(i => i.componentId === this.K_FEATURE_ID);

                console.log(`   📊 ${workItemsList.length} Work Items + ${featuresList.length} Features`);

                // === PHASE 1 : Placer les K Work Items de gauche à droite ===
                let currentX = this.START_X;

                for (let i = 0; i < workItemsList.length; i++) {
                    const item = workItemsList[i];
                    const itemName = item.object.data.name || item.object.data.jira_summary;
                    const itemKey = item.object.data.jira_key || `Item-${i}`;

                    const newPosition = {
                        top: currentY,
                        left: currentX,
                        width: this.K_WORK_ITEM_WIDTH,
                        height: this.K_WORK_ITEM_HEIGHT,
                        zIndex: this.BASE_Z_INDEX + globalItemIndex
                    };

                    console.log(`   📌 Work Item: "${itemName}" (${itemKey})`);
                    console.log(`      📍 Position: (${Math.round(newPosition.left)}, ${Math.round(newPosition.top)})`);

                    const result = await this.moveWorkItem(item.positionId, newPosition);

                    if (result.success) {
                        results.push({
                            name: itemName,
                            jiraKey: itemKey,
                            projectPrefix: projectPrefix,
                            projectName: project.name,
                            cardIndex: i,
                            componentType: 'K-Work Item',
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

                    // Avancer horizontalement avec un espacement uniforme
                    currentX += this.K_WORK_ITEM_WIDTH + this.HORIZONTAL_GAP;
                    globalItemIndex++;

                    await new Promise(resolve => setTimeout(resolve, 150));
                }

                // === PHASE 2 : Placer LA Feature du projet à DROITE alignée avec sa ligne ===
                // Chaque Feature est alignée avec SA ligne de Work Items (même Y + delta)
                if (featuresList.length > 0) {
                    // Prendre uniquement la première Feature (représente le projet)
                    const item = featuresList[0];
                    const itemName = item.object.data.name || item.object.data.jira_summary;
                    const itemKey = item.object.data.jira_key || 'N/A';

                    const newPosition = {
                        top: currentY + this.FEATURE_VERTICAL_OFFSET,  // ALIGNÉE avec currentY du projet
                        left: this.FEATURES_START_X,  // Position fixe à droite
                        width: this.K_FEATURE_WIDTH,
                        height: this.K_FEATURE_HEIGHT,
                        zIndex: this.BASE_Z_INDEX + globalItemIndex + 1000  // Z-index plus élevé
                    };

                    console.log(`   🎯 Feature (Projet): "${itemName}" (${itemKey})`);
                    console.log(`      📍 Position À DROITE alignée Y=${Math.round(newPosition.top)} (ligne=${Math.round(currentY)})`);

                    const result = await this.moveWorkItem(item.positionId, newPosition);

                    if (result.success) {
                        results.push({
                            name: itemName,
                            jiraKey: itemKey,
                            projectPrefix: projectPrefix,
                            projectName: project.name,
                            cardIndex: 0,
                            componentType: 'K-Feature',
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

                    globalItemIndex++;
                    await new Promise(resolve => setTimeout(resolve, 150));
                }

                // === Passer au projet suivant (nouvelle rangée) ===
                // Espacement uniforme pour TOUS les projets
                currentY += this.K_WORK_ITEM_HEIGHT + this.VERTICAL_GAP;
            }

            // 5. Résumé des résultats
            console.log('\n🎉 ORGANISATION TERMINÉE !');
            console.log(`📊 ${results.length} work items Jira organisés`);

            const projectStats = {};
            results.forEach(result => {
                const key = `${result.projectPrefix} - ${result.projectName}`;
                if (!projectStats[key]) {
                    projectStats[key] = { workItems: 0, features: 0 };
                }
                if (result.componentType === 'K-Work Item') {
                    projectStats[key].workItems++;
                } else {
                    projectStats[key].features++;
                }
            });

            console.log('\n📈 STATISTIQUES PAR PROJET:');
            Object.entries(projectStats).forEach(([project, stats]) => {
                console.log(`   🎯 ${project}: ${stats.workItems} Work Items + ${stats.features} Features = ${stats.workItems + stats.features} total`);
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
        console.log('📊 RÉSUMÉ DES PROJETS JIRA\n');

        const boardData = await this.getBoardData(worldId, boardId);
        const workItems = this.findWorkItems(boardData.objects);
        const projects = this.detectProjects(workItems);

        console.log('🎯 PROJETS DÉTECTÉS:');
        Object.entries(projects).forEach(([projectPrefix, project]) => {
            const workItemsCount = project.items.filter(i => i.componentId === this.K_WORK_ITEM_ID).length;
            const featuresCount = project.items.filter(i => i.componentId === this.K_FEATURE_ID).length;

            console.log(`\n  📦 Projet: ${projectPrefix} - ${project.name}`);
            console.log(`     Items: ${workItemsCount} Work Items + ${featuresCount} Features = ${project.items.length} total`);

            // Afficher quelques exemples d'items
            const examples = project.items.slice(0, 3).map(item => {
                const name = item.object.data.name || item.object.data.jira_summary;
                const key = item.object.data.jira_key || 'N/A';
                const type = item.componentId === this.K_FEATURE_ID ? '[Feature]' : '[WI]';
                return `${type} ${name} (${key})`;
            });
            console.log(`     Exemples: ${examples.join(', ')}${project.items.length > 3 ? '...' : ''}`);
        });

        console.log(`\n📈 RÉSUMÉ GLOBAL:`);
        console.log(`   Total projets: ${Object.keys(projects).length}`);
        console.log(`   Total work items: ${workItems.length}`);
    }
}

module.exports = SmartWorkItemMoverJira;

