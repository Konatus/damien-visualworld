import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import update from "../../services/update.js";

import get from "./get.js";

export default async (socket, scope, request) => {
  try {
    const currentUserId = getUserTag(socket, scope);
    let { document } = request;
    document = document.map((world) => ({
      _id: world._id,
      private: {
        useMaxDbSize: world.private.useMaxDbSize,
        useMaxGuest: world.private.useMaxGuest,
        useMaxUser: world.private.useMaxUser,
        useMaxJiraProjects: world.private.useMaxJiraProjects,
      },
    }));

    /* const updatedWorldId = */ await update.many({
      database: "worlds",
      collection: "Data",
      document,
      currentUserId,
    });

    get(socket, scope, request);
  } catch (error) {
    log.errorController(
      socket.handshake.headers["x-forwarded-for"],
      "world-use/set",
      scope,
      request,
      error
    );
  }
};
