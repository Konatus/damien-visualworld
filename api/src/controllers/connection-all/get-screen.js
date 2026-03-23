import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    // Find the people to be joined
    const clients = await global.mgoSockets
      .find({
        worldId: scope.worldId,
        boardId: scope.boardId,
        "data.identity.email": request.data.email,
      })
      .toArray()
      .catch((err) => {
        log.warn(err);
      });

    // Ask their screen position to targetted clients
    for (let client of clients) {
      global.io.to(client.socketId).emit("connection-all/get-screen", {
        document: {
          socketId: socket.id,
        },
      });
    }
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-all/get-screen",
      scope,
      null,
      error
    );
  }
};
