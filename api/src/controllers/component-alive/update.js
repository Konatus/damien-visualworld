import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import update from "../../services/update.js";
import read from "../../services/read.js";

import deduplicateName from "../../utils/deduplicate-name.js";
import getUserTag from "../../utils/get-user-tag.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const collection = "Component";
    const currentUserId = getUserTag(socket, scope);

    for (const component of document) {
      await deduplicateName({
        socket,
        worldId: scope.worldId,
        collection,
        document: component,
      });
    }

    const updatedComponentId = await update.many({
      database: scope.worldId,
      collection,
      document,
      currentUserId,
    });

    const updatedComponent = await read.alive({
      database: scope.worldId,
      collection,
      document: updatedComponentId,
    });

    room.componentAlive.emit(socket, scope, updatedComponent, {
      me: request.reply,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-alive/update",
      scope,
      request,
      error
    );
  }
};
