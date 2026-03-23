import room from "../../../rooms/index.js";

import remove from "../../../services/remove.js";
import read from "../../../services/read.js";

import getUserTag from "../../../utils/get-user-tag.js";

export default async (socket, scope, request, { templatedBy }) => {
  const { document } = request;
  const currentUserId = getUserTag(socket, scope);

  /* const removedBoardId = */ await remove.many(
    {
      database: scope.worldId,
      collection: "Board",
      document,
      currentUserId,
    },
    {
      "private.templatedBy": templatedBy ? { $ne: null } : null,
    }
  );

  const removedBoardAlive = await read.alive({
    database: scope.worldId,
    collection: "Board",
    document,
  });
  const removedBoardTrash = await read.trash({
    database: scope.worldId,
    collection: "Board",
    document,
  });

  room.boardAlive.emit(socket, scope, removedBoardAlive, {
    me: true,
    others: true,
  });
  room.boardTrash.emit(socket, scope, removedBoardTrash, {
    me: true,
    others: true,
  });
};
