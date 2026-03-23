import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const grant = await list.alive({
      database: scope.worldId,
      collection: "Grant",
    });

    room.grant.emit(socket, scope, grant, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "grant/list",
      scope,
      request,
      error
    );
  }
};
