import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    global.io.to(request.socketId).emit("connection-all/set-screen", request);
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-all/set-screen",
      scope,
      null,
      error
    );
  }
};
