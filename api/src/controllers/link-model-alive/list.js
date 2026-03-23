import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

import VW_Linkmodels from "../../vw-link.js";
import translate from "../../utils/translate.js";
export default async (socket, scope, request) => {
  try {
    const customLinkModel = await list.alive({
      database: scope.worldId,
      collection: "LinkModel",
    });

    // Add VW link model
    const linkModel = customLinkModel.concat(VW_Linkmodels(translate(socket)));

    room.linkModelAlive.emit(socket, scope, linkModel, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "link-model-alive/list",
      scope,
      request,
      error
    );
  }
};
