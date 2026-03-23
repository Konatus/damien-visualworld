import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

export async function getStatus(data, project) {
  try {
    const result = {};
    for await (const projectId of project.map((item) => item.id)) {
      data = {
        ...data,
        pathname: `/rest/api/3/project/${projectId}/statuses`,
      };
      const response = await apiWrapper.get(data);
      const res = await response.json();
      result[projectId] = res;
    }
    return result;
  } catch (error) {
    const { scope, socket } = data;
    log.errorJira(socket.me.identity.email, "get/status", scope, error);
  }
}

export default {
  getStatus,
};
