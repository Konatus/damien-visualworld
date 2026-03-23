import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";
import linked from "../../services/linked-object.js";

export default async (socket, scope, request) => {
  const { document } = request || {};
  try {
    let linkIds;
    if (document) {
      // linkIds = document
    } else {
      const position = await list.alive({
        database: scope.worldId,
        collection: "Position",
        document: {
          boardId: scope.boardId,
        },
      });

      const objectLinks = await list.alive({
        database: scope.worldId,
        collection: "ObjectLink",
      });

      linkIds = objectLinks
        .filter((objectLink) =>
          position
            .map((x) => x.objectId.toString())
            .includes(objectLink.objectId.toString())
        )
        .map((object) => object.linkId);
    }

    const objectLinked = await Promise.all(
      linkIds.map((linkId) =>
        linked({
          database: scope.worldId,
          collection: "Link",
          linkId,
        })
      )
    );
    room.linkedObject.emit(
      socket,
      scope,
      objectLinked // Format and remove duplicates data
        .flat()
        .filter(
          ({ _id }, index, objectLinked) =>
            !objectLinked
              .map((object) => object._id.toString())
              .includes(_id.toString(), index + 1)
        ),
      { me: true, others: false }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "linked-object",
      scope,
      request,
      error
    );
  }
};
