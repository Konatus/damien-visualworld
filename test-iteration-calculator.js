#!/usr/bin/env node

/**
 * Script de test pour le calculateur d'itérations
 * Usage: node test-iteration-calculator.js
 */

const IterationCalculator = require('./iteration-calculator.js');
const fs = require('fs');
const path = require('path');

async function testCalculator() {
    console.log('🧪 Test du calculateur d\'itérations');
    console.log('=====================================\n');

    const calculator = new IterationCalculator();

    // Test 1: Calcul d'itération simple
    console.log('📊 Test 1: Calcul d\'itération simple');
    const testDate1 = new Date('2025-01-15'); // 14 jours après la date courante
    const iteration1 = calculator.calculateIteration(testDate1);
    console.log(`Date de test: ${calculator.formatDate(testDate1)}`);
    console.log(`Itération calculée: ${iteration1}`);
    console.log(`Attendu: 2 (car 14 jours / 14 jours = 1, + 1 = 2)\n`);

    // Test 2: Calcul d'itération avec date passée
    console.log('📊 Test 2: Calcul d\'itération avec date passée');
    const testDate2 = new Date('2024-12-18'); // 14 jours avant la date courante
    const iteration2 = calculator.calculateIteration(testDate2);
    console.log(`Date de test: ${calculator.formatDate(testDate2)}`);
    console.log(`Itération calculée: ${iteration2}`);
    console.log(`Attendu: 0 (car -14 jours / 14 jours = -1, + 1 = 0)\n`);

    // Test 3: Calcul de date de début due
    console.log('📊 Test 3: Calcul de date de début due');
    const dueStartDate = calculator.calculateDueStartDate('21/01/2025', 7, 5);
    console.log(`Date due: 21/01/2025, Load: 7, FTE: 5`);
    console.log(`Date de début calculée: ${calculator.formatDate(dueStartDate)}`);
    console.log(`Attendu: 19/01/2025 (car 7/5 = 1.4 → 2 jours avant)\n`);

    // Test 4: Vérifier l'existence des fichiers
    console.log('📂 Test 4: Vérification des fichiers');
    const filesToCheck = [
        '/root/visualworld-main/DataFile/InputDataOptimization.xlsx',
        '/root/visualworld-main/OptimizationCode/ExternScript/InputOutputData/InputDataOptimization.xlsx',
        '/root/visualworld-main/OptimizationCode/ExternScript/InputOutputData/InputDataOptimization.csv',
        '/root/visualworld-main/InputDataOptimization.xlsx'
    ];

    filesToCheck.forEach(filePath => {
        const exists = fs.existsSync(filePath);
        console.log(`${exists ? '✅' : '❌'} ${path.basename(filePath)} - ${filePath}`);
    });

    // Test 5: Test de traitement si des fichiers existent
    console.log('\n📊 Test 5: Test de traitement des fichiers');
    const existingFiles = filesToCheck.filter(filePath => fs.existsSync(filePath));

    if (existingFiles.length > 0) {
        console.log(`Fichiers trouvés: ${existingFiles.length}`);
        try {
            const results = await calculator.processOptimizationFiles();
            console.log('\n✅ Résultats du traitement:');
            results.forEach((result, index) => {
                console.log(`${index + 1}. ${path.basename(result.filePath)}`);
                if (result.success) {
                    console.log(`   ✅ Succès - ${result.updatedCount}/${result.processedCount} lignes mises à jour`);
                } else {
                    console.log(`   ❌ Échec - ${result.error}`);
                }
            });
        } catch (error) {
            console.error('❌ Erreur lors du test de traitement:', error.message);
        }
    } else {
        console.log('⚠️ Aucun fichier d\'optimisation trouvé pour le test');
    }

    console.log('\n🎯 Test terminé !');
}

// Exécuter les tests
if (require.main === module) {
    testCalculator().catch(error => {
        console.error('❌ Erreur lors des tests:', error);
        process.exit(1);
    });
}
