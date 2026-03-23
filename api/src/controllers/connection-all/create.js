import log from "../../utils/log.js";

import MongoId from "../../utils/mongo-id.js";
import listBoard from "./list-board.js";

export default async (socket, scope) => {
  try {
    // TODO: use services instead of directly calling the mongo's API
    await global.mgoSockets.updateOne(
      { _id: MongoId() },
      {
        // if not awaited, connection-all may not contain current socket
        $set: {
          worldId: socket.handshake.query.worldId,
          boardId: socket.handshake.query.boardId,
          socketId: socket.id,
          data: socket.me,
        },
        $currentDate: {
          "private.updatedAt": true,
        },
      },
      {
        upsert: true,
      }
    );

    listBoard(socket, scope, { reply: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-all/create",
      scope,
      null,
      error
    );
  }
};
