import room from "../../rooms/index.js";
import read from "../../services/read.js";
import log from "../../utils/log.js";
import { getIssue } from "../../utils/jira/Issue.js";
export default async (socket, scope, request) => {
  try {
    const { document } = request;
    const [data] = document;
    const [board] = await read.aliveFull({
      database: scope.worldId,
      collection: "Board",
      document: [{ _id: scope.boardId }],
    });

    let issueData = await getIssue({ socket, scope, board, jql: data.jql });
    let issues = issueData.issues;
    if (
      (issueData["status-code"] && issueData["status-code"] >= 400) ||
      issueData.errorMessages ||
      issueData.warningMessages
    ) {
      issues = [{ error: issueData }];
    }

    const mappedIssues = issues.map((item) => ({
      data: {
        ...item,
        total: issueData.total,
        maxResults: issueData.maxResults,
      },
    }));

    console.log("[JIRA ISSUE CONTROLLER] Sending issues to frontend:", {
      count: mappedIssues.length,
      firstIssue: mappedIssues[0] ? {
        hasData: !!mappedIssues[0].data,
        hasKey: !!mappedIssues[0].data?.key,
        key: mappedIssues[0].data?.key,
        hasFields: !!mappedIssues[0].data?.fields,
        hasCreated: !!mappedIssues[0].data?.fields?.created
      } : null
    });

    room.jiraIssue.emit(
      socket,
      scope,
      mappedIssues,
      { me: true, others: false }
    );
  } catch (error) {
    log.errorController(
      socket.handshake.headers["x-forwarded-for"],
      "jiraIssue/get",
      scope,
      request,
      error
    );
  }
};
