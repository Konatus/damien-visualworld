import remove from "./shared/remove.js";

export default async (socket, scope, request) => {
  remove(socket, scope, request, { isBackground: true });
};
