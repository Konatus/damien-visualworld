import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import insert from "../../services/insert.js";

import identity from "./identity.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    const userAcceptTerms = await insert.many({
      database: "worlds",
      collection: "Users",
      document,
      currentUserId,
    });

    if (userAcceptTerms.length) {
      socket.me.identity.terms = userAcceptTerms[0]._id;
    }
    const me = identity(socket);

    room.connectionMe.emit(socket, scope, me, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-me/update",
      scope,
      request,
      error
    );
  }
};
