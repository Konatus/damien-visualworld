import room from "../../rooms/index.js";

import sanitize from "./shared/sanitize.js";

import update from "../../services/update.js";
import read from "../../services/read.js";

import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

export default async (socket, scope, request) => {
  try {
    const document = sanitize(request.document);
    const currentUserId = getUserTag(socket, scope);

    const updatedUserId = await update.many({
      database: scope.worldId,
      collection: "User",
      document,
      currentUserId,
    });

    const updatedUser = await read.alive({
      database: scope.worldId,
      collection: "User",
      document: updatedUserId,
    });

    room.userAlive.emit(socket, scope, updatedUser, { me: true, others: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "user-alive/create",
      scope,
      request,
      error
    );
  }
};
