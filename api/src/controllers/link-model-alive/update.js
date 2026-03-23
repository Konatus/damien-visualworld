import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import update from "../../services/update.js";
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

    const updatedLinkModelId = await update.many({
      database: scope.worldId,
      collection,
      document,
      currentUserId,
    });

    const updatedLinkModel = await read.alive({
      database: scope.worldId,
      collection,
      document: updatedLinkModelId,
    });

    room.linkModelAlive.emit(socket, scope, updatedLinkModel, {
      me: request.reply,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-alive/update",
      scope,
      request,
      error
    );
  }
};
