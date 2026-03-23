/**
 * 🧪 SCRIPT DE TEST pour le Smart Work Item Mover
 */

const SmartWorkItemMover = require('./smart-work-item-mover.js');

async function testSmartMover() {
    console.log('🧪 TEST DU SMART WORK ITEM MOVER\n');

    const mover = new SmartWorkItemMover();
    const worldId = '68b70d885688a422d9513890';
    const boardId = '6904b6beee300fc9f6ed00dc';

    try {
        // 1. Afficher le résumé de la board
        console.log('📊 ÉTAPE 1: Analyse de la board actuelle\n');
        await mover.displayBoardSummary(worldId, boardId);

        // 2. Demander confirmation avant organisation
        console.log('\n⚠️  ATTENTION: Cette opération va déplacer tous les work items !');
        console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes pour continuer...\n');

        await new Promise(resolve => setTimeout(resolve, 5000));

        // 3. Organiser les work items
        console.log('🚀 ÉTAPE 2: Organisation des work items\n');
        const results = await mover.organizeWorkItems(worldId, boardId);

        // 4. Afficher le résumé final
        console.log('\n📊 ÉTAPE 3: Résumé final\n');
        await mover.displayBoardSummary(worldId, boardId);

        console.log('\n🎉 TEST TERMINÉ AVEC SUCCÈS !');

    } catch (error) {
        console.error('💥 ERREUR LORS DU TEST:', error.message);
        process.exit(1);
    }
}

// Exécuter le test
testSmartMover();
