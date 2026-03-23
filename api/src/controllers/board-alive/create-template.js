import create from "./shared/create.js";
import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    // await is necessary for the catch
    await create(socket, scope, request, {
      templatedBy: {
        user: socket.me.identity.email,
        worldId: scope.worldId,
      },
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/create-template",
      scope,
      request,
      error
    );
  }
};
