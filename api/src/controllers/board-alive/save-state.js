import boardIoGet from "../board-io/get.js";

import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import update from "../../services/update.js";
import read from "../../services/read.js";

import sanitizeResponse from "./shared/sanitize-response.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    for (const board of document) {
      const json = await boardIoGet({ me: socket.me }, scope, {});
      if (!board.state) board.state = {};
      if (!board.state.latest) board.state.latest = {};
      board.state.latest = currentTimestamp;
      board.state[currentTimestamp] = {
        screenshot: board.data.screenshot,
        usedArea: board.data.usedArea,
        VW: JSON.parse(JSON.stringify(json[0].data.VW)),
        version: json[0].data.version,
      };
    }

    const updatedBoardId = await update.many({
      database: scope.worldId,
      collection: "Board",
      document,
    });

    const updatedBoard = await read.aliveFull({
      database: scope.worldId,
      collection: "Board",
      document: updatedBoardId,
    });

    room.boardAlive.emit(
      socket,
      { worldId: scope.worldId },
      sanitizeResponse(updatedBoard),
      { me: true, others: true }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/save-state",
      scope,
      request,
      error
    );
  }
};
