import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import MongoId from "../../utils/mongo-id.js";
import upsert from "../../services/upsert.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    for (let layer of ["foreground", "background"]) {
      if (Array.isArray(document.data[layer])) {
        for (let component of document.data[layer]) {
          component.componentId = MongoId(component.componentId);
        }
      }
    }

    const upsertedId = await upsert.one({
      database: scope.worldId,
      collection: "BoardComponent",
      document,
      currentUserId,
    });

    const upsertedDock = await read.alive({
      database: scope.worldId,
      collection: "BoardComponent",
      document: [upsertedId],
    });

    const reformedBoardComponentList = [];
    upsertedDock.forEach((item) => {
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
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-component/set",
      scope,
      request,
      error
    );
  }
};
