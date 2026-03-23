import Express from "express";
import update from "../services/update.js";
import read from "../services/read.js";
import getUserTag from "../utils/get-user-tag.js";
import log from "../utils/log.js";

export default async (express) => {
  express.put(
    "/api/position-update", // ?worldId=:worldId&boardId=:boardId
    function (req, res, next) {
      if (req.me.request.includes("position-alive/update-front") || req.me.request.includes("position-alive/update-back")) {
        next();
      } else {
        res.status(401).send({ success: false, error: "Unauthorized" });
      }
    },
    Express.json(),
    async function (req, res) {
      try {
        const { document } = req.body;
        const currentUserId = getUserTag(req, req.query);
        const { worldId, boardId } = req.query;

        if (!worldId || !boardId) {
          return res.status(400).send({ success: false, error: "Missing worldId or boardId" });
        }

        if (!Array.isArray(document) || document.length === 0) {
          return res.status(400).send({ success: false, error: "Document must be a non-empty array" });
        }

        // Add boardId to each position
        document.forEach((position) => {
          position.boardId = boardId;
        });

        // Update positions in database
        const updatedPositionId = await update.many(
          {
            database: worldId,
            collection: "Position",
            document,
            currentUserId,
          },
          {
            "protect.isBackground": false, // Default to front layer
          }
        );

        // Read updated positions
        const updatedPosition = await read.alive({
          database: worldId,
          collection: "Position",
          document: updatedPositionId,
        });

        // Remove boardId from response
        updatedPosition.forEach((position) => {
          delete position.boardId;
        });

        res.status(200).send({ 
          success: true, 
          data: updatedPosition 
        });

      } catch (error) {
        log.errorController(
          req.me?.identity?.email || "unknown",
          "position-update",
          req.query,
          req.body,
          error
        );
        res.status(400).send({ success: false, error: error.message });
      }
    }
  );
};
