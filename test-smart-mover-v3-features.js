/**
 * 🧪 SCRIPT DE TEST pour le Smart Work Item Mover V3 - VERSION FEATURE-AWARE
 * 
 * Nouvelles fonctionnalités V3:
 * - Détection automatique des features par préfixe
 * - Organisation Feature → Équipe → Itération
 * - Espacement intelligent entre features
 */

const SmartWorkItemMoverV3 = require('./smart-work-item-mover-v3-feature-aware.js');

async function testFeatureDetection() {
    console.log('🧪 TEST DE DÉTECTION DES FEATURES V3\n');
    console.log('🎯 Nouvelles capacités:');
    console.log('   🏷️  Détection automatique des features');
    console.log('   📦 Groupement Feature → Équipe → Itération');
    console.log('   🎨 Espacement intelligent entre features');
    console.log('');

    const mover = new SmartWorkItemMoverV3();
    const worldId = '68b70d885688a422d9513890';
    const boardId = '690a1d27ee300fc9f6ee5ae9';

    try {
        // 1. Test de détection des features seulement
        console.log('📊 ÉTAPE 1: Détection et analyse des features\n');
        await mover.displayFeatureAwareSummary(worldId, boardId);

        // 2. Demander confirmation
        console.log('\n⚠️  VOULEZ-VOUS CONTINUER AVEC L\'ORGANISATION ?');
        console.log('🎯 Cette opération va organiser les work items par FEATURE d\'abord');
        console.log('📦 Chaque feature aura son propre espacement et gradin');
        console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 10 secondes...\n');

        // Compte à rebours
        for (let i = 10; i > 0; i--) {
            process.stdout.write(`\r⏳ Organisation dans ${i} secondes...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('\r🚀 Démarrage de l\'organisation feature-aware !     \n');

        // 3. Organisation complète
        console.log('🎯 ÉTAPE 2: Organisation par features\n');
        const results = await mover.organizeWorkItems(worldId, boardId);

        // 4. Résumé final
        console.log('\n📊 ÉTAPE 3: Résumé final\n');
        await mover.displayFeatureAwareSummary(worldId, boardId);

        // 5. Analyse des résultats
        console.log('\n🎉 RÉSULTATS DE L\'ORGANISATION FEATURE-AWARE:');

        // Grouper les résultats par feature
        const resultsByFeature = {};
        results.forEach(result => {
            if (!resultsByFeature[result.feature]) {
                resultsByFeature[result.feature] = [];
            }
            resultsByFeature[result.feature].push(result);
        });

        Object.entries(resultsByFeature).forEach(([feature, items]) => {
            console.log(`\n📦 Feature ${feature}:`);
            console.log(`   ✅ ${items.length} items organisés`);

            const teams = new Set(items.map(item => `${item.team}/${item.iteration}`));
            console.log(`   🏢 Équipes/Itérations: ${Array.from(teams).join(', ')}`);

            const maxLayer = Math.max(...items.map(item => item.layerIndex || 1));
            console.log(`   📚 Couches empilées: ${maxLayer}`);

            const withDueDate = items.filter(item => item.due_date);
            console.log(`   📅 Items avec due date: ${withDueDate.length}/${items.length}`);
        });

        console.log('\n🎯 TEST V3 FEATURE-AWARE TERMINÉ AVEC SUCCÈS !');
        console.log('📦 Vos work items sont maintenant organisés par FEATURE !');

    } catch (error) {
        console.error('💥 ERREUR LORS DU TEST V3:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Fonction pour tester seulement la détection (sans organisation)
async function testDetectionOnly() {
    console.log('🔍 MODE DÉTECTION SEULEMENT - Analyse des features\n');

    const mover = new SmartWorkItemMoverV3();
    const worldId = '68b70d885688a422d9513890';
    const boardId = '690a1d27ee300fc9f6ee5ae9';

    try {
        await mover.displayFeatureAwareSummary(worldId, boardId);
        console.log('\n✅ Détection terminée - Aucune modification effectuée');
    } catch (error) {
        console.error('💥 ERREUR LORS DE LA DÉTECTION:', error.message);
        process.exit(1);
    }
}

// Fonction pour comparer les 3 versions
async function compareVersions() {
    console.log('🔄 COMPARAISON DES 3 VERSIONS DU SMART MOVER\n');

    const SmartWorkItemMoverV1 = require('./smart-work-item-mover.js');
    const SmartWorkItemMoverV2 = require('./smart-work-item-mover-v2.js');
    const SmartWorkItemMoverV3 = require('./smart-work-item-mover-v3-feature-aware.js');

    const worldId = '68b70d885688a422d9513890';
    const boardId = '690a1d27ee300fc9f6ee5ae9';

    console.log('📊 ANALYSE COMPARATIVE:\n');

    try {
        // V1 - Analyse basique
        console.log('🔵 VERSION 1 - Groupement par Équipe/Itération:');
        const moverV1 = new SmartWorkItemMoverV1();
        const boardDataV1 = await moverV1.getBoardData(worldId, boardId);
        const workItemsV1 = moverV1.findWorkItems(boardDataV1.objects);
        console.log(`   Items trouvés: ${workItemsV1.length}`);
        console.log('   Groupement: Équipe → Itération');
        console.log('   Tri: Aucun');

        // V2 - Analyse avec gradin
        console.log('\n🟡 VERSION 2 - Gradin avec due date:');
        const moverV2 = new SmartWorkItemMoverV2();
        const boardDataV2 = await moverV2.getBoardData(worldId, boardId);
        const workItemsV2 = moverV2.findWorkItems(boardDataV2.objects);
        console.log(`   Items trouvés: ${workItemsV2.length}`);
        console.log('   Groupement: Équipe → Itération');
        console.log('   Tri: Due date + gradin');

        // V3 - Analyse feature-aware
        console.log('\n🟢 VERSION 3 - Feature-Aware:');
        const moverV3 = new SmartWorkItemMoverV3();
        const boardDataV3 = await moverV3.getBoardData(worldId, boardId);
        const workItemsV3 = moverV3.findWorkItems(boardDataV3.objects);
        const featuresV3 = moverV3.detectFeatures(workItemsV3);

        console.log(`   Items trouvés: ${workItemsV3.length}`);
        console.log(`   Features détectées: ${Object.keys(featuresV3).length}`);
        console.log('   Groupement: Feature → Équipe → Itération');
        console.log('   Tri: Due date + gradin + feature spacing');

        console.log('\n🎯 FEATURES DÉTECTÉES EN V3:');
        Object.entries(featuresV3).forEach(([name, feature]) => {
            console.log(`   📦 ${name}: ${feature.items.length} items`);
        });

    } catch (error) {
        console.error('💥 ERREUR LORS DE LA COMPARAISON:', error.message);
        process.exit(1);
    }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--detect-only') || args.includes('-d')) {
    // Mode détection seulement
    testDetectionOnly();
} else if (args.includes('--compare') || args.includes('-c')) {
    // Mode comparaison des versions
    compareVersions();
} else if (args.includes('--help') || args.includes('-h')) {
    // Afficher l'aide
    console.log('🧪 SMART WORK ITEM MOVER V3 - FEATURE-AWARE');
    console.log('');
    console.log('Usage:');
    console.log('  node test-smart-mover-v3-features.js           # Test complet avec organisation');
    console.log('  node test-smart-mover-v3-features.js -d       # Détection seulement');
    console.log('  node test-smart-mover-v3-features.js -c       # Comparaison des 3 versions');
    console.log('  node test-smart-mover-v3-features.js --help   # Afficher cette aide');
    console.log('');
    console.log('Nouvelles fonctionnalités V3:');
    console.log('  🏷️  Détection automatique des features par préfixe');
    console.log('  📦 Organisation Feature → Équipe → Itération');
    console.log('  🎨 Espacement intelligent entre features');
    console.log('  🔍 Analyse comparative avec les versions précédentes');
    process.exit(0);
} else {
    // Mode complet avec organisation
    testFeatureDetection();
}
