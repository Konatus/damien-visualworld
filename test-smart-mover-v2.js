/**
 * 🧪 SCRIPT DE TEST pour le Smart Work Item Mover V2 - VERSION GRADIN
 * 
 * Nouvelles fonctionnalités testées:
 * - Positionnement en gradin (staircase layout)
 * - Tri par date d'échéance (due date)
 * - Espacement de 1K Feature entre les gradins
 * - Meilleur centrage dans les rectangles
 * - Gestion des itérations non trouvées
 */

const SmartWorkItemMoverV2 = require('./smart-work-item-mover-v2.js');

async function testSmartMoverV2() {
    console.log('🧪 TEST DU SMART WORK ITEM MOVER V2 - VERSION GRADIN\n');
    console.log('🎯 Nouvelles fonctionnalités:');
    console.log('   ✨ Positionnement en gradin');
    console.log('   📅 Tri par date d\'échéance');
    console.log('   📏 Espacement 1K Feature entre gradins');
    console.log('   🎯 Centrage amélioré');
    console.log('   🏠 Gestion des itérations manquantes');
    console.log('');

    const mover = new SmartWorkItemMoverV2();
    const worldId = '68b70d885688a422d9513890';
    const boardId = '690a1d27ee300fc9f6ee5ae9';

    try {
        // 1. Afficher le résumé de la board avec les nouvelles statistiques
        console.log('📊 ÉTAPE 1: Analyse détaillée de la board actuelle\n');
        await mover.displayBoardSummary(worldId, boardId);

        // 2. Demander confirmation avant organisation
        console.log('\n⚠️  ATTENTION: Cette opération va organiser tous les work items en gradin !');
        console.log('🏗️  Les work items seront triés par due date et placés en escalier');
        console.log('🏠 Les itérations non trouvées seront placées à côté des features');
        console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 7 secondes pour continuer...\n');

        // Compte à rebours visuel
        for (let i = 7; i > 0; i--) {
            process.stdout.write(`\r⏳ Démarrage dans ${i} secondes...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('\r🚀 Démarrage de l\'organisation en gradin !     \n');

        // 3. Organiser les work items en gradin
        console.log('🏗️  ÉTAPE 2: Organisation des work items en gradin\n');
        const results = await mover.organizeWorkItems(worldId, boardId);

        // 4. Afficher le résumé final avec statistiques détaillées
        console.log('\n📊 ÉTAPE 3: Résumé final et statistiques\n');
        await mover.displayBoardSummary(worldId, boardId);

        // 5. Statistiques de l'opération
        console.log('\n📈 STATISTIQUES DE L\'OPÉRATION:');
        console.log(`   ✅ Total items traités: ${results.length}`);

        const staircaseItems = results.filter(r => !r.isOrphan);
        const orphanItems = results.filter(r => r.isOrphan);

        console.log(`   🏗️  Items en gradin: ${staircaseItems.length}`);
        console.log(`   🏠 Items orphelins: ${orphanItems.length}`);

        if (staircaseItems.length > 0) {
            const maxStairLevel = Math.max(...staircaseItems.map(r => r.stairLevel || 1));
            console.log(`   📶 Nombre de gradins créés: ${maxStairLevel}`);

            const itemsWithDueDate = staircaseItems.filter(r => r.dueDate);
            console.log(`   📅 Items avec due date: ${itemsWithDueDate.length}/${staircaseItems.length}`);
        }

        // 6. Affichage des équipes et itérations traitées
        const teamIterations = new Set();
        staircaseItems.forEach(r => {
            teamIterations.add(`${r.team}/${r.iteration}`);
        });

        console.log(`   🏢 Équipes/Itérations organisées: ${teamIterations.size}`);
        teamIterations.forEach(ti => {
            const [team, iteration] = ti.split('/');
            const itemsInGroup = staircaseItems.filter(r => r.team === team && r.iteration === iteration);
            console.log(`      - ${ti}: ${itemsInGroup.length} items`);
        });

        // 7. Affichage des items orphelins si présents
        if (orphanItems.length > 0) {
            console.log('\n🏠 ITEMS ORPHELINS (itérations non trouvées):');
            orphanItems.forEach(item => {
                console.log(`   - ${item.name} (${item.team}/${item.iteration})`);
            });
        }

        console.log('\n🎉 TEST V2 TERMINÉ AVEC SUCCÈS !');
        console.log('🏗️  Tous les work items ont été organisés en gradin selon les nouvelles spécifications');

    } catch (error) {
        console.error('💥 ERREUR LORS DU TEST V2:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Fonction utilitaire pour tester seulement l'affichage (sans déplacement)
async function testDisplayOnly() {
    console.log('🔍 MODE ANALYSE SEULEMENT - Aucun déplacement ne sera effectué\n');

    const mover = new SmartWorkItemMoverV2();
    const worldId = '68b70d885688a422d9513890';
    const boardId = '690a1d27ee300fc9f6ee5ae9';

    try {
        await mover.displayBoardSummary(worldId, boardId);
        console.log('\n✅ Analyse terminée - Aucune modification effectuée');
    } catch (error) {
        console.error('💥 ERREUR LORS DE L\'ANALYSE:', error.message);
        process.exit(1);
    }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--display-only') || args.includes('-d')) {
    // Mode analyse seulement
    testDisplayOnly();
} else {
    // Mode complet avec déplacement
    testSmartMoverV2();
}

// Afficher l'aide si demandée
if (args.includes('--help') || args.includes('-h')) {
    console.log('🧪 SMART WORK ITEM MOVER V2 - SCRIPT DE TEST');
    console.log('');
    console.log('Usage:');
    console.log('  node test-smart-mover-v2.js           # Test complet avec déplacement');
    console.log('  node test-smart-mover-v2.js -d        # Analyse seulement (pas de déplacement)');
    console.log('  node test-smart-mover-v2.js --help    # Afficher cette aide');
    console.log('');
    console.log('Nouvelles fonctionnalités V2:');
    console.log('  🏗️  Positionnement en gradin (staircase layout)');
    console.log('  📅 Tri automatique par date d\'échéance');
    console.log('  📏 Espacement de 1K Feature entre les gradins');
    console.log('  🎯 Centrage amélioré dans les rectangles');
    console.log('  🏠 Gestion intelligente des itérations non trouvées');
    process.exit(0);
}
