import log from "../../utils/log.js";

import listBoard from "./list-board.js";

export default async (socket, scope) => {
  try {
    global.mgoSockets.deleteOne({
      socketId: socket.id,
    });

    listBoard(socket, scope, { reply: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-all/remove",
      scope,
      null,
      error
    );
  }
};
