import room from "../../../rooms/index.js";

import insert from "../../../services/insert.js";
import read from "../../../services/read.js";

import boardGrant from "../../board-grant/index.js";

import deduplicateName from "../../../utils/deduplicate-name.js";
import getUserTag from "../../../utils/get-user-tag.js";

export default async (socket, scope, request, { templatedBy }) => {
  const { document } = request;
  const collection = "Board";
  const currentUserId = getUserTag(socket, scope);

  for (const board of document) {
    await deduplicateName({
      worldId: scope.worldId,
      collection,
      document: board,
    });

    if (templatedBy) {
      if (!board.private) board.private = {};
      board.private.templatedBy = templatedBy;
    } /* else { */
    // TODO: is it relevant to keep it for templates ?
    // Default parameters & naming
    board.data.enableObjectCreation = true;
    board.data.enableObjectDuplication = true;
    board.data.enableObjectEdition = true;
    board.data.enableObjectResize = true;
    board.data.enableObjectDeletion = true;
    board.data.enableObjectModelChange = true;
    board.data.displayDefaultModel = true;
    board.data.gridEnabled = false;
    board.data.gridX = 10;
    board.data.gridY = 10;
    board.data.snapRadius = 10;
    board.data.snapBorder = true;
    board.data.snapHorizontalAxis = true;
    board.data.snapVerticalAxis = true;
    /* } */
  }

  const createdBoardId = await insert.many({
    database: scope.worldId,
    collection,
    document,
    currentUserId,
  });

  // Animator auto-assigned grants for created boards
  const profile = socket.me.profile;
  const hasAnimatorGrant =
    !["modeler", "administrator", "demoAdministrator", "owner"].some(
      (item) => profile.world[scope.worldId][item]
    ) && Object.values(profile.board).some((item) => item["animator"]);
  if (hasAnimatorGrant && !profile.app.isRoot) {
    const [user] = await read.alive({
      database: scope.worldId,
      collection: "User",
      document: [{ email: socket.me.identity.email }],
    });

    const request = {
      document: [
        {
          data: { observer: false, participant: false, animator: true },
          boardId: createdBoardId[0]._id,
          userId: user._id,
        },
      ],
    };
    boardGrant.create(socket, scope, request);
  }

  const createdBoard = await read.alive({
    database: scope.worldId,
    collection,
    document: createdBoardId,
  });

  room.boardAlive.emit(socket, scope, createdBoard, { me: true, others: true });
};
