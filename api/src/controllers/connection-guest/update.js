import log from "../../utils/log.js";

export default async (socket, scope) => {
  try {
    await global.mgoGuest.updateOne(
      {
        socketId: socket.id,
      },
      {
        $currentDate: {
          "private.updatedAt": true,
        },
      }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-guest/update",
      scope,
      null,
      error
    );
  }
};
