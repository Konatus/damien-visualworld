import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import insert from "../../services/insert.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const createBoardGrant = await insert.many({
      database: scope.worldId,
      collection: "BoardGrant",
      document,
      currentUserId,
    });

    const createdBoardGrant = await read.alive({
      database: scope.worldId,
      collection: "BoardGrant",
      document: createBoardGrant,
    });

    room.boardGrant.emit(socket, scope, createdBoardGrant, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-grant/create",
      scope,
      request,
      error
    );
  }
};
