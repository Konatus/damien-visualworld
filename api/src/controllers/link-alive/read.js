import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import read from "../../services/read.js";
import list from "../../services/list.js";
import objectLinked from "./shared/object-linked.js";
export default async (socket, scope, request) => {
  try {
    const { document } = request;

    const link = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document,
    });

    const position = await list.alive({
      database: scope.worldId,
      collection: "Position",
    });

    const objectId = position
      .filter((item) => item.objectId)
      .map((item) => ({
        objectId: item.objectId,
      }));

    const objectLink = await list.alive({
      database: scope.worldId,
      collection: "ObjectLink",
      document: objectId,
    });

    await objectLinked({ link, objectLink, position, socket, scope });

    // Group by board
    const boards = [];
    for (let item of position) {
      const links = link.filter((link) => {
        return link.objects
          .map((objects) => objects.objectId.toString())
          .includes(item.objectId.toString());
      });

      if (links.length && boards.indexOf(item.boardId.toString()) === -1) {
        boards.push(item.boardId.toString());
      }
    }

    // TODO: retrieve ObjectLink list
    for (let boardId of boards) {
      room.linkAlive.emit(socket, { worldId: scope.worldId, boardId }, link, {
        me: true,
        others: true,
      });
    }
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-alive/read",
      scope,
      request,
      error
    );
  }
};
