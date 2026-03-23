import CONF from "../../conf.js";
import StripeModule from "stripe";
const stripe = StripeModule(CONF.STRIPE_KEY);

import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import update from "../../services/update.js";
import read from "../../services/read.js";

import getUserTag from "../../utils/get-user-tag.js";

import sendMail from "../../emails/index.js";
import translate from "../../utils/translate.js";
export default async (socket, scope, request) => {
  try {
    const currentUserId = getUserTag(socket, scope);
    let { document } = request;
    document = document.map((world) => ({
      _id: world._id,
      data: world.data,
      private: world.private,
    }));

    const updatedWorldId = await update.many({
      database: "worlds",
      collection: "Data",
      document,
      currentUserId,
    });

    const updatedWorld = await read.alive({
      database: "worlds",
      collection: "Data",
      document: updatedWorldId,
    });

    updatedWorld.forEach(async (item) => {
      const [ownerEmail] = document
        .filter((world) => world._id == item._id)
        .map((world) => world.data && world.data.owner);
      if (ownerEmail) {
        try {
          await stripe.customers.update(item.private.stripeCustomerId, {
            email: ownerEmail,
          });
        } catch (e) {
          sendMail(
            {
              $t: translate(socket),
              email: ownerEmail,
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
                ownerEmail,
                scope
              );
            }
          );
        }
      }
      item._id = item.worldId;
      delete item.worldId;
      // TODO Send an email if change of owner
    });

    room.worldAlive.emit(socket, scope, updatedWorld, {
      me: request.reply,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "world-alive/update",
      scope,
      request,
      error
    );
  }
};
