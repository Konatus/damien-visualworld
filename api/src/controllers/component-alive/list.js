import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";
import VW_models from "../../vw-objects.js";
import translate from "../../utils/translate.js";

export default async (socket, scope, request) => {
  try {
    const customComponents = await list.alive({
      database: scope.worldId,
      collection: "Component",
    });

    const components = customComponents.concat(VW_models(translate(socket)));

    room.componentAlive.emit(socket, scope, components, {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-alive/list",
      scope,
      request,
      error
    );
  }
};
