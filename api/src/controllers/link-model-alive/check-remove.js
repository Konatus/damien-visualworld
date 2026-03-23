import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    const boardsWithLinkModel = [];

    const { document } = request;
    const checkableLinkModelIds = document.map((linkModel) => linkModel._id);

    const linkModels = await list.alive({
      database: scope.worldId,
      collection: "LinkModel",
    });
    const checkableLinkModels = linkModels.filter((linkModel) =>
      checkableLinkModelIds.includes(linkModel._id.toString())
    );

    let allBoards = null;
    for (let linkModel of checkableLinkModels) {
      // Links of that linkModel
      const links = await list.alive({
        database: scope.worldId,
        collection: "Link",
        document: {
          linkModelId: linkModel._id,
        },
      });
      if (!links || links.length <= 0) {
        continue;
      }

      // Objects linked with that linkModel
      const objectLinks = await list.alive({
        database: scope.worldId,
        collection: "ObjectLink",
        document: links.map((link) => ({ linkId: link._id })),
      });
      if (!objectLinks || objectLinks.length <= 0) {
        continue;
      }

      // Positions of those objects
      const positions = await list.alive({
        database: scope.worldId,
        collection: "Position",
        document: objectLinks.map((objectLink) => ({
          objectId: objectLink.objectId,
        })),
      });

      positions.forEach((position) => {
        boardsWithLinkModel.push(position.boardId.toString());
      });

      // Is finally linkModel removable? or where are his objects?
      if (boardsWithLinkModel.length === 0) {
        linkModel.private.removable = true;
      } else {
        if (!allBoards) {
          allBoards = await list.alive({
            database: scope.worldId,
            collection: "Board",
          });
        }
        linkModel.private.removable = allBoards.filter((board) =>
          boardsWithLinkModel.includes(board._id.toString())
        );
      }
    }

    room.linkModelAlive.emit(socket, scope, checkableLinkModels, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-alive/check-remove",
      scope,
      request,
      error
    );
  }
};
