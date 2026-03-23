import CONF from "../conf.js";
import Express from "express";
import axios from "axios";
import log from "../utils/log.js";
import accessToken from "../utils/keycloak-access-token.js";

export default async (express) => {
  express.put(
    "/api/profile",
    function (req, res, next) {
      if (req.me.request.includes("profile/edit")) {
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
      const userId = req.me.identity.userId;
      const { firstname: firstName, lastname: lastName, locale } = req.body;
      const profile = { firstName, lastName, attributes: { locale: [locale] } };
      try {
        const editProfile = await axios.put(
          `https://${CONF.KEYCLOAK_URI}/auth/admin/realms/${CONF.KEYCLOAK_REALM_NAME}/users/${userId}`,
          profile,
          adminBearer
        );
        res.sendStatus(editProfile.status);
      } catch (error) {
        log.error(`Edit profile ${error}`);
        res.sendStatus(403);
      }
    }
  );
};
