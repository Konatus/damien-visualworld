import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const position = await list.alive({
      database: scope.worldId,
      collection: "Position",
      document: {
        boardId: scope.boardId,
      },
    });

    room.positionAlive.emit(socket, scope, position, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-alive/list",
      scope,
      request,
      error
    );
  }
};
