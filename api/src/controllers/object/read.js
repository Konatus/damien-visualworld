import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import MapImageUrl from "../../utils/map-image-url.js";

import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    const object = (
      await read.alive({
        database: scope.worldId,
        collection: "Object",
        document,
      })
    ).map((x) => MapImageUrl(x));

    room.object.emit(socket, scope, object, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "object/read",
      scope,
      request,
      error
    );
  }
};
