import room from "../../rooms/index.js";

import list from "../../services/list.js";

import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    const user = await list.trash({
      database: scope.worldId,
      collection: "User",
    });

    room.userTrash.emit(socket, scope, user, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "user-trash/list",
      scope,
      request,
      error
    );
  }
};
