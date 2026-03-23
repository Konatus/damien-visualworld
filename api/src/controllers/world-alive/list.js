import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const world =
      (await list.alive({
        database: "worlds",
        collection: "Data",
      })) || [];

    world.forEach((item) => {
      item._id = item.worldId;
      delete item.worldId;
    });

    room.worldAlive.emit(socket, scope, world, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "world-alive/list",
      scope,
      request,
      error
    );
  }
};
