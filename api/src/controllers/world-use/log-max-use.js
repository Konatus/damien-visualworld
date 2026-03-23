import CONF from "../../conf.js";
import sendMail from "../../emails/index.js";
import translate from "../../utils/translate.js";
import upsert from "../../services/upsert.js";
import update from "../../services/update.js";
import read from "../../services/read.js";
import log from "../../utils/log.js";
import isEqual from "lodash.isequal";
import fromPairs from "lodash.frompairs";
export default async (
  socket,
  scope,
  worldName,
  limitReached,
  admin,
  infoLimit,
  board
) => {
  try {
    let newLimitReached = false;

    let [limitAlive] = await read.aliveFull({
      database: "worlds",
      collection: "Limit",
      document: [
        {
          worldId: scope.worldId,
        },
      ],
    });

    if (limitAlive) {
      // Do not send mail for the same limit reached
      newLimitReached = Object.keys(infoLimit).some((item) => {
        if (item == "guest" && Object.values(infoLimit.guest.used).length) {
          const infoLimiteUsed = Object.values(infoLimit["guest"].used).filter(
            (item) => item >= infoLimit["guest"].useMax
          );
          const limitAliveUsed = Object.values(
            limitAlive.data["guest"].used || {}
          ).filter((item) => item >= infoLimit["guest"].useMax);
          return infoLimiteUsed.length > limitAliveUsed.length;
        } else if (infoLimit[item].used >= infoLimit[item].useMax) {
          return !isEqual(infoLimit[item], limitAlive.data[item]);
        }
      });

      await update.many({
        database: "worlds",
        collection: "Limit",
        document: [
          {
            _id: limitAlive._id,
            data: infoLimit,
          },
        ],
      });
    } else {
      await upsert.many({
        database: "worlds",
        collection: "Limit",
        document: [
          {
            worldId: scope.worldId,
            data: infoLimit,
          },
        ],
      });
    }

    let commercialWarning = "Limit reached :";
    if (limitReached.user) {
      commercialWarning = commercialWarning.concat(" ", "users");
    }
    if (limitReached.guest.length) {
      commercialWarning = commercialWarning.concat(" ", "guest");
    }
    if (limitReached.db) {
      commercialWarning = commercialWarning.concat(" ", "db");
    }
    if (limitReached.jiraProjects) {
      commercialWarning = commercialWarning.concat(" ", "jiraProjects");
    }

    log.use(
      socket.handshake.headers["x-forwarded-for"],
      "world-use/get",
      scope,
      worldName,
      commercialWarning
    );

    if (newLimitReached) {
      const used = infoLimit.guest.used
        ? fromPairs(
            Object.entries(infoLimit.guest.used).map(([key, value]) => {
              return [
                board
                  .filter((item) => item._id == key)
                  .map((item) => item.data.name)[0],
                value,
              ];
            })
          )
        : {};

      sendMail(
        {
          $t: translate(socket),
          identity: socket.me.identity,
          username: null,
          email: admin,
          link: CONF.SUPPORT_MAIL,
          limitReached: {
            ...infoLimit,
            guest: {
              used,
              useMax: infoLimit.guest.useMax,
            },
          },
          view: "limit-reached",
          subject: "limit-reached",
          scope,
        },
        (error) => {
          if (error) {
            return log.error(`Email ${error}`);
          }
          log.email(
            socket.me.identity.email,
            `Send e-mail to admin`,
            admin,
            scope
          );
        }
      );
    }
  } catch (error) {
    log.errorController(
      socket.handshake.headers["x-forwarded-for"],
      "world-use/get",
      scope,
      worldName,
      error
    );
  }
};
