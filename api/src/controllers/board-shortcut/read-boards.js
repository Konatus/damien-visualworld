import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";
import aggregate from "../../services/aggregate.js";

export default async (socket, scope, request) => {
  try {
    // Optimize processing
    // Security rely on filtered response by room.emit
    const boards =
      socket.me.response !== true
        ? socket.me.response
        : (
            await list.alive({
              database: scope.worldId,
              collection: "Board",
            })
          ).filter((board) => !board.private.templatedBy);

    let positionsAndZIndexMaxForEachAllowedBoard = [];
    for (const board of boards) {
      positionsAndZIndexMaxForEachAllowedBoard.push({
        _id: board._id,
        name: board.data.name,
        objectIds: (
          await list.alive({
            database: scope.worldId,
            collection: "Position",
            document: {
              boardId: board._id,
            },
          })
        ).map((position) => position.objectId),
        zIndexMax:
          (await aggregate.one({
            database: scope.worldId,
            collection: "Position",
            selector: {
              cursor: "$max",
              boardId: board._id,
            },
            path: "data.zIndex",
          })) || 1,
      });
    }

    room.boardShortcut.emit(
      socket,
      scope,
      [{ data: positionsAndZIndexMaxForEachAllowedBoard }],
      { me: true, others: false }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-shortcut:read-boards",
      scope,
      request,
      error
    );
  }
};
