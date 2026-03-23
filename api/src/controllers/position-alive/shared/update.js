import room from "../../../rooms/index.js";
import log from "../../../utils/log.js";
import getUserTag from "../../../utils/get-user-tag.js";

import update from "../../../services/update.js";
import read from "../../../services/read.js";

export default async (socket, scope, request, { isBackground }) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    let updatedPosition = [];
    const isCalcOrVwUpdate = document.some(
      (position) =>
        position.protect && (position.protect.CALC || position.protect.VW)
    );
    if (isCalcOrVwUpdate) {
      // TODO: remove and use another ressource

      document.forEach((position) => {
        position.boardId = scope.boardId;
      });

      await update.many({
        database: scope.worldId,
        collection: "Position",
        document,
        currentUserId,
      });

      updatedPosition = document;
    } else if (request.reply) {
      document.forEach((position) => {
        position.boardId = scope.boardId;
      });

      const updatedPositionId = await update.many(
        {
          database: scope.worldId,
          collection: "Position",
          document,
          currentUserId,
        },
        {
          "protect.isBackground": isBackground,
        }
      );

      updatedPosition = await read.alive({
        database: scope.worldId,
        collection: "Position",
        document: updatedPositionId,
      });
    } else {
      updatedPosition = document;
      updatedPosition.forEach((position) => {
        position.private = Object.assign(
          {
            updating: socket.me.identity.email,
          },
          position.private
        );
      });
    }

    updatedPosition.forEach((position) => {
      delete position.boardId;
    });

    room.positionAlive.emit(socket, scope, updatedPosition, {
      me: request.reply,
      others: true,
      volatile: !request.reply && !isCalcOrVwUpdate,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-alive/update",
      scope,
      request,
      error
    );
  }
};
