import list from "../services/list.js";
import read from "../services/read.js";

/**
 * GET /api/jira-team-check?worldId=X&boardId=Y
 *
 * Structure réelle VW :
 *   Position { boardId, objectId }  →  Object { _id=objectId, data }
 *
 * On lit les positions du board, puis les objets correspondants,
 * et on extrait les valeurs uniques de data.team.
 */
export default (express) => {
    express.get("/api/jira-team-check", async (req, res) => {
        try {
            const { worldId, boardId } = req.query;
            if (!worldId || !boardId) {
                return res.status(400).json({ error: "worldId and boardId are required" });
            }

            // 1. Récupérer toutes les positions du board
            const positions = await list.alive({
                database: worldId,
                collection: "Position",
                document: [{ boardId }],
            });

            if (!positions.length) {
                return res.json({ teamIds: [], jobIds: [], objectCount: 0 });
            }

            // 2. Récupérer les objets correspondants
            const objectIds = positions.map((p) => ({ _id: p.objectId }));
            const objects = await read.alive({
                database: worldId,
                collection: "Object",
                document: objectIds,
            });

            // 3. Extraire les valeurs uniques de data.team
            const teamIdSet = new Set();

            for (const obj of objects) {
                const d = obj.data;
                if (!d) continue;
                if (d.team !== undefined && d.team !== null && String(d.team).trim() !== "") {
                    teamIdSet.add(String(d.team).trim());
                }
            }

            res.json({
                teamIds: Array.from(teamIdSet).filter(Boolean).sort(),
                objectCount: objects.length,
                positionCount: positions.length,
            });
        } catch (error) {
            console.error("[JIRA TEAM CHECK]", error);
            res.status(500).json({ error: error.message });
        }
    });
};