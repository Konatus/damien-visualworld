import Express from "express";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

export default async (express) => {
    express.get(
        "/api/get-team-capacity",
        function (req, res, next) {
            console.log("🔍 Route get-team-capacity appelée");
            next();
        },
        async function (req, res) {
            try {
                console.log("📊 Récupération des capacités des équipes depuis PostgreSQL...");

                // Configuration PostgreSQL
                const dbConfig = {
                    host: "localhost",
                    port: 5432,
                    database: "Farid_Test",
                    user: "postgres",
                    password: "postgres",
                };

                // Fonction pour exécuter une requête SQL
                const runQuery = async (query) => {
                    // Utiliser un fichier temporaire pour éviter les problèmes avec les guillemets dans le shell
                    const tmpQueryFile = `/tmp/query_${Date.now()}.sql`;

                    // Écrire la requête dans un fichier temporaire
                    fs.writeFileSync(tmpQueryFile, query);

                    // Exécuter psql avec le fichier
                    const command = `PGPASSWORD=${dbConfig.password} psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -t -f ${tmpQueryFile}`;

                    console.log("🔍 Exécution de la requête SQL");
                    const { stdout, stderr } = await execAsync(command);

                    // Supprimer le fichier temporaire
                    fs.unlinkSync(tmpQueryFile);

                    if (stderr && !stderr.includes("NOTICE")) {
                        console.error("STDERR:", stderr);
                    }

                    // Parse le résultat ligne par ligne
                    const lines = stdout.trim().split('\n').filter(line => line.trim());
                    const result = [];

                    for (const line of lines) {
                        const parts = line.trim().split('|').map(p => p.trim());
                        if (parts.length >= 5) {
                            result.push(parts);
                        }
                    }

                    return result;
                };

                // Récupérer les données de team_ressources
                const query = `SELECT tr."idteam", t."name" as team_name, t."libelle" as team_libelle, SUM(tr."capacityBySkillset") as total_capacity, COUNT(tr."idressource") as resource_count FROM team_ressources tr JOIN team t ON tr."idteam" = t."id" GROUP BY tr."idteam", t."name", t."libelle" ORDER BY tr."idteam"`;

                const results = await runQuery(query);
                console.log("📋 Résultats bruts:", JSON.stringify(results));

                // Convertir en format JSON avec les capacités par équipe
                const teamsData = results
                    .filter(row => row && row[0] && row[0].trim() !== '')
                    .map(row => ({
                        idteam: row[0],
                        team_name: row[1] || '',
                        team_libelle: row[2] || '',
                        total_capacity: parseFloat(row[3] || 0),
                        resource_count: parseInt(row[4] || 0)
                    }));

                console.log("✅ Capacités récupérées:", teamsData.length, "équipes");
                console.log("📊 Données:", JSON.stringify(teamsData));

                // Générer les données journalières (14 jours à partir du 01/01/2025)
                const startDate = new Date('2025-01-01');
                const daysCount = 14;
                const dailyData = [];

                for (let day = 0; day < daysCount; day++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + day);
                    const dateStr = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

                    teamsData.forEach(team => {
                        dailyData.push({
                            date: dateStr,
                            team_id: team.idteam,
                            total_capacity: team.total_capacity,
                            max_load: team.total_capacity / 10 // Diviser par 10 pour max_load
                        });
                    });
                }

                console.log("📅 Données journalières générées:", dailyData.length, "lignes");
                res.status(200).send({ teams: teamsData, daily: dailyData });
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des capacités:", error);
                res.status(500).send({ error: error.message });
            }
        }
    );
};

