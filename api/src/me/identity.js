import CONF from "../conf.js";

const DEBUG_IDENTITIES = [
  {
    email: "alupin@visual.world",
    firstname: "Arsène",
    lastname: "Lupin",
  },
  {
    email: "psernine@visual.world",
    firstname: "Paul",
    lastname: "Sernine",
  },
  {
    email: "randresy@visual.world",
    firstname: "Raoul d'",
    lastname: "Andrésy",
  },
];
let debugIdentitiesCount = 0;
let debugIdentitiesCache = {};

import read from "../services/read.js";

export default async ({ email, accessToken, userAgent }) => {
  const identity = {
    connected: new Date(),
    email: "nobody",
    firstname: "",
    lastname: "",
    terms: null,
    locale: "",
  };

  if (!CONF.IS_PRODUCTION) {
    if (!debugIdentitiesCache[userAgent]) {
      debugIdentitiesCache[userAgent] =
        DEBUG_IDENTITIES[debugIdentitiesCount % DEBUG_IDENTITIES.length];
      debugIdentitiesCount++;
    }
    Object.assign(identity, debugIdentitiesCache[userAgent]);
  } else {
    identity.email = email && email.toLowerCase();

    try {
      const accessTokenPayload = JSON.parse(
        Buffer.from(accessToken.split(".")[1], "base64").toString()
      );
      identity.firstname = accessTokenPayload.given_name;
      identity.lastname = accessTokenPayload.family_name;
      identity.locale = accessTokenPayload.locale;
      identity.userId = accessTokenPayload.sub;
    } catch (e) {
      /* Not catched */
    }
  }

  try {
    const [userAcceptedTerms] = await read.alive({
      database: "worlds",
      collection: "Users",
      document: [{ email: identity.email }],
    });
    identity.terms = userAcceptedTerms._id;
  } catch {
    /* nothing to do */
  }

  return identity;
};
