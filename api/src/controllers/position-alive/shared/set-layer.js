import room from "../../../rooms/index.js";
import log from "../../../utils/log.js";
import getUserTag from "../../../utils/get-user-tag.js";

import update from "../../../services/update.js";
import read from "../../../services/read.js";

export default async (socket, scope, request, { isBackground }) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const toBeUpdated = document.map((position) => ({
      _id: position._id,
      protect: {
        isBackground,
      },
    }));

    const updatedPositionId = await update.many({
      database: scope.worldId,
      collection: "Position",
      document: toBeUpdated,
      currentUserId,
    });

    const updatedPosition = await read.alive({
      database: scope.worldId,
      collection: "Position",
      document: updatedPositionId,
    });

    updatedPosition.forEach((position) => {
      delete position.boardId;
    });
    room.positionAlive.emit(socket, scope, updatedPosition, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-alive/set-layer",
      scope,
      request,
      error
    );
  }
};
