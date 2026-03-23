import Express from "express";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

export default async (express) => {
    express.post(
        "/api/process-saved-excel", // Traiter le fichier Excel sauvegardé
        function (req, res, next) {
            console.log("📊 Endpoint process-saved-excel appelé");
            next();
        },
        async function (req, res) {
            try {
                const filePath = path.join(process.cwd(), 'DataFile', 'InputDataOptimization.xlsx');
                console.log(`📂 Traitement du fichier: ${filePath}`);

                // Vérifier que le fichier existe
                if (!fs.existsSync(filePath)) {
                    return res.status(404).send({ error: "Fichier InputDataOptimization.xlsx non trouvé" });
                }

                // Ouvrir le fichier Excel
                const workbook = XLSX.readFile(filePath);
                console.log('📋 Feuilles trouvées:', workbook.SheetNames);

                // Trouver la feuille "Objets"
                const objectsSheetName = workbook.SheetNames.find(name =>
                    name.toLowerCase().includes('objet') || name.toLowerCase().includes('object')
                ) || workbook.SheetNames[0];

                console.log(`📋 Traitement de la feuille: ${objectsSheetName}`);

                // Lire les données de la feuille Objets
                const worksheet = workbook.Sheets[objectsSheetName];
                const objects = XLSX.utils.sheet_to_json(worksheet);

                console.log(`📊 ${objects.length} objets trouvés dans la feuille`);

                // Calculer start_date pour chaque objet
                let calculatedCount = 0;
                const updatedObjects = objects.map((obj, index) => {
                    let calculatedStartDate = null;

                    // Chercher EXACTEMENT les colonnes CALC_due_date et duration
                    const dueDate = obj.CALC_due_date;
                    const duration = obj.duration;

                    console.log(`🔍 Objet ${index + 1}: CALC_due_date=${dueDate}, duration=${duration}`);

                    // Debug: montrer toutes les colonnes disponibles
                    if (index < 3) { // Seulement pour les 3 premiers objets
                        console.log(`📋 Colonnes disponibles pour objet ${index + 1}:`, Object.keys(obj));
                    }

                    if (dueDate && duration && dueDate !== 'null' && duration !== 'null') {
                        try {
                            const dueDateObj = new Date(dueDate);
                            const durationDays = parseFloat(duration) || 0; // float comme demandé

                            if (!isNaN(dueDateObj.getTime()) && durationDays > 0) {
                                const startDateObj = new Date(dueDateObj);
                                startDateObj.setDate(dueDateObj.getDate() - Math.round(durationDays));
                                calculatedStartDate = startDateObj.toISOString().split('T')[0];
                                calculatedCount++;

                                console.log(`✅ Objet ${index + 1}: CALC_due_date=${dueDate}, duration=${duration} → start_date=${calculatedStartDate}`);
                            } else {
                                console.log(`⚠️ Objet ${index + 1}: Date invalide ou duration <= 0`);
                            }
                        } catch (error) {
                            console.warn(`⚠️ Erreur calcul start_date pour objet ${index + 1}:`, error);
                        }
                    } else {
                        console.log(`⚠️ Objet ${index + 1}: CALC_due_date ou duration manquant/null`);
                    }

                    return {
                        ...obj,
                        start_date: calculatedStartDate || obj.start_date || null
                    };
                });

                console.log(`✅ ${calculatedCount} start_date calculées sur ${objects.length} objets`);

                // Remplacer la feuille avec les données mises à jour
                const newWorksheet = XLSX.utils.json_to_sheet(updatedObjects);
                workbook.Sheets[objectsSheetName] = newWorksheet;

                // Sauvegarder le fichier modifié
                XLSX.writeFile(workbook, filePath);
                console.log('✅ Fichier Excel mis à jour avec les start_date calculées');

                res.status(200).json({
                    success: true,
                    message: `${calculatedCount} start_date calculées et fichier mis à jour`,
                    calculatedCount: calculatedCount,
                    totalObjects: objects.length
                });

            } catch (error) {
                console.error('Erreur lors du traitement du fichier Excel:', error);
                res.status(500).send({ error: "Erreur lors du traitement du fichier Excel" });
            }
        }
    );
};
