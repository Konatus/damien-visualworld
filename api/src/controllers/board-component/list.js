import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const boardComponentList = await read.alive({
      database: scope.worldId,
      collection: "BoardComponent",
      document: [
        {
          _id: scope.boardId,
        },
      ],
    });

    const reformedBoardComponentList = [];
    boardComponentList.forEach((item) => {
      if (item.data.foreground) {
        reformedBoardComponentList.push(
          ...item.data.foreground.map((x) => ({
            data: {
              componentId: x.componentId,
              rank: x.rank,
              isBackground: false,
            },
          }))
        );
      }
      if (item.data.background) {
        reformedBoardComponentList.push(
          ...item.data.background.map((x) => ({
            data: {
              componentId: x.componentId,
              rank: x.rank,
              isBackground: true,
            },
          }))
        );
      }
    });

    room.boardComponent.emit(socket, scope, reformedBoardComponentList, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-component/list",
      scope,
      request,
      error
    );
  }
};
