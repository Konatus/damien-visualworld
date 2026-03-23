import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const position = await list.trash({
      database: scope.worldId,
      collection: "Position",
      document: {
        boardId: scope.boardId,
      },
    });

    room.positionTrash.emit(socket, scope, position, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-trash/list",
      scope,
      request,
      error
    );
  }
};
