import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import createDb from "../../services/create-db.js";
import insert from "../../services/insert.js";
import read from "../../services/read.js";

import sendMail from "../../emails/index.js";
import translate from "../../utils/translate.js";
import getUserTag from "../../utils/get-user-tag.js";
import CONF from "../../conf.js";

export default async (socket, scope, request) => {
  try {
    const { document, email } = request;
    const currentUserId = getUserTag(socket);

    // TODO : check if a transaction is necessary, I guess yes
    // and also default parameters
    for await (const item of document) {
      const worldId = await createDb(email && CONF.WORLD_TEMPLATE_ID);
      item._id = worldId;
      item.worldId = worldId.toString(); // Because old DB name may be different of document id in "worlds" DB
      item.data.rootable = true;
      Object.assign(item.private, { expiredAt: null });
      if (email) {
        item.data.owner = email;
      }
    }

    const createdWorldId = await insert.many({
      database: "worlds",
      collection: "Data",
      document,
      currentUserId,
    });
    // end of transaction

    const createdWorld = await read.alive({
      database: "worlds",
      collection: "Data",
      document: createdWorldId,
    });
    for await (const item of createdWorld) {
      item._id = item.worldId;
      delete item.worldId;

      sendMail(
        {
          $t: translate(socket),
          // identity: { lastname, firstname },
          email: item.data.owner,
          link: CONF.BASE_URL,
          view: "owner",
          subject: "owner",
        },
        (error) => {
          if (error) {
            return log.error(`Email ${error}`);
          }
          log.email(
            socket.me.identity.email,
            `Send e-mail to owner`,
            email,
            scope
          );
        }
      );
    }

    if (socket.emit && !socket.emit()) {
      const [world] = createdWorld;
      return world._id;
    }
    room.worldAlive.emit(socket, scope, createdWorld, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "world-alive/create",
      scope,
      request,
      error
    );
  }
};
