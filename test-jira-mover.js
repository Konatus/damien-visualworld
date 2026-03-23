/**
 * 🧪 SCRIPT DE TEST - SMART WORK ITEM MOVER JIRA OPTIMISÉ
 * 
 * Test l'organisation automatique des work items Jira par projet
 * avec espacements uniformes et placement intelligent des Features
 * 
 * 🏷️ Projets: FF (Forfait Familial), REP (Réparation), FID (Fidélité), L1 (Ligue1)
 */

const SmartWorkItemMoverJira = require('./smart-work-item-mover-jira');

async function testJiraMover() {
    console.log('🧪 TEST DU SMART MOVER JIRA OPTIMISÉ\n');
    console.log('🎯 Capacités:');
    console.log('   📏 Organisation par projet avec noms complets');
    console.log('   📐 K Work Items: ligne horizontale de base');
    console.log('   🎯 K Features: à droite avec delta visuel vers le haut');
    console.log('   📊 Espacements uniformes (40px horiz, 80px vert)');
    console.log('   🔍 Détection automatique: FF, REP, FID, L1');
    console.log('');

    const mover = new SmartWorkItemMoverJira();
    
    // Utiliser les mêmes IDs que les autres scripts de test
    const worldId = '68b70d885688a422d9513890';
    const boardId = '693007754e841f6d3dbbed07';  // Board Jira

    try {
        // 1. Test de détection des projets seulement
        console.log('📊 ÉTAPE 1: Détection et analyse des projets Jira\n');
        await mover.displayProjectSummary(worldId, boardId);

        // 2. Demander confirmation
        console.log('\n⚠️  VOULEZ-VOUS CONTINUER AVEC L\'ORGANISATION ?');
        console.log('🎯 Cette opération va organiser les work items Jira par projet');
        console.log('📏 Chaque projet sera aligné horizontalement');
        console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 10 secondes...\n');

        // Compte à rebours
        for (let i = 10; i > 0; i--) {
            process.stdout.write(`\r⏳ Organisation dans ${i} secondes...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('\r🚀 Démarrage de l\'organisation Jira !     \n');

        // 3. Organisation complète
        console.log('🎯 ÉTAPE 2: Organisation par projets\n');
        const results = await mover.organizeWorkItems(worldId, boardId);

        // 4. Résumé final
        console.log('\n📊 ÉTAPE 3: Résumé final\n');
        await mover.displayProjectSummary(worldId, boardId);

        // 5. Analyse des résultats
        console.log('\n🎉 RÉSULTATS DE L\'ORGANISATION JIRA:');

        // Grouper les résultats par projet
        const resultsByProject = {};
        results.forEach(result => {
            if (!resultsByProject[result.project]) {
                resultsByProject[result.project] = [];
            }
            resultsByProject[result.project].push(result);
        });

        Object.entries(resultsByProject).forEach(([projectKey, items]) => {
            const projectName = items[0].projectName;
            const workItems = items.filter(i => i.componentType === 'K-Work Item').length;
            const features = items.filter(i => i.componentType === 'K-Feature').length;
            
            console.log(`\n📦 Projet ${projectKey} - ${projectName}:`);
            console.log(`   ✅ ${workItems} Work Items + ${features} Features = ${items.length} total`);
            
            // Afficher quelques exemples
            const examples = items.slice(0, 3);
            examples.forEach(item => {
                const type = item.componentType === 'K-Feature' ? '🎯' : '📌';
                console.log(`      ${type} ${item.name} (${item.jiraKey})`);
            });
            if (items.length > 3) {
                console.log(`      ... et ${items.length - 3} autres`);
            }
        });

        console.log('\n🎯 TEST JIRA TERMINÉ AVEC SUCCÈS !');
        console.log('📏 Vos work items Jira sont maintenant organisés par projet !');

    } catch (error) {
        console.error('💥 ERREUR LORS DU TEST JIRA:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Fonction pour tester seulement la détection (sans organisation)
async function testDetectionOnly() {
    console.log('🔍 MODE DÉTECTION SEULEMENT - Analyse des projets Jira\n');
    console.log('🏷️ Projets recherchés: FF, REP, FID, L1');
    console.log('📊 Analyse des Work Items et Features\n');

    const mover = new SmartWorkItemMoverJira();
    const worldId = '68b70d885688a422d9513890';
    const boardId = '693007754e841f6d3dbbed07';

    try {
        await mover.displayProjectSummary(worldId, boardId);
        console.log('\n✅ Détection terminée - Aucune modification effectuée');
    } catch (error) {
        console.error('💥 ERREUR LORS DE LA DÉTECTION:', error.message);
        process.exit(1);
    }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--detect-only') || args.includes('-d')) {
    // Mode détection seulement
    testDetectionOnly();
} else if (args.includes('--help') || args.includes('-h')) {
    // Afficher l'aide
    console.log('🧪 SMART WORK ITEM MOVER JIRA OPTIMISÉ');
    console.log('');
    console.log('Usage:');
    console.log('  node test-jira-mover.js           # Test complet avec organisation');
    console.log('  node test-jira-mover.js -d       # Détection seulement');
    console.log('  node test-jira-mover.js --help   # Afficher cette aide');
    console.log('');
    console.log('🏷️ Projets supportés:');
    console.log('  FF  → Forfait Familial');
    console.log('  REP → Nouveau programme Réparation');
    console.log('  FID → Nv programme Fidélité');
    console.log('  L1  → Abonnement Ligue1');
    console.log('');
    console.log('📐 Fonctionnalités:');
    console.log('  📏 Organisation par projet avec noms complets');
    console.log('  📌 K Work Items: alignés horizontalement (ligne de base)');
    console.log('  🎯 K Features: à droite avec décalage vers le haut (delta visuel)');
    console.log('  📊 Espacements uniformes: 40px horizontal, 80px vertical');
    console.log('  🔍 Détection automatique des préfixes');
    process.exit(0);
} else {
    // Mode complet avec organisation
    testJiraMover();
}

