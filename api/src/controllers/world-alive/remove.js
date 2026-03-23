import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import remove from "../../services/remove.js";
import read from "../../services/read.js";

import getUserTag from "../../utils/get-user-tag.js";

export default async (socket, scope, request) => {
  try {
    let { document } = request;
    document = document.map((item) => ({
      worldId: item.worldId || item._id,
    }));
    const currentUserId = getUserTag(socket);

    await remove.many({
      database: "worlds",
      collection: "Data",
      document,
      currentUserId,
    });

    const removedWorldAlive = await read.alive({
      database: "worlds",
      collection: "Data",
      document,
    });
    const removedWorldTrash = await read.trash({
      database: "worlds",
      collection: "Data",
      document,
    });

    removedWorldAlive.forEach((item) => {
      item._id = item.worldId;
      delete item.worldId;
    });
    removedWorldTrash.forEach((item) => {
      item._id = item.worldId;
      delete item.worldId;
    });

    room.worldAlive.emit(socket, scope, removedWorldAlive, {
      me: true,
      others: true,
    });
    room.worldTrash.emit(socket, scope, removedWorldTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "world-alive/remove",
      scope,
      request,
      error
    );
  }
};
