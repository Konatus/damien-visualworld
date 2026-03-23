import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import insert from "../../services/insert.js";
import read from "../../services/read.js";

import deduplicateName from "../../utils/deduplicate-name.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const collection = "Component";
    const currentUserId = getUserTag(socket, scope);

    for (const component of document) {
      component.data.defaultModel = false;
      await deduplicateName({
        socket,
        worldId: scope.worldId,
        collection,
        document: component,
      });
    }

    const createdComponentId = await insert.many({
      database: scope.worldId,
      collection,
      document,
      currentUserId,
    });

    const createdComponent = await read.alive({
      database: scope.worldId,
      collection,
      document: createdComponentId,
    });

    room.componentAlive.emit(socket, scope, createdComponent, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-alive/create",
      scope,
      request,
      error
    );
  }
};
