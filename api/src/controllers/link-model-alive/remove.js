import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import remove from "../../services/remove.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    /* const removedLinkModelId = */ await remove.many({
      database: scope.worldId,
      collection: "LinkModel",
      document,
      currentUserId,
    });

    const removedLinkModel = await read.alive({
      database: scope.worldId,
      collection: "LinkModel",
      document,
    });
    const removedLinkModelTrash = await read.trash({
      database: scope.worldId,
      collection: "LinkModel",
      document,
    });

    room.linkModelAlive.emit(socket, scope, removedLinkModel, {
      me: true,
      others: true,
    });
    room.linkModelTrash.emit(socket, scope, removedLinkModelTrash, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-alive/remove",
      scope,
      request,
      error
    );
  }
};
