import { connectionMe, worldAlive, worldTrash } from "../rooms/index.js";

import ConnectionMe from "../controllers/connection-me/index.js";
import ConnectionGuest from "../controllers/connection-guest/index.js";
import WorldAlive from "../controllers/world-alive/index.js";
import WorldTrash from "../controllers/world-trash/index.js";
import CONF from "../conf.js";

export default async (socket, scope) => {
  if (
    socket.me.request.includes(`connection-me/read`) &&
    socket.me.identity.email.endsWith("-tmp")
  ) {
    ConnectionGuest.create(socket, scope);
    const checkIfSocketIsStillAlive = setInterval(async function () {
      if (socket && socket.connected) {
        ConnectionGuest.update(socket, scope);
      } else {
        ConnectionGuest.remove(socket, scope);
        clearInterval(checkIfSocketIsStillAlive);
      }
    }, CONF.SOCKET_EXPIRES_AFTER * 0.8 * 1000); // 80% of timeout, converted from seconds to milliseconds
    socket.on(`disconnect`, () => ConnectionGuest.remove(socket, scope));
  }

  if (socket.me.request.includes(`connection-me/read`)) {
    await connectionMe.join(socket, scope);
    ConnectionMe.read(socket, scope);
  }
  if (socket.me.request.includes(`connection-me/read`)) {
    socket.on(`connection-me/read`, (request) =>
      ConnectionMe.read(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`connection-me/update`)) {
    socket.on(`connection-me/update`, (request) =>
      ConnectionMe.update(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`world-alive/list`)) {
    await worldAlive.join(socket, scope);
    WorldAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`world-alive/list`)) {
    socket.on(`world-alive/list`, (request) =>
      WorldAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`world-alive/create`)) {
    socket.on(`world-alive/create`, (request) =>
      WorldAlive.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`world-alive/remove`)) {
    socket.on(`world-alive/remove`, (request) =>
      WorldAlive.remove(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`world-trash/list`)) {
    await worldTrash.join(socket, scope);
    WorldTrash.list(socket, scope);
  }
  if (socket.me.request.includes(`world-trash/list`)) {
    socket.on(`world-trash/list`, (request) =>
      WorldTrash.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`world-trash/restore`)) {
    socket.on(`world-trash/restore`, (request) =>
      WorldTrash.restore(socket, scope, request)
    );
  }
};
