import Express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export default async (express) => {
    express.post(
        "/api/save-input-data-optimization",
        function (req, res, next) {
            console.log("🔓 Route save-input-data-optimization appelée - mode test");
            next();
        },
        async function (req, res) {
            try {
                console.log("📥 Début de la réception du fichier Excel");
                // Définir le chemin de destination
                const filePath = "/root/visualworld-main/DataFile/InputDataOptimization.xlsx";
                const dir = path.dirname(filePath);

                // Créer le dossier DataFile s'il n'existe pas
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                // Récupérer le buffer du fichier
                const chunks = [];
                req.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                req.on('end', async () => {
                    const buffer = Buffer.concat(chunks);

                    // Écrire le fichier
                    fs.writeFileSync(filePath, buffer);

                    console.log(`✅ Fichier Excel sauvegardé dans ${filePath}`);
                    
                    // Exécuter automatiquement le script calcul_dates.py
                    console.log('🐍 Exécution automatique du script calcul_dates.py...');
                    try {
                        await executeCalculDatesScript();
                        console.log('✅ Script calcul_dates.py exécuté avec succès');
                        
                        res.status(200).send({
                            success: true,
                            message: 'Fichier Excel sauvegardé et script calcul_dates.py exécuté avec succès',
                            path: filePath
                        });
                    } catch (scriptError) {
                        console.warn('⚠️ Erreur lors de l\'exécution du script:', scriptError);
                        // Répondre quand même avec succès car le fichier est sauvegardé
                        res.status(200).send({
                            success: true,
                            message: 'Fichier Excel sauvegardé (script calcul_dates.py en erreur)',
                            path: filePath,
                            scriptError: scriptError.message
                        });
                    }
                });

                req.on('error', (err) => {
                    console.error('❌ Erreur lors de la réception du fichier:', err);
                    res.status(500).send({ error: 'Erreur lors de la réception du fichier' });
                });

            } catch (error) {
                console.error('❌ Erreur lors de la sauvegarde du fichier Excel:', error);
                res.status(500).send({ error: error.message });
            }
        }
    );
};

// Fonction pour exécuter le script calcul_dates.py
async function executeCalculDatesScript() {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'DataFile', 'calcul_dates.py');
        const command = `cd ${path.dirname(scriptPath)} && python3 ${path.basename(scriptPath)} InputDataOptimization.xlsx`;
        
        console.log(`🔧 Exécution: ${command}`);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erreur script:', error);
                reject(error);
                return;
            }
            
            console.log('📤 Sortie script:', stdout);
            if (stderr) {
                console.warn('⚠️ Erreurs script:', stderr);
            }
            
            resolve({ stdout, stderr });
        });
    });
}

