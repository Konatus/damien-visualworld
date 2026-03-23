import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

export async function getProjets(data) {
  try {
    data = {
      ...data,
      pathname: "/rest/api/3/project",
    };
    const response = await apiWrapper.get(data);

    if (!response) {
      console.error("[JIRA] No response from API");
      return {
        "status-code": 500,
        message: "No response from Jira API"
      };
    }

    const statusCode = response.status;
    console.log("[JIRA] Get projects status:", statusCode);

    if (statusCode >= 400) {
      const errorText = await response.text();
      console.error("[JIRA] Error response:", errorText);
      return {
        "status-code": statusCode,
        message: errorText
      };
    }

    const projects = await response.json();
    console.log("[JIRA] Projects received:", projects?.length || 0);
    console.log("[JIRA] Projects data:", JSON.stringify(projects, null, 2));

    return projects;
  } catch (error) {
    const { scope, socket } = data;
    console.error("[JIRA] Exception in getProjets:", error);
    log.errorJira(socket.me.identity.email, "get/project", scope, error);
    return {
      "status-code": 500,
      message: error.message
    };
  }
}

export default {
  getProjets,
};
