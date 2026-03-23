import create from "./shared/create.js";
import log from "../../utils/log.js";

export default async (socket, scope, request) => {
  try {
    await create(socket, scope, request, {}); // await is necessary for the catch
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-alive/create",
      scope,
      request,
      error
    );
  }
};
