import log from "../../utils/log.js";

export default async (socket, scope) => {
  try {
    await global.mgoSockets.updateOne(
      {
        socketId: socket.id,
      },
      {
        $currentDate: {
          "private.updatedAt": true,
        },
      }
    );

    // Nothing is sent to users, since the socket is still connected
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-all/update",
      scope,
      null,
      error
    );
  }
};
