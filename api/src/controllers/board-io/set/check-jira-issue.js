import list from "../../../services/list.js";
export default async ({ objects }, { worldId, boardId }) => {
  let issueKey = (
    await list.alive({
      database: worldId,
      collection: "Object",
    })
  )
    .filter((item) => item.data.jiraIssueBoardId == boardId)
    .map((item) => item.data.key);

  const duplicateJiraObject = objects
    .filter((item) => issueKey.includes(item.object.data.key))
    .map((item) => item.object.data.key)
    .join(", ");

  return duplicateJiraObject.length
    ? {
        errors: duplicateJiraObject.map((value) => ({
          code: "JIRA_ITEM",
          key: "jiraIssueBoardId",
          value,
        })),
      }
    : {};
};
