import Express from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async (express) => {
    express.get(
        "/api/check-database",
        function (req, res, next) {
            console.log("🔍 Route check-database appelée");
            next();
        },
        async function (req, res) {
            try {
                console.log("📊 Vérification de la base de données PostgreSQL...");

                // Récupérer les valeurs attendues depuis les paramètres de la requête
                const expectedPhases = parseInt(req.query.expectedPhases) || 3;
                const expectedPriorities = parseInt(req.query.expectedPriorities) || 5;
                const expectedTeams = parseInt(req.query.expectedTeams) || 1;

                console.log(`Valeurs attendues - Phases: ${expectedPhases}, Priorités: ${expectedPriorities}, Teams: ${expectedTeams}`);

                // Configuration PostgreSQL
                const dbConfig = {
                    host: "localhost",
                    port: 5432,
                    database: "Farid_Test",
                    user: "postgres",
                    password: "postgres",
                };

                const results = {};

                // Fonction pour exécuter une requête SQL
                const runQuery = async (query) => {
                    const command = `PGPASSWORD=${dbConfig.password} psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -t -c "${query}"`;

                    const { stdout, stderr } = await execAsync(command);
                    if (stderr && !stderr.includes("NOTICE")) {
                        throw new Error(stderr);
                    }
                    return parseInt(stdout.trim(), 10) || 0;
                };

                // Vérifier phases avec la valeur saisie dans la modal
                try {
                    const phasesCount = await runQuery('SELECT COUNT(*) FROM phases');
                    results.phases = {
                        expected: expectedPhases,
                        actual: phasesCount,
                        is_correct: phasesCount === expectedPhases,
                    };
                } catch (error) {
                    results.phases = { error: error.message };
                }

                // Vérifier priority avec la valeur saisie dans la modal
                try {
                    const priorityCount = await runQuery('SELECT COUNT(*) FROM priority');
                    results.priority = {
                        expected: expectedPriorities,
                        actual: priorityCount,
                        is_correct: priorityCount === expectedPriorities,
                    };
                } catch (error) {
                    results.priority = { error: error.message };
                }

                // Vérifier team avec la valeur saisie dans la modal
                try {
                    const teamCount = await runQuery('SELECT COUNT(*) FROM team');
                    results.team = {
                        expected: expectedTeams,
                        actual: teamCount,
                        is_correct: teamCount === expectedTeams,
                    };
                } catch (error) {
                    results.team = { error: error.message };
                }

                console.log("✅ Vérification terminée");
                res.status(200).send(results);
            } catch (error) {
                console.error("❌ Erreur lors de la vérification:", error);
                res.status(500).send({ error: error.message });
            }
        }
    );
};

