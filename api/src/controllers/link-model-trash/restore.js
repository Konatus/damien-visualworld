import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    await restore.many({
      database: scope.worldId,
      collection: "LinkModel",
      document,
    });

    const restoredLinkModelAlive = await read.alive({
      database: scope.worldId,
      collection: "LinkModel",
      document,
    });
    const restoredLinkModelTrash = await read.trash({
      database: scope.worldId,
      collection: "LinkModel",
      document,
    });

    room.linkModelAlive.emit(socket, scope, restoredLinkModelAlive, {
      me: true,
      others: true,
    });
    room.linkModelTrash.emit(socket, scope, restoredLinkModelTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-trash/restore",
      scope,
      request,
      error
    );
  }
};
