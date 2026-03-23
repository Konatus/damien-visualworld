import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";
import removeCompletely from "../../services/remove-completely.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    const positionAlive = await list.alive({
      database: scope.worldId,
      collection: "Position",
    });

    const positionTrash = await list.trash({
      database: scope.worldId,
      collection: "Position",
    });

    const objectIds = positionAlive
      .filter((position) => {
        return document
          .map((item) => item._id.toString())
          .includes(position._id.toString());
      })
      .map((position) => position.objectId.toString());

    // Counts positions linked to objects
    const positionCountByObject = {};

    positionAlive
      .map((position) => position.objectId)
      .forEach((objectId) => {
        if (objectIds.includes(objectId.toString())) {
          if (positionCountByObject[objectId]) {
            positionCountByObject[objectId]++;
          } else {
            positionCountByObject[objectId] = 1;
          }
        }
      });

    let completelyObjectIdRemove = Object.keys(positionCountByObject).filter(
      (objectId) => positionCountByObject[objectId] < 2
    );

    // Filter objects without position in board
    const objectIdTrashed = positionTrash
      .filter((position) => {
        return (
          document
            .map((item) => item._id.toString())
            .includes(position._id.toString()) &&
          !positionAlive
            .map((position) => position.objectId.toString())
            .includes(position.objectId.toString())
        );
      })
      .map((position) => position.objectId);

    completelyObjectIdRemove = completelyObjectIdRemove.concat(objectIdTrashed);

    let removedPositionAlive =
      (await removeCompletely.many({
        database: scope.worldId,
        collection: "Position",
        document: document.map((item) => ({ _id: item._id })),
      })) || [];

    const removedObjectAlive = await removeCompletely.many({
      database: scope.worldId,
      collection: "Object",
      document: completelyObjectIdRemove.map((objectId) => ({ _id: objectId })),
    });

    room.positionAlive.emit(socket, scope, removedPositionAlive, {
      me: true,
      others: true,
    });

    room.object.emit(socket, scope, removedObjectAlive, {
      me: true,
      others: true,
    });

    return {
      removedPositionAlive,
      removedObjectAlive,
    };
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-alive/remove-completely",
      scope,
      request,
      error
    );
  }
};
