import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";
import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    await restore.many({
      database: scope.worldId,
      collection: "Link",
      document,
    });

    const restoredLinkAlive = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document,
    });

    for (let item of restoredLinkAlive) {
      item.objects = await list.alive({
        database: scope.worldId,
        collection: "ObjectLink",
        document: [
          {
            linkId: item._id,
          },
        ],
      });
    }

    room.linkAlive.emit(socket, scope, restoredLinkAlive, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-trash/restore",
      scope,
      request,
      error
    );
  }
};
