import { hostname } from "os";

import me from "../me/index.js";
import log from "../utils/log.js";

import app from "./app.js";
import world from "./world.js";
import board from "./board.js";

export default async (io) => {
  const resolvedHostname = hostname();

  io.on("connection", async (socket) => {
    socket.onAny((eventName, args) => {
      log.socket(socket, eventName, args);
    });

    // Retrieve identity, profiles and grants of current user
    socket.me = await me({
      email: socket.handshake.headers["x-forwarded-email"],
      accessToken: socket.handshake.headers["x-forwarded-access-token"],
      userAgent: socket.handshake.headers["user-agent"],
      worldId: socket.handshake.query.worldId,
      boardId: socket.handshake.query.boardId,
    });

    log.handshake(socket);

    // Call the listeners
    if (!socket.handshake.query.worldId && !socket.handshake.query.boardId) {
      await app(socket, socket.handshake.query);
    }
    if (socket.handshake.query.worldId && !socket.handshake.query.boardId) {
      await world(socket, socket.handshake.query);
    }
    if (socket.handshake.query.worldId && socket.handshake.query.boardId) {
      await board(socket, socket.handshake.query);
    }
    socket.emit("$connect", {
      hostname: resolvedHostname,
    });
  });
};
