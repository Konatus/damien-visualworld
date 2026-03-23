import remove from "./shared/remove.js";
import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    await remove(socket, scope, request, { templatedBy: false }); // await is necessary for the catch
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/remove",
      scope,
      request,
      error
    );
  }
};
