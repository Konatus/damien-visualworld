import Express from "express";
import BoardIo from "../controllers/board-io/index.js";

export default async (express) => {
    express.get(
        "/api/calculate-capacity-nv", // ?worldId=:worldId&boardId=:boardId
        function (req, res, next) {
            console.log("🧮 Endpoint calculate-capacity-nv appelé - VRAIE logique capacite_nv.js");
            next();
        },
        async function (req, res) {
            try {
                const { worldId, boardId } = req.query;

                if (!worldId || !boardId) {
                    return res.status(400).send({ error: "Missing worldId or boardId" });
                }

                console.log(`🔍 Calcul capacité avec VRAIE logique capacite_nv.js pour board ${boardId}`);

                // Récupérer les données du tableau via l'API existante
                const boardData = await BoardIo.get(req, req.query);
                const boardInfo = boardData[0].data.VW;

                // Appliquer la VRAIE logique de capacite_nv.js
                const capacityResults = calculateCapacityExactlyLikeCapaciteNV(boardInfo);

                console.log(`✅ ${capacityResults.length} résultats de capacité calculés avec VRAIE logique`);

                res.status(200).json(capacityResults);

            } catch (error) {
                console.error('Erreur lors du calcul de capacité capacite_nv.js:', error);
                res.status(500).send({ error: "Erreur lors du calcul de capacité" });
            }
        }
    );
};

// VRAIE logique de capacite_nv.js (copiée exactement)
function calculateCapacityExactlyLikeCapaciteNV(boardInfo) {
    console.log('🧮 Application de la VRAIE logique capacite_nv.js côté serveur...');
    
    // Trouver les composants d'itération (EXACTEMENT comme capacite_nv.js)
    const iterationComponents = boardInfo.objects.filter(obj => {
        const data = obj.object?.data || {};
        return data.team || data.iteration || data.capacity;
    });
    
    console.log(`🔍 ${iterationComponents.length} composants d'itération trouvés`);
    
    if (iterationComponents.length === 0) {
        console.warn('⚠️ Aucun composant d\'itération trouvé');
        return [];
    }
    
    // Créer un map des données existantes (EXACTEMENT comme capacite_nv.js)
    const dataMap = new Map();
    iterationComponents.forEach((component, index) => {
        const data = component.object.data;
        const team = data.team || 'N/A';
        const iteration = parseInt(data.iteration) || 1;
        const maxLoad = parseFloat(data.capacity) || 0;
        const key = `${team}-${iteration}`;
        
        console.log(`DEBUG ${index + 1}: Team=${team}, Iteration=${iteration}, Capacity=${maxLoad}, Key=${key}`);
        
        if (dataMap.has(key)) {
            const existingValue = dataMap.get(key);
            console.log(`ATTENTION: Clé ${key} déjà existante avec valeur ${existingValue}`);
            // Prendre la valeur la plus élevée (EXACTEMENT comme capacite_nv.js)
            if (maxLoad > existingValue) {
                console.log(`Remplacement par valeur plus élevée: ${maxLoad}`);
                dataMap.set(key, maxLoad);
            } else {
                console.log(`Conservation de la valeur existante: ${existingValue}`);
            }
        } else {
            dataMap.set(key, maxLoad);
        }
    });
    
    console.log(`Composants trouvés: ${iterationComponents.length}`);
    console.log('Données existantes:', Array.from(dataMap.entries()));
    
    // Déterminer toutes les équipes et itérations (EXACTEMENT comme capacite_nv.js)
    const teams = new Set();
    const iterations = new Set();
    
    iterationComponents.forEach(component => {
        const data = component.object.data;
        const team = data.team || 'N/A';
        const iteration = parseInt(data.iteration) || 1;
        teams.add(team);
        iterations.add(iteration);
    });
    
    const teamList = Array.from(teams);
    const iterationList = Array.from(iterations);
    
    console.log('Équipes trouvées:', teamList);
    console.log('Itérations trouvées:', iterationList);
    
    // Générer TOUTES les combinaisons team/iteration (EXACTEMENT comme capacite_nv.js)
    const dailyResults = [];
    const iterationDuration = 14; // 14 jours par itération
    
    teamList.forEach(team => {
        iterationList.forEach(iteration => {
            const key = `${team}-${iteration}`;
            const maxLoad = dataMap.get(key) || 0; // 0 si pas de données
            
            console.log(`Team ${team}, Iteration ${iteration}, Max Load: ${maxLoad}`);
            
            const iterationStartDate = getIterationStartDate(iteration);
            const workingDaysRatio = 5 / 7; // 5 jours ouvrés sur 7
            const workingDays = iterationDuration * workingDaysRatio;
            const calculatedCapacity = maxLoad > 0 ? (maxLoad * 100) / workingDays : 0;
            
            // Générer TOUS les jours de l'itération (EXACTEMENT comme capacite_nv.js)
            for (let day = 0; day < iterationDuration; day++) {
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
    
    console.log(`Total lignes générées: ${dailyResults.length}`);
    return dailyResults;
}

// Calculer la date de début d'itération (EXACTEMENT comme capacite_nv.js)
function getIterationStartDate(iteration) {
    const baseDate = new Date('2025-01-01'); // Base 2025 comme capacite_nv.js
    const iterationDuration = 14; // 14 jours par itération
    const daysOffset = (iteration - 1) * iterationDuration;
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() + daysOffset);
    return startDate;
}
