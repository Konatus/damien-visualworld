import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const boardsWithComponent = [];

    const { document } = request;
    const checkableComponentIds = document.map((component) => component._id);

    const components = await list.alive({
      database: scope.worldId,
      collection: "Component",
    });
    const checkableComponents = components.filter((component) =>
      checkableComponentIds.includes(component._id.toString())
    );

    let allBoards = null;
    for (let component of checkableComponents) {
      // Positions of that component in board
      const positions = await list.alive({
        database: scope.worldId,
        collection: "Position",
        document: {
          componentId: component._id,
        },
      });

      positions.forEach((position) => {
        boardsWithComponent.push(position.boardId.toString());
      });

      // Is finally component removable? or where are his objects?
      if (boardsWithComponent.length === 0) {
        component.private.removable = true;
      } else {
        if (!allBoards) {
          allBoards = await list.alive({
            database: scope.worldId,
            collection: "Board",
          });
        }
        component.private.removable = allBoards.filter((board) =>
          boardsWithComponent.includes(board._id.toString())
        );
      }
    }

    room.componentAlive.emit(socket, scope, checkableComponents, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-alive/check-remove",
      scope,
      request,
      error
    );
  }
};
