import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import remove from "../../services/remove.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    await remove.many({
      database: scope.worldId,
      collection: "Link",
      document,
      currentUserId,
    });

    const removedLink = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document,
    });

    room.linkAlive.emit(socket, scope, removedLink, { me: true, others: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-alive/remove",
      scope,
      request,
      error
    );
  }
};
