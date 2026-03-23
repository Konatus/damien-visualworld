import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import insert from "../../services/insert.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const createGrant = await insert.many({
      database: scope.worldId,
      collection: "Grant",
      document,
      currentUserId,
    });

    const createdGrant = await read.alive({
      database: scope.worldId,
      collection: "Grant",
      document: createGrant,
    });

    room.grant.emit(socket, scope, createdGrant, { me: true, others: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "grant/create",
      scope,
      request,
      error
    );
  }
};
