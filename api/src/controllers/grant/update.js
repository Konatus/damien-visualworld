import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import update from "../../services/update.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const updatedGrantId = await update.many({
      database: scope.worldId,
      collection: "Grant",
      document,
      currentUserId,
    });

    const updatedGrant = await read.alive({
      database: scope.worldId,
      collection: "Grant",
      document: updatedGrantId,
    });

    room.grant.emit(socket, scope, updatedGrant, { me: true, others: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "grant/update",
      scope,
      request,
      error
    );
  }
};
