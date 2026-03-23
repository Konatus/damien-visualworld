import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const boardGrant = await list.alive({
      database: scope.worldId,
      collection: "BoardGrant",
      document: {
        boardId: scope.boardId,
      },
    });

    room.boardGrant.emit(socket, scope, boardGrant, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-grant/list",
      scope,
      request,
      error
    );
  }
};
