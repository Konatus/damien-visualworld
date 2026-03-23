import read from "../../services/read.js";
import log from "../../utils/log.js";
import { createIssue, getIssueById } from "../../utils/jira/Issue.js";

import updateObject from "../object/update.js";

export default async (socket, scope, request) => {
  try {
    const [board] = request["board"]
      ? [request["board"]]
      : await read.aliveFull({
        database: scope.worldId,
        collection: "Board",
        document: [{ _id: scope.boardId }],
      });
    if (!board.data.jira) return;

    // Make concurrent jira api calls
    const requests = request.document.map(async (issue) => {
      const createdIssue = await createIssue({
        socket,
        scope,
        board,
        fields: issue.fields,
      });

      const object = { _id: issue.objectId };

      if (createdIssue.errors) {
        object.data = {
          jira_error: Object.values(createdIssue.errors)[0],
        };
      } else {
        const createdIssueField = await getIssueById({
          socket,
          scope,
          board,
          issueId: createdIssue.id,
        });
        object.data = {
          jira_issueid: createdIssue.id,
          jira_link: `${new URL(createdIssue.self).origin}/browse/${createdIssue.key
            }`,
          jira_key: createdIssue.key,
          jira_status: createdIssueField.fields.status.id,
          jiraIssueBoardId: issue.jiraIssueBoardId,
        };
      }
      return object;
    });

    // Wait until all the api calls resolves
    const document = await Promise.all(requests);

    // Update link and key jira object
    updateObject(socket, scope, { reply: true, document });
  } catch (error) {
    log.errorController(
      socket.handshake.headers["x-forwarded-for"],
      "jiraIssue/create",
      scope,
      request,
      error
    );
  }
};
