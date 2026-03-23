import log4js from "log4js";

const DEFAULT = "default";
const CONTROLLER = "controller";
const REST = "rest";
const WS = "ws";
const USE = "use";
const EMAIL = "email";
const STRIPE = "stripe";
const JIRA = "jira";

const appenders = {
  [DEFAULT]: { type: "console" },
  [CONTROLLER]: {
    type: "file",
    filename: `./logs/${CONTROLLER}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
  [REST]: {
    type: "file",
    filename: `./logs/${REST}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
  [WS]: {
    type: "file",
    filename: `./logs/${WS}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
  [USE]: {
    type: "file",
    filename: `./logs/${USE}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
  [EMAIL]: {
    type: "file",
    filename: `./logs/${EMAIL}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
  [STRIPE]: {
    type: "file",
    filename: `./logs/${STRIPE}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
  [JIRA]: {
    type: "file",
    filename: `./logs/${JIRA}.log`,
    maxLogSize: 10485760,
    backups: 10,
    keepFileExt: true,
  },
};
const categories = {
  [DEFAULT]: { appenders: [DEFAULT], level: "info" },
  [CONTROLLER]: { appenders: [DEFAULT, CONTROLLER], level: "info" },
  [REST]: { appenders: [DEFAULT, REST], level: "info" },
  [WS]: { appenders: [DEFAULT, WS], level: "info" },
  [USE]: { appenders: [DEFAULT, USE], level: "info" },
  [EMAIL]: { appenders: [DEFAULT, EMAIL], level: "info" },
  [STRIPE]: { appenders: [DEFAULT, STRIPE], level: "info" },
  [JIRA]: { appenders: [DEFAULT, JIRA], level: "info" },
};
log4js.configure({ appenders, categories });

const sanitizeScope = (scope) => {
  if (typeof scope === "object") {
    delete scope.EIO;
    delete scope.transport;
    return JSON.stringify(scope);
  }
};

const sanitizeQuery = (query) => {
  const maxSize = 2500;

  try {
    let stringified = JSON.stringify(query);
    let sanitized =
      stringified.length <= maxSize
        ? stringified
        : JSON.stringify(query).substring(0, maxSize - 1) + "…";
    return sanitized;
  } catch (e) {
    return "";
  }
};
const profile = (socket) => {
  const { worldId, boardId } = socket.handshake.query;
  let grantLevel = [];
  if (socket.me.profile.app.isRoot) {
    return "root";
  }

  if (worldId) {
    const profile = socket.me.profile.world[worldId] || {};
    grantLevel = grantLevel.concat(
      Object.keys(profile).filter((item) => profile[item])
    );
  }

  if (boardId) {
    const profile = socket.me.profile.board[boardId] || {};
    grantLevel = grantLevel.concat(
      Object.keys(profile).filter((item) => profile[item])
    );
  }

  if (grantLevel.includes("owner")) {
    return "owner";
  }
  if (grantLevel.includes("administrator")) {
    return "administrator";
  }
  if (grantLevel.includes("modeler")) {
    return "modeler";
  }
  if (grantLevel.includes("animator")) {
    return "animator";
  }
  if (grantLevel.includes("participant")) {
    return "participant";
  }
  if (grantLevel.includes("observer")) {
    return "observer";
  }

  return "unknown";
};

export default {
  DEFAULT,
  CONTROLLER,
  REST,
  WS,
  USE,
  EMAIL,
  STRIPE,
  JIRA,

  trace(str, category = null) {
    log4js.getLogger(category).trace(str);
  },
  debug(str, category = null) {
    log4js.getLogger(category).debug(str);
  },
  info(str, category = null) {
    log4js.getLogger(category).info(str);
  },
  warn(str, category = null) {
    log4js.getLogger(category).warn(str);
  },
  error(str, category = null) {
    log4js.getLogger(category).error(str);
  },
  fatal(str, category = null) {
    log4js.getLogger(category).fatal(str);
    process.exit(1);
  },

  // Incoming queries - simple REST requests & socket.io handshakes
  rest(req, res) {
    log4js.getLogger(REST).info(
      req.me.identity.email,
      req.method,
      req.originalUrl, // req._parsedUrl.pathname,
      // sanitizeScope( req.query )
      res.statusCode
    );
  },
  handshake(socket) {
    log4js.getLogger(REST).info(
      socket.me.identity.email,
      socket.handshake.query.transport,
      socket.handshake.url, // socket.handshake.url.split('?')[ 0 ],
      // sanitizeScope( socket.handshake.query )
      profile(socket),
      socket.id
    );
  },

  // Socket request
  socket(socket, eventName, query) {
    log4js
      .getLogger(WS)
      .info(
        socket.id,
        eventName,
        sanitizeScope(socket.handshake.query),
        sanitizeQuery(query)
      );
  },

  // Use
  use(email, socketName, scope, worldName, limitReached) {
    log4js
      .getLogger(USE)
      .info(email, socketName, sanitizeScope(scope), worldName, limitReached);
  },

  // EMAIL
  email(admin, eventName, email, scope) {
    log4js.getLogger(EMAIL).info(admin, eventName, email, sanitizeScope(scope));
  },
  // STRIPE
  stripe(email, eventName) {
    log4js.getLogger(STRIPE).info(email, eventName);
  },
  //JIRA
  jira(email, scope, eventName) {
    log4js.getLogger(JIRA).info(email, sanitizeScope(scope), eventName);
  },
  // Error handling
  errorController(email, socketName, scope, query, error) {
    log4js
      .getLogger(CONTROLLER)
      .error(
        email,
        socketName,
        sanitizeScope(scope),
        sanitizeQuery(query),
        error
      );
  },
  errorStripe(error) {
    log4js.getLogger(STRIPE).error(error);
  },
  errorJira(email, eventName, scope, error) {
    log4js.getLogger(JIRA).error(email, eventName, scope, error);
  },
};
