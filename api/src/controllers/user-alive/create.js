import room from "../../rooms/index.js";

import sanitize from "./shared/sanitize.js";

import insert from "../../services/insert.js";
import read from "../../services/read.js";

import sendMail from "../../emails/index.js";
import log from "../../utils/log.js";
import translate from "../../utils/translate.js";
import getUserTag from "../../utils/get-user-tag.js";
import CONF from "../../conf.js";

export default async (socket, scope, request) => {
  try {
    const document = sanitize(request.document);
    const createUser = await insert.many({
      database: scope.worldId,
      collection: "User",
      document,
      currentUserId: getUserTag(socket, scope),
    });

    const createdUser = await read.alive({
      database: scope.worldId,
      collection: "User",
      document: createUser,
    });

    //Create grant && board grant
    for (const user of document) {
      if (user.grant !== null) {
        const {
          grant,
          data: { email },
        } = user;
        grant.userId = createdUser.find(
          (createdUser) => email == createdUser.data.email
        )._id;

        const createGrant = await insert.many({
          database: scope.worldId,
          collection: grant.collection,
          document: [grant],
          user: socket.me.identity.email,
        });

        const createdGrant = await read.alive({
          database: scope.worldId,
          collection: grant.collection,
          document: createGrant,
        });

        room.grant.emit(socket, scope, createdGrant, {
          me: true,
          others: true,
        });

        room.boardGrant.emit(
          socket,
          { ...scope, boardId: grant.boardId },
          createdGrant,
          { me: true, others: true }
        );
      }
    }

    const $t = translate(socket);
    createdUser
      .filter((user) => !user.data.guestOriginalEmail)
      .map((user) => user.data.email)
      .forEach((email) => {
        const [user] = document.filter((user) => user.data.email === email);
        const boardLink = user.boardId
          ? `/world/${scope.worldId}/board/${user.boardId}`
          : "";

        const grant = Object.keys(user.grant.data)
          .filter((grant) => user.grant.data[grant])
          .map((grant) => $t.__(`grant.${grant}`))
          .join(", ");

        sendMail(
          {
            $t,
            identity: socket.me.identity,
            email,
            scope: { ...scope, boardId: user.boardId },
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
      });

    room.userAlive.emit(socket, scope, createdUser, { me: true, others: true });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "user-alive/create",
      scope,
      request,
      error
    );
  }
};
