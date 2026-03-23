import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import countBy from "lodash.countby";
import MongoId from "../../utils/mongo-id.js";
import objectLinked from "./shared/object-linked.js";

import list from "../../services/list.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const position = await list.alive({
      database: scope.worldId,
      collection: "Position",
      document: {
        boardId: scope.boardId,
      },
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

    const rawLinkId = countBy(objectLink, (item) => item.linkId);
    const linkId = [];
    for (let id in rawLinkId) {
      if (rawLinkId[id] >= 2) {
        linkId.push({ _id: MongoId(id) });
      }
    }

    const link = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document: linkId,
    });

    await objectLinked({ link, objectLink, position, socket, scope });

    room.linkAlive.emit(socket, scope, link, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-alive/list",
      scope,
      request,
      error
    );
  }
};
