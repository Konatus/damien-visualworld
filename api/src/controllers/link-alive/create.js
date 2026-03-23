import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import list from "../../services/list.js";
import insert from "../../services/insert.js";
import read from "../../services/read.js";

import MongoId from "../../utils/mongo-id.js";
import objectLinked from "./shared/object-linked.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const position = await list.alive({
      database: scope.worldId,
      collection: "Position",
    });

    document.forEach((link) => {
      link._id = MongoId();
      link.object.forEach((objectlink) => {
        objectlink.linkId = link._id;
      });
    });
    const linkToBeCreated = document.map((link) => ({
      _id: link._id,
      data: link.data,
      linkModelId: link.linkModelId,
    }));

    let objectlinkToBeCreated = document.map((link) => link.object);
    objectlinkToBeCreated = [].concat.apply([], objectlinkToBeCreated); // Flatify

    await insert.many({
      database: scope.worldId,
      collection: "Link",
      document: linkToBeCreated,
      currentUserId,
    });

    await insert.many({
      database: scope.worldId,
      collection: "ObjectLink",
      document: objectlinkToBeCreated,
      currentUserId,
    });

    const createdLink = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document,
    });

    for (let item of createdLink) {
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

    await objectLinked({ link: createdLink, position, socket, scope });

    createdLink.forEach(
      (link) => (link.private.creating = socket.me.identity.email)
    );

    // TODO: emit to other boards where link is visible
    room.linkAlive.emit(socket, scope, createdLink, { me: true, others: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-alive/create",
      scope,
      request,
      error
    );
  }
};
