import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import update from "../../services/update.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const updatedBoardGrantId = await update.many({
      database: scope.worldId,
      collection: "BoardGrant",
      document,
      currentUserId,
    });

    const updatedBoardGrant = await read.alive({
      database: scope.worldId,
      collection: "BoardGrant",
      document: updatedBoardGrantId,
    });

    room.boardGrant.emit(socket, scope, updatedBoardGrant, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-grant/update",
      scope,
      request,
      error
    );
  }
};
