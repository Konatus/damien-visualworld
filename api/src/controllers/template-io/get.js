import room from "../../rooms/index.js";
import log from "../../utils/log.js";

import list from "../../services/list.js";

export default async (socket, scope, request) => {
  try {
    let templates = (
      (await list.alive({
        database: scope.worldId,
        collection: "Board",
      })) || []
    ).filter((item) => item.state);
    templates = templates.map((template) => ({
      _id: template._id,
      private: template.private,
      data: template.data,
      state: {
        [template.state.latest]: template.state[template.state.latest],
        latest: template.state.latest,
      },
    }));
    return room.templateIoGet.emit(
      socket,
      scope,
      [
        {
          _id: scope.worldId,
          data: {
            version: "1.0",
            VW: {
              templates,
            },
          },
        },
      ],
      { me: true, others: false }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "template-io/get",
      scope,
      request,
      error
    );
  }
};
