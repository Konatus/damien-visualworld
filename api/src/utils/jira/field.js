import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

export async function getField(data) {
  try {
    data = {
      ...data,
      pathname: "/rest/api/3/field",
    };
    const response = await apiWrapper.get(data);
    return await response.json();
  } catch (error) {
    const { scope, socket } = data;
    log.errorJira(socket.me.identity.email, "get/field", scope, error);
  }
}

export default {
  getField,
};
