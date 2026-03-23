import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";
import search from "../../services/search.js";
import VW_models from "../../vw-objects.js";
import translate from "../../utils/translate.js";
export default async (socket, scope, request) => {
  try {
    const { document } = request;

    let object = await search.alive({
      database: scope.worldId,
      collection: "Object",
      searchText: document.join(" "),
    });

    let componentId = (
      await list.alive({
        database: scope.worldId,
        collection: "Component",
      })
    ).map((x) => x._id.toString());
    const boardId = (
      await list.alive({
        database: scope.worldId,
        collection: "Board",
      })
    ).map((x) => x._id.toString());

    componentId = componentId.concat(
      VW_models(translate(socket))
        .filter((x) => x._id)
        .map((x) => x._id)
    );
    await Promise.all(
      object.map((rawObject) =>
        list
          .alive({
            database: scope.worldId,
            collection: "Position",
            document: {
              objectId: rawObject._id,
            },
          })
          .then((contexts) => {
            contexts = contexts.filter((context) => {
              if (context.componentId) {
                return (
                  context.componentId &&
                  context.boardId &&
                  componentId.includes(context.componentId.toString()) &&
                  boardId.includes(context.boardId.toString())
                );
              } else {
                // Object generic
                return (
                  context.boardId &&
                  boardId.includes(context.boardId.toString())
                );
              }
            });
            rawObject.context = contexts.map((context) => ({
              boardId: context.boardId,
              componentId: context.componentId,
            }));
          })
      )
    );

    object = object.filter((x) => x.context.length);

    room.objectSearch.emit(socket, scope, object, { me: true, others: false });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "object-search",
      scope,
      request,
      error
    );
  }
};
