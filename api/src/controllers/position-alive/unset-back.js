import setLayer from "./shared/set-layer.js";

export default async (socket, scope, request) => {
  setLayer(socket, scope, request, { isBackground: false });
};
