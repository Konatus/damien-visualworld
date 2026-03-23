import room from "../../../rooms/index.js";
import log from "../../../utils/log.js";
import getUserTag from "../../../utils/get-user-tag.js";

import remove from "../../../services/remove.js";
import read from "../../../services/read.js";

import removeCompletely from "../remove-completely.js";
import VW_models from "../../../vw-objects.js";

export default async (socket, scope, request, { isBackground }) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const readPositions = await read.alive({
      database: scope.worldId,
      collection: "Position",
      document,
    });

    // Remove completely jira objects
    const [jiraComponentId] = VW_models()
      .filter((item) => item.data.jiraModel)
      .map((item) => item._id);
    const removeCompletelyPosition = readPositions
      .filter((item) => item.componentId && item.componentId == jiraComponentId)
      .map((item) => ({ _id: item._id.toString() }));

    if (removeCompletelyPosition.length) {
      await removeCompletely(socket, scope, {
        document: removeCompletelyPosition,
      });
    }

    await remove.many(
      {
        database: scope.worldId,
        collection: "Position",
        document: readPositions
          .filter(
            (item) =>
              item.componentId == undefined ||
              item.componentId != jiraComponentId
          )
          .map((item) => ({ _id: item._id })),
        currentUserId,
      },
      {
        "protect.isBackground": isBackground,
      }
    );

    const removedPositionAlive = await read.alive({
      database: scope.worldId,
      collection: "Position",
      document,
    });
    const removedPositionTrash = await read.trash({
      database: scope.worldId,
      collection: "Position",
      document,
    });

    room.positionAlive.emit(socket, scope, removedPositionAlive, {
      me: true,
      others: true,
    });
    room.positionTrash.emit(socket, scope, removedPositionTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-alive/remove",
      scope,
      request,
      error
    );
  }
};
