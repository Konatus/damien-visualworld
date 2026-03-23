import room from "../../rooms/index.js";

import updateKey from "../../services/update-key.js";
import read from "../../services/read.js";

import getUserTag from "../../utils/get-user-tag.js";

export default async (socket, scope, request) => {
  const { document } = request;
  const currentUserId = getUserTag(socket, scope);

  for (let doc of document) {
    await updateKey({
      database: scope.worldId,
      collection: "Position",
      selection: {
        objectId: doc.objectId,
      },
      set: {
        componentId: doc.componentId,
      },
      currentUserId,
    });
  }

  const updatedPosition = await read.alive({
    database: scope.worldId,
    collection: "Position",
    document: document.map((x) => ({
      objectId: x.objectId,
    })),
  });

  for (let item of updatedPosition) {
    room.positionAlive.emit(
      socket,
      {
        worldId: scope.worldId,
        boardId: item.boardId,
      },
      [item],
      { me: item.boardId == scope.boardId, others: true }
    );
  }
};
