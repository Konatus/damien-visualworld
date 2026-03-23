import create from "./shared/create.js";

export default async (socket, scope, request) => {
  create(socket, scope, request, { isBackground: false });
};
