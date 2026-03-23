import CONF from "../conf.js";

import Express from "express";

import axios from "axios";
import qs from "qs";
import GeneratePassword from "generate-password";

import list from "./../services/list.js";
import remove from "./../services/remove.js";
import read from "./../services/read.js";
import update from "./../services/update.js";

import { cipher, decipher } from "../utils/cipher.js";

import sendMail from "../emails/index.js";
import log from "../utils/log.js";
import translate from "../utils/translate.js";
import getUserTag from "../utils/get-user-tag.js";
import profile from "../me/profile.js";
import accessToken from "../utils/keycloak-access-token.js";
const UNAUTHORIZED_GUEST_PATH = "/static/?q=guest";

const redirectUnauthorizedGuest = async (worldId, clients, email, res) => {
  const [user] = await read.alive({
    database: worldId,
    collection: "User",
    document: [{ email }],
  });

  await update.one({
    database: worldId,
    collection: "User",
    document: { _id: user._id, data: { guestUntil: new Date().toISOString() } },
  });

  clients.forEach((item) =>
    global.io
      .to(item.socketId)
      .emit("connection-me", { redirect: UNAUTHORIZED_GUEST_PATH })
  );
  res.status(403).redirect(UNAUTHORIZED_GUEST_PATH);
};

export default async (express) => {
  express.post(
    "/api/guest", // ?worldId=:worldId&boardId=:boardId
    function (req, res, next) {
      if (req.me.request.includes("guest/create")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    Express.json(),
    async function (req, res) {
      if (!req.body || !Array.isArray(req.body) || !req.body.length) {
        res.status(400);
      }

      const adminBearer = await accessToken();

      // Build guest access for each received e-mail
      const guestAccess = [];
      for (let guest of req.body) {
        const tmpEmail = `${guest.email}-${
          // TODO: write email first will allow alphabetic sort
          GeneratePassword.generate({
            length: 12,
            numbers: true,
            lowercase: true,
            uppercase: false,
            symbols: false,
          })
        }-tmp`;

        // Forge a token that contains encrypted password & build the link
        let password;
        let cipheredToken = "/";
        while (cipheredToken.includes("/")) {
          password = GeneratePassword.generate({
            length: 12,
            numbers: true,
            lowercase: true,
            uppercase: true,
            symbols: true,
          });
          cipheredToken = cipher(password);
        }

        // Create the user in keycloak https://logindev.visual.world/auth/admin/realms/visual-world/users
        await axios.post(
          `https://${CONF.KEYCLOAK_URI}/auth/admin/realms/${CONF.KEYCLOAK_REALM_NAME}/users`,
          {
            firstName: "",
            lastName: "",
            email: tmpEmail,
            emailVerified: true, // even if we know that's false
            enabled: true,
          },
          adminBearer
        );

        // Read the client from keycloak
        const createdUser = (
          await axios.get(
            `https://${CONF.KEYCLOAK_URI}/auth/admin/realms/${CONF.KEYCLOAK_REALM_NAME}/users?email=${tmpEmail}`,
            adminBearer
          )
        ).data[0];

        // Set temporary password for that user
        await axios.put(
          `https://${CONF.KEYCLOAK_URI}/auth/admin/realms/${CONF.KEYCLOAK_REALM_NAME}/users/${createdUser.id}/reset-password`,
          {
            type: "password",
            value: password,
            temporary: false,
          },
          adminBearer
        );

        guestAccess.push({
          email: tmpEmail,
          originalEmail: guest.email,
          token: cipheredToken,
        });

        let startDay = new Date();
        let endDay = new Date(guest.guestUntil);

        sendMail(
          {
            $t: translate(req),
            identity: req.me.identity, // { lastname, firstname }
            email: guest.email,
            scope: req.query,
            expire: Math.ceil(
              (endDay.getTime() - startDay.getTime()) / (1000 * 3600 * 24)
            ),
            link: `https://${req.headers.host}/api/guest/${encodeURIComponent(
              tmpEmail
            )}/${encodeURIComponent(cipher(password))}`,
            view: "guest",
            subject: "guest",
          },
          (error) => {
            if (error) {
              return log.error(`Email ${error}`);
            }
            log.email(
              req.me.identity.email,
              `Send e-mail to guest`,
              guest.email,
              req.query
            );
          }
        );
      }

      res.send(guestAccess);
    }
  );

  express.delete("/api/guest", async (req, res) => {
    let deletedUsers = [];
    try {
      const adminBearer = await accessToken();

      const world =
        (await list.alive({
          database: "worlds",
          collection: "Data",
        })) || [];

      const worldIds = world.map((x) => x.worldId);
      const currentUserId = getUserTag(req, req.query);

      await Promise.all(
        worldIds.map(async (worldId) => {
          const users = await list.alive({
            database: worldId,
            collection: "User",
          });

          let userIds = [];
          await Promise.all(
            users
              .filter((user) => {
                // guest users only
                return user.data.email.endsWith("-tmp");
              })
              .map(async (user) => {
                const today = new Date().getTime();
                const guestUntil = new Date(user.data.guestUntil).getTime();
                if (guestUntil < today) {
                  // Read info user from keycloak
                  const infoUser = (
                    await axios.get(
                      `https://${CONF.KEYCLOAK_URI}/auth/admin/realms/${CONF.KEYCLOAK_REALM_NAME}/users/?email=${user.data.email}`,
                      adminBearer
                    )
                  ).data[0];
                  if (infoUser) {
                    // Delete user in keycloak
                    const deletedUser = await axios.delete(
                      `https://${CONF.KEYCLOAK_URI}/auth/admin/realms/${CONF.KEYCLOAK_REALM_NAME}/users/${infoUser.id}`,
                      adminBearer
                    );
                    if (deletedUser.status === 204) {
                      // User list deleted
                      userIds.push({ _id: user._id });
                      deletedUsers.push(user.data.email);
                    }
                  }
                }
              })
          );

          // Delete users in mongo DB
          await remove.many({
            database: worldId,
            collection: "User",
            document: userIds,
            currentUserId,
          });
        })
      );
    } catch (e) {
      console.log(e);
    }
    res.status(200).send({ deletedUsers });
  });

  express.get(
    "/api/guest/:email/:token",
    function (req, res, next) {
      if (req.me.request.includes("guest/login")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    async function (req, res) {
      const email = req.params.email;
      const token = req.params.token;
      const password = decipher(token);

      const userProfile = await profile({ email });

      const [worldId] = Object.keys(userProfile.board)
        .filter(
          (item) =>
            userProfile.board[item].observer ||
            userProfile.board[item].participant
        )
        .map((item) => userProfile.board[item].worldId);

      const clients = await global.mgoGuest
        .find({
          "data.email": email,
        })
        .toArray()
        .catch((err) => {
          log.warn(err);
        });

      if (clients.length && req.headers.cookie) {
        try {
          const response = await axios.get(CONF.BASE_URL, {
            maxRedirects: 0,
            headers: {
              cookie: req.headers.cookie,
            },
          });

          if (
            response.headers["gap-auth"] === email &&
            clients.every(
              (item) => item.cookie == req.headers.cookie.split("=")[1]
            )
          ) {
            res.redirect(302, `/`);
          } else {
            redirectUnauthorizedGuest(worldId, clients, email, res);
          }
        } catch (err) {
          log.warn(err);
          redirectUnauthorizedGuest(worldId, clients, email, res);
        }
      } else if (clients.length && !req.headers.cookie) {
        redirectUnauthorizedGuest(worldId, clients, email, res);
      } else {
        // Initiate sign-in process with oauth2-proxy
        let proxyRedirect, proxyCookie;
        try {
          await axios.get(`${CONF.BASE_URL}/oauth2/sign_in`, {
            maxRedirects: 0,
          });
        } catch (e) {
          // Too many redirect: on redirection to Keycloak, let's intercept CSRF cookie
          proxyRedirect = e.response.headers.location;
          proxyCookie = e.response.headers["set-cookie"]
            .map((x) => x.split(";")[0])
            .join("; ");
        }

        // Follow sign-in redirection to Keycloak auth page
        let kcAuthData, kcAuthCookies;
        try {
          const kcAuth = await axios.get(proxyRedirect, { maxRedirects: 0 });
          kcAuthData = kcAuth.data;
          kcAuthCookies = kcAuth.headers["set-cookie"]
            .map((x) => x.split(";")[0])
            .join("; ");
        } catch (e) {
          /* Not catched */
        }

        // Extract authenticate URL from keycloak
        const kcAuthenticateUrl = `https://${CONF.KEYCLOAK_URI}/auth/realms/${CONF.KEYCLOAK_REALM_NAME}/login-actions/authenticate`;
        const kcAuthenticateUrlWithParamaters = new RegExp(
          `"(${kcAuthenticateUrl}.+?)"`,
          "gi"
        )
          .exec(kcAuthData)[1]
          .replace(/&amp;/gi, "&");

        // Authenticate on Keycloak
        let kcAuthenticateRedirect;
        try {
          await axios.post(
            kcAuthenticateUrlWithParamaters,
            qs.stringify({
              username: email,
              password: password,
            }),
            {
              maxRedirects: 0,
              headers: {
                cookie: kcAuthCookies,
              },
            }
          );
        } catch (e) {
          kcAuthenticateRedirect = e.response.headers.location;
        }

        // Callback oauth2-proxy
        let proxyCallbackCookie;
        try {
          await axios.get(kcAuthenticateRedirect, {
            maxRedirects: 0,
            headers: {
              cookie: proxyCookie,
            },
          });
        } catch (e) {
          proxyCallbackCookie = e.response.headers["set-cookie"];
        }

        // TODO: 401 if authentication failed
        // what must be checked? kcAuthenticateRedirect? proxyCallbackCookie?

        // Provide oauth2-proxy cookies to the client
        res.set("set-cookie", proxyCallbackCookie);
        // TODO: get the allowed board from database

        // Redirect to the allowed board (currently home)
        res.redirect(302, `/`);
      }
    }
  );
};
