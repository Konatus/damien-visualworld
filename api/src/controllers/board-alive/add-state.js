import boardIoSet from "../board-io/set/index.js";

import log from "../../utils/log.js";

import read from "../../services/read.js";

export default async (socket, scope, request) => {
  try {
    const { document } = request;

    const templateFullData = await read.aliveFull({
      database: scope.worldId,
      collection: "Board",
      document,
    });
    for (const templateLoad of document) {
      const templateDefinition = templateFullData.find(
        (item) => item._id.toString() === templateLoad._id
      );
      const timestamp = templateDefinition.state.latest;
      const VW = templateDefinition.state[timestamp].VW;
      const usedArea = templateDefinition.state[timestamp].usedArea;

      const offset = {
        left: templateLoad.data.left - usedArea.left - usedArea.width / 2,
        top: templateLoad.data.top - usedArea.top - usedArea.height / 2,
        zIndex: templateLoad.data.zIndex - usedArea.under,
      };
      for (let object of VW.objects) {
        object.position.data.left += offset.left;
        object.position.data.top += offset.top;
        object.position.data.zIndex += offset.zIndex;
      }

      await boardIoSet(socket, scope, {
        document: {
          VW,
          options: {
            flushForeground: false,
            flushBackground: false,
            importForeground: true,
            importBackground: true,
            importLinks: true,
            updateModel: false,
            useNewObjectId: true,
          },
        },
      });

      // emits are done by boardIoSet
    }
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/add-state",
      scope,
      request,
      error
    );
  }
};
