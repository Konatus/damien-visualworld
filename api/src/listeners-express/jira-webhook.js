import bodyParser from "body-parser";
const jsonParser = bodyParser.json();
import list from "../services/list.js";

import read from "../services/read.js";

import ObjectAlive from "../controllers/object/index.js";
import positionAlive from "../controllers/position-alive/index.js";

import { getIssueById } from "../utils/jira/Issue.js";
import log from "../utils/log.js";

export default async (express) => {
  express.post("/api/webhook/jira", jsonParser, async (req, res) => {
    const webhookEvent = req.body["webhookEvent"];
    const url = req.body.user.self;
    const { worldId, boardId, issueId } = req.query;

    if (!worldId || !boardId || !issueId) {
      res.status(401).send();
    } else {
      const [board] = await read.aliveFull({
        database: worldId,
        collection: "Board",
        document: [{ _id: boardId }],
      });

      if (new URL(url).origin !== board.data.jira.host) {
        return res.status(401).send();
      }

      const [object] = (
        await list.alive({
          database: worldId.toString(),
          collection: "Object",
        })
      ).filter((item) => {
        return (
          item.data.jira_issueid == issueId &&
          item.data.jiraIssueBoardId == boardId
        );
      });

      const issue = await getIssueById({
        socket: req,
        scope: req.query,
        board,
        issueId,
      });

      if (!object && issue.id) {
        return res.send();
      }

      // Issue_updated WebhookEvent
      else if (webhookEvent == "jira:issue_updated" && object && issue.id) {
        const { storyPoint, epicName } = board.data.jira.projects
          .filter((project) => project.key === issue.key.split("-")[0])
          .map((item) => {
            return {
              projectId: item.id,
              storyPoint: item.customFieldKey.storyPoint,
              epicName: item.customFieldKey.epicName,
            };
          })[0];

        await ObjectAlive.update(req, req.query, {
          document: [
            {
              _id: object._id,

              data: {
                jira_priority: issue.fields.priority.id,
                jira_summary: issue.fields.summary,
                jira_status: issue.fields.status.id,
                jira_storypoint: issue.fields[storyPoint],
                jira_epicname: issue.fields[epicName],
                issuelinks: issue.fields.issuelinks
                  ? issue.fields.issuelinks
                      .filter((x) => x.outwardIssue)
                      .map((x) => ({
                        name: x.type.name,
                        outwardIssue: x.outwardIssue.key,
                      }))
                  : [],
              },
            },
          ],
        });
        log.jira(
          "jira webhook",
          req.query,
          `jira-api-webhook/update ${object.data.key}`
        );
      }
      // Issue_deleted WebhookEvent
      else if (webhookEvent == "jira:issue_deleted" && object && !issue.id) {
        const positions = (
          await list.alive({
            database: worldId,
            collection: "Position",
            document: {
              boardId: boardId,
            },
          })
        ).filter((item) => item.objectId == object._id.toString());
        for await (const item of positions) {
          await positionAlive.removeCompletely(req, req.query, {
            document: [{ positionId: item._id, objectId: object._id }],
          });
        }
        log.jira(
          "jira webhook",
          req.query,
          `jira-api-webhook/delete ${object.data.key}`
        );
      }
      res.send();
    }
  });
};
