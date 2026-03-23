import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const component = await list.trash({
      database: scope.worldId,
      collection: "Component",
    });

    room.componentTrash.emit(socket, scope, component, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-trash/list",
      scope,
      request,
      error
    );
  }
};
