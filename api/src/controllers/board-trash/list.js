import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const board = await list.trash({
      database: scope.worldId,
      collection: "Board",
    });

    room.boardTrash.emit(socket, scope, board, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-trash/list",
      scope,
      request,
      error
    );
  }
};
