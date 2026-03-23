import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import deduplicateName from "../../utils/deduplicate-name.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";
import update from "../../services/update.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    await restore.many({
      database: scope.worldId,
      collection: "Component",
      document,
    });

    const justRestored = await read.alive({
      database: scope.worldId,
      collection: "Component",
      document,
    });
    let toBeRenamed = justRestored.map((component) => {
      return deduplicateName({
        socket,
        worldId: scope.worldId,
        collection: "Component",
        document: component,
      });
    });
    toBeRenamed = await Promise.all(toBeRenamed);
    await update.many({
      database: scope.worldId,
      collection: "Component",
      document: toBeRenamed,
    });

    const restoredComponentAlive = await read.alive({
      database: scope.worldId,
      collection: "Component",
      document,
    });
    const restoredComponentTrash = await read.trash({
      database: scope.worldId,
      collection: "Component",
      document,
    });

    room.componentAlive.emit(socket, scope, restoredComponentAlive, {
      me: true,
      others: true,
    });
    room.componentTrash.emit(socket, scope, restoredComponentTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-trash/restore",
      scope,
      request,
      error
    );
  }
};
