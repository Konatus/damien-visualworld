import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

import sanitizeResponse from "./shared/sanitize-response.js";

export default async (socket, scope, request) => {
  try {
    const boards = await list.alive({
      database: scope.worldId,
      collection: "Board",
    });

    room.boardAlive.emit(socket, scope, sanitizeResponse(boards), {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/list",
      scope,
      request,
      error
    );
  }
};
