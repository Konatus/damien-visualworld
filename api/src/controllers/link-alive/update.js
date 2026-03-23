import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import update from "../../services/update.js";
import read from "../../services/read.js";
import list from "../../services/list.js";
import objectLinked from "./shared/object-linked.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    let objectlinkToBeCreated = document.map((link) => link.objects);
    objectlinkToBeCreated = [].concat.apply([], objectlinkToBeCreated); // Flatify

    await update.many({
      database: scope.worldId,
      collection: "ObjectLink",
      document: objectlinkToBeCreated,
      currentUserId,
    });

    //link
    const updateLinkId = await update.many({
      database: scope.worldId,
      collection: "Link",
      document,
      currentUserId,
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

    const updatedLink = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document: updateLinkId,
    });

    await objectLinked({
      link: updatedLink,
      objectLink,
      position,
      socket,
      scope,
    });

    room.linkAlive.emit(socket, scope, updatedLink, {
      me: request.reply,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-alive/update",
      scope,
      request,
      error
    );
  }
};
