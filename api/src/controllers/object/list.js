import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import MapImageUrl from "../../utils/map-image-url.js";

import list from "../../services/list.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    // List positions in the board, in order to get their objectId
    const position = await list.alive({
      database: scope.worldId,
      collection: "Position",
      document: {
        boardId: scope.boardId,
      },
    });
    log.info(`object/list: Found ${position.length} positions for board ${scope.boardId}`);

    // list the links whose one end is linked to an object of this board
    const objectLink = await list.alive({
      database: scope.worldId,
      collection: "ObjectLink",
      document: position.map((item) => ({
        objectId: item.objectId,
      })),
    });
    log.info(`object/list: Found ${objectLink.length} objectLinks`);
    
    const link = objectLink.length
      ? await list.alive({
          database: scope.worldId,
          collection: "ObjectLink",
          document: objectLink.map((item) => ({
            linkId: item.linkId,
          })),
        })
      : [];
    log.info(`object/list: Found ${link.length} links`);

    // Get the positioned-in or linked-with objects
    const objectId = [...position, ...link]
      .filter((item) => item.objectId)
      .map((item) => ({
        _id: item.objectId,
      }));
    const object = objectId.length
      ? (
          await read.alive({
            database: scope.worldId,
            collection: "Object",
            document: objectId,
          })
        ).map((x) => MapImageUrl(x))
      : [];

    room.object.emit(socket, scope, object, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "object/list",
      scope,
      request,
      error
    );
  }
};
