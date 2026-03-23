import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";
import update from "../../services/update.js";
import metaTag from "../../utils/meta-tag.js";
import getUserTag from "../../utils/get-user-tag.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    // If is valid url, add a meta tag to the data

    if (request.reply) {
      await metaTag(document);
    }

    // TODO: avoid update in database if reply is false?
    const updatedObjectId = await update.many({
      database: scope.worldId,
      collection: "Object",
      document,
      currentUserId,
    });

    // Positions of that object
    let position = await Promise.all(
      updatedObjectId.map((x) =>
        list.alive({
          database: scope.worldId,
          collection: "Position",
          document: { objectId: x._id },
        })
      )
    );
    position = [].concat.apply([], position); // Flatify

    // Group by board
    const objectByBoard = {};
    for (let item of position) {
      if (!objectByBoard[item.boardId]) {
        objectByBoard[item.boardId] = [];
      }
      objectByBoard[item.boardId].push({
        ...document.find((x) => x._id.toString() === item.objectId.toString()),
        private: { updating: socket.me.identity.email },
      });
    }

    // Emit by board
    for (let boardId in objectByBoard) {
      room.object.emit(
        socket,
        { worldId: scope.worldId, boardId },
        objectByBoard[boardId],
        { me: request.reply, others: true, volatile: !request.reply }
      );
    }
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "object/update",
      scope,
      request,
      error
    );
  }
};
