import room from "../../rooms/index.js";

import restore from "../../services/restore.js";
import read from "../../services/read.js";

import sendMail from "../../emails/index.js";
import log from "../../utils/log.js";
import translate from "../../utils/translate.js";
import getUserTag from "../../utils/get-user-tag.js";
import CONF from "../../conf.js";

export default async (socket, scope, request) => {
  try {
    const { document, boardId } = request;

    await restore.many({
      database: scope.worldId,
      collection: "User",
      document,
      currentUserId: getUserTag(socket, scope),
    });

    const restoredUserAlive = await read.alive({
      database: scope.worldId,
      collection: "User",
      document,
    });
    const restoredUserTrash = await read.trash({
      database: scope.worldId,
      collection: "User",
      document,
    });
    room.userAlive.emit(socket, scope, restoredUserAlive, {
      me: true,
      others: true,
    });
    room.userTrash.emit(socket, scope, restoredUserTrash, {
      me: true,
      others: true,
    });

    if (restoredUserAlive) {
      const boardLink = boardId
        ? `/world/${scope.worldId}/board/${boardId}`
        : "";
      const email = restoredUserAlive.map((user) => user.data.email);
      const [userId] = restoredUserAlive.map((user) => user._id);
      const [userGrant] = await read.alive({
        database: scope.worldId,
        boardId,
        collection: boardId ? "BoardGrant" : "Grant",
        document: [{ userId }],
      });

      const $t = translate(socket);
      const grant = Object.keys((userGrant && userGrant.data) || {})
        .filter((grant) => userGrant.data[grant])
        .map((grant) => $t.__(`grant.${grant}`))
        .join(", ");

      sendMail(
        {
          $t,
          identity: socket.me.identity,
          email,
          scope: { ...scope, boardId },
          grant,
          link: CONF.BASE_URL + boardLink,
          view: "user",
          subject: "user",
        },
        (error) => {
          if (error) {
            return log.error(`Email ${error}`);
          }
          log.email(
            socket.me.identity.email,
            `Send e-mail to user`,
            email,
            scope
          );
        }
      );
    }
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "user-trash/restore",
      scope,
      request,
      error
    );
  }
};
