"use strict";

// Global objects provided:
// - mgo, the Mongo client,
// - mgoSockets, a Mongo collection dedicated to persist live data,
// - http, the HTTP server,
// - express, the express server,
// - io, the Socket.IO server.

// CONFIG
import CONF from "./conf.js";

// Library dependencies
import Express from "express";
import MongoDB from "mongodb";
import { Server as SocketIO } from "socket.io";
import { createAdapter } from "@socket.io/mongo-adapter";

// Self dependencies
import ListenersExpress from "./listeners-express/index.js";
import ListenersSocketIo from "./listeners-socket-io/index.js";
import log from "./utils/log.js";

// Log process events
import process from "process";
process.on("unhandledRejection", (reason) => {
  log.warn(reason);
});

// Start process:
// - establish connection to MongoDB server,
// - start Express HTTP & Socket.IO servers.
const startProcess = setInterval(async () => {
  // Exit if start process has been already completed
  if (global.mgo && global.http && global.io) {
    return clearInterval(startProcess);
  }

  // Mongo DB
  if (!global.mgo) {
    try {
      const mgoUrl =
        CONF.MGO_USERNAME && CONF.MGO_PASSWORD
          ? `mongodb://${CONF.MGO_USERNAME}:${CONF.MGO_PASSWORD}@${CONF.MGO_URI}:${CONF.MGO_PORT}/?replicaSet=rs0`
          : `mongodb://root:password123@${CONF.MGO_URI}:${CONF.MGO_PORT}/?replicaSet=rs0&authSource=admin`;
      const mgoCon = await MongoDB.MongoClient.connect(mgoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 50,
        socketTimeoutMS: 0, // 0 = pas de timeout pour les ChangeStreams
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      // World list
      if (!mgoCon.db("worlds").collection("Data")) {
        await mgoCon.db("worlds").createCollection("Data");
        mgoCon
          .db("worlds")
          .collection("Data")
          .createIndex({ worldId: 1 }, { unique: true });
      }

      // Connected guest list
      global.mgoGuest = mgoCon.db("realtime").collection("Guest");
      if (!global.mgoGuest) {
        global.mgoGuest = await mgoCon.db("realtime").createCollection("Guest");
        global.mgoGuest.createIndex({ socketId: 1 });
        global.mgoGuest.createIndex(
          { "private.updatedAt": 1 },
          { expireAfterSeconds: CONF.SOCKET_EXPIRES_AFTER }
        );
      }

      // Connected socket list
      global.mgoSockets = mgoCon.db("realtime").collection("Sockets");
      if (!global.mgoSockets) {
        global.mgoSockets = await mgoCon
          .db("realtime")
          .createCollection("Sockets");
        global.mgoSockets.createIndex({ socketId: 1 });
        global.mgoSockets.createIndex({ boardId: 1 });
        global.mgoSockets.createIndex(
          { "private.updatedAt": 1 },
          { expireAfterSeconds: CONF.SOCKET_EXPIRES_AFTER }
        );
      }

      // Connect / disconnect log
      mgoCon.on("close", () => {
        log.fatal(`Disconnected from Mongo`);
      });
      log.info(`Connected to Mongo on ${CONF.MGO_URI}:${CONF.MGO_PORT}`);

      global.mgo = mgoCon;
    } catch (err) {
      return log.warn(err);
    }
  }

  // Express HTTP
  if (!global.http) {
    try {
      global.express = Express();
      global.http = await global.express.listen(CONF.SELF_PORT);
      log.info(
        `Express HTTP server is listening on http://localhost:${CONF.SELF_PORT}`
      );
      ListenersExpress(global.express);
    } catch (err) {
      return log.fatal(err);
    }
  }

  // Socket.IO
  if (!global.io) {
    try {
      global.io = new SocketIO(global.http, {
        maxHttpBufferSize: CONF.SOCKET_MAX_SIZE,
      });
      log.info(
        `SocketIO server is listening on http://localhost:${CONF.SELF_PORT}/socket.io`
      );

      // Connection between Socket.io & MongoDB
      let adapterCollection = global.mgo.db("realtime").collection("Adapter");
      if (!adapterCollection) {
        adapterCollection = await global.mgo
          .db("realtime")
          .createCollection("Adapter", {
            capped: true,
            size: 1e6,
          });
      }
      global.io.adapter(createAdapter(adapterCollection));
      log.info(`SocketIO/MongoAdapter is up`);

      // Call SocketIO listeners
      ListenersSocketIo(global.io);
    } catch (err) {
      return log.fatal(err);
    }
  }
}, 500);
