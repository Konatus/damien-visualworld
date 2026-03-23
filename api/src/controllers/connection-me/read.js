import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import identity from "./identity.js";
export default async (socket, scope, request) => {
  try {
    const me = identity(socket);

    room.connectionMe.emit(socket, scope, me, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-me/read",
      scope,
      request,
      error
    );
  }
};
