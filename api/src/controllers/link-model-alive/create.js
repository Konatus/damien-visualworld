import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import insert from "../../services/insert.js";
import read from "../../services/read.js";

import deduplicateName from "../../utils/deduplicate-name.js";
import getUserTag from "../../utils/get-user-tag.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const collection = "LinkModel";
    const currentUserId = getUserTag(socket, scope);

    for (const linkModel of document) {
      await deduplicateName({
        socket,
        worldId: scope.worldId,
        collection,
        document: linkModel,
      });
    }

    const createdLinkModelId = await insert.many({
      database: scope.worldId,
      collection,
      document,
      currentUserId,
    });

    const createdLinkModel = await read.alive({
      database: scope.worldId,
      collection,
      document: createdLinkModelId,
    });

    room.linkModelAlive.emit(socket, scope, createdLinkModel, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-alive/create",
      scope,
      request,
      error
    );
  }
};
