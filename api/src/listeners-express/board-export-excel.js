import Express from "express";
import XLSX from "xlsx";
import BoardIo from "../controllers/board-io/index.js";

export default async (express) => {
    express.get(
        "/api/board-export-excel", // ?worldId=:worldId&boardId=:boardId
        function (req, res, next) {
            // Mode test : désactiver complètement l'authentification
            console.log("🔓 Endpoint board-export-excel appelé - mode test");
            next();
        },
        async function (req, res) {
            try {
                const { worldId, boardId } = req.query;

                if (!worldId || !boardId) {
                    return res.status(400).send({ error: "Missing worldId or boardId" });
                }

                // Récupérer les données du tableau via l'API existante
                const boardData = await BoardIo.get(req, req.query);
                const boardInfo = boardData[0].data.VW;

                // Générer le fichier Excel
                const excelBuffer = generateExcelFile(boardInfo, req.query);

                // Définir les headers pour le téléchargement
                const boardName = `board_${boardId}`;
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${boardName}.xlsx"`);
                res.setHeader('Content-Length', excelBuffer.length);

                // Envoyer le fichier
                res.send(excelBuffer);

            } catch (error) {
                console.error('Erreur lors de l\'export Excel:', error);
                res.status(500).send({ error: "Erreur lors de la génération du fichier Excel" });
            }
        }
    );
};

function generateExcelFile(boardData, queryParams) {
    const CELL_MAX_LENGTH = 32765;

    // Formater les objets exactement comme dans le frontend
    const formattedObjects = boardData.objects.map((item) => {
        const baseObject = {
            "modèle": getComponentName(item.componentId, boardData.components),
            "x": Math.round(item.position.data.left),
            "y": Math.round(item.position.data.top),
            "l": Math.round(item.position.data.width),
            "h": Math.round(item.position.data.height),
            "z-index": Math.round(item.position.data.zIndex),
            "rotation": Math.round(item.position.data.rotation) || 0,
            "plan": item.position.protect.isBackground ? "fond" : "premier",
            "couleur de fond": item.object?.protect?.styleBackgroundColor || "",
            "couleur bordures": item.object?.protect?.styleOutlineColor || "",
            "couleur du texte": item.object?.protect?.styleColor || "",
        };

        // Ajouter les propriétés dynamiques de l'objet
        const dynamicProperties = {};
        for (const [key, value] of Object.entries(item.object.data)) {
            if (!value) {
                dynamicProperties[key] = "null";
            } else if (value?.[0]?.fileName) {
                dynamicProperties[key] = value?.[0]?.fileName;
            } else if (typeof value === 'string' && value.length > CELL_MAX_LENGTH) {
                dynamicProperties[key] = value.slice(0, CELL_MAX_LENGTH);
            } else {
                dynamicProperties[key] = value;
            }
        }

        // Calculer CALC_due_date_export spécifiquement
        const calcDueDateExport = calculateCALC_due_date_export(item, boardData);

        return { ...baseObject, ...dynamicProperties, ...calcDueDateExport };
    });

    // Formater les liens exactement comme dans le frontend
    const formattedLinks = boardData.links.map((item) => {
        const originIndex = boardData.objects.findIndex(
            (object) => object.objectId && object.objectId == item.objects[item.objects[0].data.arrowhead].objectId
        );
        const endIndex = boardData.objects.findIndex(
            (object) => object.objectId && object.objectId == item.objects[item.objects[1].data.arrowhead].objectId
        );

        return {
            "origine": 2 + originIndex,
            "cible": 2 + endIndex,
            "modèle": getLinkModelName(item.linkModelId, boardData.linkModels),
            "libellé": item.data.title || "",
            "couleur": item.data.color || "",
            "épaisseur": item.data.size || "",
            "forme": item.data.curve || "",
            "style": item.data.dash || "",
            "forme d'origine": item.objects[item.objects[0].data.arrowhead].data.type || "",
            "forme cible": item.objects[item.objects[1].data.arrowhead].data.type || "",
        };
    });

    // Créer le workbook Excel
    const wb = XLSX.utils.book_new();

    // Propriétés du workbook
    wb.Props = {
        Title: `Export Excel du tableau`,
        Author: "Visual World API",
        Application: "Visual World",
        Comments: `Export généré le ${new Date().toISOString()}`,
    };

    // Ajouter les feuilles
    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(formattedObjects),
        "Objets"
    );

    XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(formattedLinks),
        "Liens"
    );

    // Générer le buffer Excel
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function getComponentName(componentId, components) {
    const component = components.find(c => c._id === componentId);
    return component ? component.data.name : "Composant inconnu";
}

function getLinkModelName(linkModelId, linkModels) {
    const linkModel = linkModels.find(lm => lm._id === linkModelId);
    return linkModel ? linkModel.data.name : "Modèle inconnu";
}

function calculateCALC_due_date_export(item, boardData) {
    try {
        console.log(`🗓️ Calcul CALC_due_date_export pour objet ${item.positionId || item.objectId}`);
        
        // 1. Vérifier si l'objet a déjà une due_date_export directe
        if (item.object?.data?.due_date_export) {
            return { 'CALC_due_date_export': item.object.data.due_date_export };
        }
        
        // 2. Chercher dans les liens parent pour hériter de due_date_export
        const parentLinks = boardData.links.filter(link => {
            return link.objects && 
                   link.objects.length >= 2 && 
                   link.objects[1] && 
                   link.objects[1].objectId === item.objectId &&
                   (link.linkModelId === '56575f706172656e74303030' || // ID du modèle parent
                    getLinkModelName(link.linkModelId, boardData.linkModels).toLowerCase().includes('parent'));
        });

        if (parentLinks.length > 0) {
            const parentLink = parentLinks[0];
            const parentObjectId = parentLink.objects[0].objectId;
            const parentObject = boardData.objects.find(obj => obj.objectId === parentObjectId);
            
            if (parentObject?.object?.data?.due_date_export) {
                console.log(`📎 due_date_export hérité du parent ${parentObjectId}`);
                return { 'CALC_due_date_export': parentObject.object.data.due_date_export };
            }
        }
        
        // 3. Fallback : utiliser due_date si due_date_export n'existe pas
        if (item.object?.data?.due_date) {
            console.log(`📅 Fallback vers due_date`);
            return { 'CALC_due_date_export': item.object.data.due_date };
        }
        
        // 4. Chercher due_date dans le parent
        if (parentLinks.length > 0) {
            const parentLink = parentLinks[0];
            const parentObjectId = parentLink.objects[0].objectId;
            const parentObject = boardData.objects.find(obj => obj.objectId === parentObjectId);
            
            if (parentObject?.object?.data?.due_date) {
                console.log(`📅 due_date hérité du parent ${parentObjectId}`);
                return { 'CALC_due_date_export': parentObject.object.data.due_date };
            }
        }
        
        console.log(`⚠️ Aucune due_date_export trouvée pour l'objet`);
        return {};
        
    } catch (error) {
        console.error(`❌ Erreur lors du calcul CALC_due_date_export:`, error);
        return { 'CALC_due_date_export_error': error.message };
    }
}
