import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

export async function getIssue(data) {
  try {
    const jqlQuery = {
      jql: data["jql"].jql,
      maxResults: 50,
      fields: ["*all"], // Include all fields as per Postman example
    };

    // Add startAt only if it's not 0 (optional parameter)
    if (data["jql"].startAt) {
      jqlQuery.startAt = data["jql"].startAt;
    }

    console.log("[JIRA] JQL Query:", JSON.stringify(jqlQuery, null, 2));

    data = {
      ...data,
      pathname: "/rest/api/3/search/jql",
      body: JSON.stringify(jqlQuery),
    };
    const response = await apiWrapper.post(data);

    const result = await response.json();
    console.log("[JIRA] JQL Response status:", response.status);

    if (response.status >= 400) {
      console.error("[JIRA] JQL Error response:", result);
    } else {
      console.log("[JIRA] JQL Success - Issues found:", result.total || 0);
      // Log the structure of the first issue to debug frontend error
      if (result.issues && result.issues.length > 0) {
        console.log("[JIRA] First issue structure:", JSON.stringify({
          id: result.issues[0].id,
          key: result.issues[0].key,
          hasFields: !!result.issues[0].fields,
          hasCreated: !!result.issues[0].fields?.created,
          fieldsKeys: result.issues[0].fields ? Object.keys(result.issues[0].fields) : []
        }, null, 2));
      }
    }

    return result;
  } catch (error) {
    const { scope, socket } = data;
    console.error("[JIRA] JQL Exception:", error);
    log.errorJira(socket.me.identity.email, "get/issue", scope, error);
    return {
      errorMessages: [error.message],
      "status-code": 500
    };
  }
}
export async function getIssueById(data) {
  try {
    data = {
      ...data,
      pathname: `/rest/api/3/issue/${data.issueId}`,
    };
    const response = await apiWrapper.get(data);
    return await response.json();
  } catch (error) {
    const { scope, socket } = data;
    log.errorJira(socket.me.identity.email, "get/issueById", scope, error);
  }
}
export async function createIssue(data) {
  try {
    data = {
      ...data,
      pathname: `/rest/api/3/issue`,
      body: JSON.stringify({ fields: data.fields }),
    };
    const response = await apiWrapper.post(data);

    return await response.json();
  } catch (error) {
    const { scope, socket } = data;
    log.errorJira(socket.me.identity.email, "post/createIssue", scope, error);
  }
}

export default {
  getIssue,
  getIssueById,
  createIssue,
};
