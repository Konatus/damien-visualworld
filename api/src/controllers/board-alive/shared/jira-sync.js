import read from "../../../services/read.js";

import jiraProject from "../../jira-use/project.js";
import { cipher } from "../../../utils/cipher.js";

import webhook from "../../../utils/jira/webhook.js";
import log from "../../../utils/log.js";

export default async (socket, scope, document) => {
  for await (const item of document) {
    if (item.data.jira !== undefined && item.data.jiraApiToken) {
      // Enable Jira sync
      const encryptApiToken = cipher(item.data.jiraApiToken);

      // Test connection by fetching projects
      await jiraProject(socket, scope, {
        board: { ...item, ultraPrivate: { jiraApiToken: encryptApiToken } },
      });

      // Store encrypted token
      if (item.data.jiraApiToken) {
        if (!item.ultraPrivate) item.ultraPrivate = {};
        item.ultraPrivate["jiraApiToken"] = encryptApiToken;
        delete item.data.jiraApiToken;
      }
    }

    const [board] = await read.aliveFull({
      database: scope.worldId,
      collection: "Board",
      document: [{ _id: item._id }],
    });

    // Webhook
    if (item.data.jira && item.data.jira.projects) {
      const projects = item.data.jira.projects;

      if (
        board.data.jira &&
        board.data.jira.webhook &&
        board.data.jira.webhookMessage
      ) {
        item.data.jira.webhookMessage = null;
      }

      if (
        board.data.jira &&
        board.data.jira.webhook &&
        board.data.jira.webhook.id
      ) {
        const updatedWebhook = await webhook.update({
          socket,
          scope,
          board,
          projects,
        });
        if (updatedWebhook["status-code"] >= 400) {
          item.data.jira.webhookMessage = updatedWebhook;
        } else {
          item.data.jira.webhook = updatedWebhook;
          log.jira(socket.me.identity.email, scope, `webhook/update`);
        }
      } else {
        const createdWebhook = await webhook.create({
          socket,
          scope,
          board,
          projects,
        });
        if (createdWebhook["status-code"] >= 400) {
          item.data.jira.webhookMessage = createdWebhook;
        } else {
          item.data.jira.webhook = createdWebhook;
          log.jira(socket.me.identity.email, scope, `webhook/create`);
        }

        if (createdWebhook.self) {
          item.data.jira.webhook.id = createdWebhook.self.split("/").pop();
        }
      }
    }

    if (item.data.jira === null && board.data.jira && board.data.jira.webhook) {
      const deletedWebhook = await webhook.delete({
        socket,
        scope,
        board,
      });
      if (deletedWebhook.status == 204) {
        log.jira(
          socket.me.identity.email,
          scope,
          `webhook/delete ${deletedWebhook.url}`
        );
      }
    }
  }
  return document;
};
