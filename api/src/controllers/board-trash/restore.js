import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    await restore.many({
      database: scope.worldId,
      collection: "Board",
      document,
    });

    const restoredBoardAlive = await read.alive({
      database: scope.worldId,
      collection: "Board",
      document,
    });
    const restoredBoardTrash = await read.trash({
      database: scope.worldId,
      collection: "Board",
      document,
    });

    room.boardAlive.emit(socket, scope, restoredBoardAlive, {
      me: true,
      others: true,
    });
    room.boardTrash.emit(socket, scope, restoredBoardTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-trash/restore",
      scope,
      request,
      error
    );
  }
};
