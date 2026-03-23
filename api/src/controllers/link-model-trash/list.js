import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const linkModel = await list.trash({
      database: scope.worldId,
      collection: "LinkModel",
    });

    room.linkModelTrash.emit(socket, scope, linkModel, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-trash/list",
      scope,
      request,
      error
    );
  }
};
