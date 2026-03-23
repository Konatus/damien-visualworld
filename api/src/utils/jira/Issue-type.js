import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

export async function getIssueType(data) {
  try {
    data = {
      ...data,
      pathname: "/rest/api/3/issue/createmeta",
      query: { expand: "projects.issuetypes.fields" },
    };
    const response = await apiWrapper.get(data);
    return await response.json();
  } catch (error) {
    const { scope, socket } = data;
    log.errorJira(socket.me.identity.email, "get/issuetype", scope, error);
  }
}

export default {
  getIssueType,
};
