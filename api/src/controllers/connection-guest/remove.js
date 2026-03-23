import log from "../../utils/log.js";

export default async (socket, scope) => {
  try {
    global.mgoGuest.deleteOne({
      socketId: socket.id,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-guest/remove",
      scope,
      null,
      error
    );
  }
};
