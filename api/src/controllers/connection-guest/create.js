import log from "../../utils/log.js";

import MongoId from "../../utils/mongo-id.js";

export default async (socket, scope) => {
  try {
    const cookie = socket.handshake.headers["cookie"];

    await global.mgoGuest.updateOne(
      { _id: MongoId() },
      {
        $set: {
          socketId: socket.id,
          "data.email": socket.me.identity.email,
          cookie: cookie && cookie.split("=")[1],
        },
        $currentDate: {
          "private.updatedAt": true,
        },
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-guest/create",
      scope,
      null,
      error
    );
  }
};
