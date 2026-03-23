import list from "../services/list.js";
import positionAlive from "../controllers/position-alive/index.js";

import conf from "../conf.js";

export default async (express) => {
  express.delete("/api/delete-trashed-document", async (req, res) => {
    let deletedPosition = {};
    try {
      const world =
        (await list.alive({
          database: "worlds",
          collection: "Data",
        })) || [];

      const worldIds = world.map((x) => x.worldId);

      await Promise.all(
        worldIds.map(async (worldId) => {
          const positions = (
            await list.trash({
              database: worldId,
              collection: "Position",
            })
          ).filter((item) => {
            const today = new Date().getTime();
            const deletedAt = new Date(item.private.deletedAt).getTime();
            let differenceInDays = (today - deletedAt) / (1000 * 3600 * 24);
            return differenceInDays > conf.DELETE_TRASH_AFTER_DAYS;
          });

          if (positions.length) {
            const { removedPositionAlive, removedObjectAlive } =
              await positionAlive.removeCompletely(
                req,
                { worldId },
                {
                  document: positions.map((item) => ({ _id: item._id })),
                }
              );

            deletedPosition[worldId] = {
              removedPosition: removedPositionAlive.map((item) => item._id),
              removedObject: removedObjectAlive.map((item) => item._id),
            };
          }
        })
      );

      res.status(200).send(deletedPosition);
    } catch (e) {
      res.status(400).send(e);
    }
  });
};
