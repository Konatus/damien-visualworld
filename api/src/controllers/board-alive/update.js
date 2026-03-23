import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import deduplicateName from "../../utils/deduplicate-name.js";
import getUserTag from "../../utils/get-user-tag.js";

import update from "../../services/update.js";
import read from "../../services/read.js";
import list from "../../services/list.js";

import sanitizeResponse from "./shared/sanitize-response.js";
import jiraSync from "./shared/jira-sync.js";

export default async (socket, scope, request) => {
  try {
    let [limit] = await list.alive({
      database: "worlds",
      collection: "Limit",
      document: [{ worldId: scope.worldId }],
    });

    const { document } = request;
    const collection = "Board";
    const currentUserId = getUserTag(socket, scope);

    if (
      !(
        limit &&
        limit.data["jira-project"].used >= limit.data["jira-project"].useMax
      )
    ) {
      await jiraSync(socket, scope, document);
    }

    for (const board of document) {
      await deduplicateName({
        worldId: scope.worldId,
        collection,
        document: board,
      });
    }

    const updatedBoardId = await update.many({
      database: scope.worldId,
      collection,
      document,
      currentUserId,
    });

    const updatedBoard = await read.aliveFull({
      database: scope.worldId,
      collection,
      document: updatedBoardId,
    });

    room.boardAlive.emit(
      socket,
      { worldId: scope.worldId },
      sanitizeResponse(updatedBoard),
      { me: request.reply, others: true }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/update",
      scope,
      request,
      error
    );
  }
};
