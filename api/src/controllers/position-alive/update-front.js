import update from "./shared/update.js";

export default async (socket, scope, request) => {
  update(socket, scope, request, { isBackground: false });
};
