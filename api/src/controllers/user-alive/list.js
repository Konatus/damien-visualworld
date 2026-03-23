import room from "../../rooms/index.js";

import list from "../../services/list.js";
import read from "../../services/read.js";

import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    let user = await list.alive({
      database: scope.worldId,
      collection: "User",
    });
    const [worldData] = await read.alive({
      database: "worlds",
      collection: "Data",
      document: [
        {
          worldId: scope.worldId,
        },
      ],
    });
    // Add owner email
    user = [
      ...user,
      worldData.data.owner ? { data: { email: worldData.data.owner } } : [],
    ];
    room.userAlive.emit(socket, scope, user, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "user-alive/list",
      scope,
      request,
      error
    );
  }
};
