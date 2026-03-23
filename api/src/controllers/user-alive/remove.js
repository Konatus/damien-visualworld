import room from "../../rooms/index.js";

import remove from "../../services/remove.js";
import read from "../../services/read.js";
import update from "../../services/update.js";

import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import updateGrant from "../grant/update.js";
import updateBoardGrant from "../board-grant/update.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentUserId = getUserTag(socket, scope);

    /* const removedUserId = */ await remove.many({
      database: scope.worldId,
      collection: "User",
      document,
      currentUserId,
    });

    const boardGrant = await read.alive({
      database: scope.worldId,
      collection: "BoardGrant",
      document: document.map((item) => ({ userId: item._id })),
    });

    const worldGrant = await read.alive({
      database: scope.worldId,
      collection: "Grant",
      document: document.map((item) => ({ userId: item._id })),
    });

    // Reset user grants
    updateGrant(socket, scope, {
      document: worldGrant.map(({ _id }) => ({
        _id,
        data: { modeler: false, administrator: false },
      })),
    });
    updateBoardGrant(socket, scope, {
      document: boardGrant.map(({ _id }) => ({
        _id,
        data: { animator: false, observer: false, participant: false },
      })),
    });

    /* const updatedBoardGrantId = */ await update.many({
      database: scope.worldId,
      collection: "BoardGrant",
      document,
      currentUserId,
    });

    const removedUserAlive = await read.alive({
      database: scope.worldId,
      collection: "User",
      document,
    });
    // const removedUserTrash = await read.trash({
    //   database: scope.worldId,
    //   collection: 'User',
    //   document,
    // })

    room.userAlive.emit(socket, scope, removedUserAlive, {
      me: true,
      others: true,
    });
    // room.userTrash.emit(
    //   socket,
    //   scope,
    //   removedUserTrash,
    //   { me: true, others: true }
    // )
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "user-alive/remove",
      scope,
      request,
      error
    );
  }
};
