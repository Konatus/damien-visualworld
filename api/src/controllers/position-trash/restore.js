import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    await restore.many({
      database: scope.worldId,
      collection: "Position",
      document,
    });

    const restoredPositionAlive = await read.alive({
      database: scope.worldId,
      collection: "Position",
      document,
    });
    const restoredPositionTrash = await read.trash({
      database: scope.worldId,
      collection: "Position",
      document,
    });

    room.positionAlive.emit(socket, scope, restoredPositionAlive, {
      me: true,
      others: true,
    });
    room.positionTrash.emit(socket, scope, restoredPositionTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-trash/restore",
      scope,
      request,
      error
    );
  }
};
