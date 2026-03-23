const https = require('https');
const http = require('http');
const XLSX = require('xlsx');

class CapacityCalculator {
    constructor() {
        this.iterationDuration = 14; // durée d'une itération en jours
    }

    async getBoardData(apiUrl) {
        return new Promise((resolve, reject) => {
            const protocol = apiUrl.startsWith('https') ? https : http;
            protocol.get(apiUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            }).on('error', (error) => {
                reject(new Error(`HTTP error: ${error.message}`));
            });
        });
    }

    findIterationComponents(boardData) {
        const objects = boardData?.VW?.objects || [];
        console.log(`Total objets dans la board: ${objects.length}`);

        // Chercher tous les objets avec capacity, team et iteration (plus flexible)
        const iterationComponents = objects.filter(obj => {
            const data = obj?.object?.data;
            const hasCapacity = data && data.capacity !== undefined && data.capacity !== null;
            const hasTeam = data && data.team !== undefined && data.team !== null;
            const hasIteration = data && data.iteration !== undefined && data.iteration !== null;

            return hasCapacity && hasTeam && hasIteration;
        });

        console.log(`Composants avec capacity/team/iteration trouves: ${iterationComponents.length}`);

        // Debug: afficher tous les composants trouvés
        iterationComponents.forEach((comp, index) => {
            const data = comp.object.data;
            const componentName = data?.VW?.componentName || 'Unknown';
            console.log(`Composant ${index + 1}: Team=${data.team}, Iteration=${data.iteration}, Capacity=${data.capacity}, Type=${componentName}`);
        });

        return iterationComponents;
    }

    getIterationStartDate(iteration) {
        const baseDate = new Date('2025-01-01');
        const daysOffset = (iteration - 1) * this.iterationDuration;
        const startDate = new Date(baseDate);
        startDate.setDate(baseDate.getDate() + daysOffset);
        return startDate;
    }

    processData(boardData) {
        const iterationComponents = this.findIterationComponents(boardData);

        // Créer un map des données existantes (prendre la valeur la plus élevée en cas de doublon)
        const dataMap = new Map();
        iterationComponents.forEach((component, index) => {
            const data = component.object.data;
            const team = data.team || 'N/A';
            const iteration = parseInt(data.iteration) || 1;
            const maxLoad = data.capacity || 0;
            const key = `${team}-${iteration}`;

            console.log(`DEBUG ${index + 1}: Team=${team}, Iteration=${iteration}, Capacity=${maxLoad}, Key=${key}`);

            if (dataMap.has(key)) {
                const existingValue = dataMap.get(key);
                console.log(`ATTENTION: Cle ${key} deja existante avec valeur ${existingValue}`);
                // Prendre la valeur la plus élevée
                if (maxLoad > existingValue) {
                    console.log(`Remplacement par valeur plus elevee: ${maxLoad}`);
                    dataMap.set(key, maxLoad);
                } else {
                    console.log(`Conservation de la valeur existante: ${existingValue}`);
                }
            } else {
                dataMap.set(key, maxLoad);
            }
        });

        console.log(`Composants trouves: ${iterationComponents.length}`);
        console.log('Donnees existantes:', Array.from(dataMap.entries()));

        // Déterminer toutes les équipes et itérations
        const teams = new Set();
        const iterations = new Set();

        iterationComponents.forEach(component => {
            const data = component.object.data;
            teams.add(data.team);
            iterations.add(parseInt(data.iteration));
        });

        const teamList = Array.from(teams).sort((a, b) => parseInt(a) - parseInt(b));
        const iterationList = Array.from(iterations).sort((a, b) => a - b);

        console.log(`Equipes: ${teamList.join(', ')}`);
        console.log(`Iterations: ${iterationList.join(', ')}`);

        const dailyResults = [];

        // Générer TOUTES les combinaisons team/iteration
        teamList.forEach(team => {
            iterationList.forEach(iteration => {
                const key = `${team}-${iteration}`;
                const maxLoad = dataMap.get(key) || 0; // 0 si pas de données

                console.log(`Team ${team}, Iteration ${iteration}, Max Load: ${maxLoad}`);

                const iterationStartDate = this.getIterationStartDate(iteration);
                const workingDaysRatio = 5 / 7;
                const workingDays = this.iterationDuration * workingDaysRatio;
                const calculatedCapacity = maxLoad > 0 ? (maxLoad * 100) / workingDays : 0;

                for (let day = 0; day < this.iterationDuration; day++) {
                    const currentDate = new Date(iterationStartDate);
                    currentDate.setDate(iterationStartDate.getDate() + day);
                    const dateStr = currentDate.toISOString().split('T')[0];

                    dailyResults.push({
                        date: dateStr,
                        team_id: team,
                        iteration: iteration,
                        total_capacity: Math.round(calculatedCapacity),
                        max_load: maxLoad
                    });
                }
            });
        });

        console.log(`Total lignes generees: ${dailyResults.length}`);
        return dailyResults;
    }

    saveToXLSX(results, filename = 'capacity_data.xlsx') {
        // Créer un nouveau workbook
        const workbook = XLSX.utils.book_new();

        // Convertir les données en worksheet
        const worksheet = XLSX.utils.json_to_sheet(results);

        // Ajouter le worksheet au workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Capacity Data');

        // Sauvegarder le fichier
        XLSX.writeFile(workbook, filename);

        console.log(`Fichier XLSX sauvegarde: ${filename}`);
        console.log(`Nombre de lignes: ${results.length}`);
    }

    async run(apiUrl) {
        try {
            console.log('Recuperation des donnees...');
            const boardData = await this.getBoardData(apiUrl);

            console.log('Traitement des donnees...');
            const results = this.processData(boardData);

            // Sauvegarder en XLSX
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `capacity_${timestamp}.xlsx`;
            this.saveToXLSX(results, filename);

        } catch (error) {
            console.error('ERREUR:', error.message);
        }
    }
}

const API_URL = 'http://213.165.95.153:8080/api/board-io?worldId=68b70d885688a422d9513890&boardId=690a1d27ee300fc9f6ee5ae9';

if (require.main === module) {
    const calculator = new CapacityCalculator();
    calculator.run(API_URL);
}

module.exports = CapacityCalculator;