import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";

// TODO: test integration
export default async (socket, scope, request) => {
  try {
    const { document } = request;

    await restore.many({
      database: "worlds",
      collection: "Data",
      document,
    });

    const restoredWorldAlive = await read.alive({
      database: "worlds",
      collection: "Data",
      document,
    });
    const restoredWorldTrash = await read.trash({
      database: "worlds",
      collection: "Data",
      document,
    });

    restoredWorldAlive.forEach((item) => {
      item._id = item.worldId;
      delete item.worldId;
    });
    restoredWorldTrash.forEach((item) => {
      item._id = item.worldId;
      delete item.worldId;
    });

    room.worldAlive.emit(socket, scope, restoredWorldAlive, {
      me: true,
      others: true,
    });
    room.worldTrash.emit(socket, scope, restoredWorldTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "world-trash/restore",
      scope,
      request,
      error
    );
  }
};
