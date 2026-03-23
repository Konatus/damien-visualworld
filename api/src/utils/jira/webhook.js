import log from "../log.js";
import CONF from "../../conf.js";
import apiWrapper from "./api-wrapper.js";

const webhookBody = ({ scope, projects }) => {
  const { worldId, boardId } = scope;
  const webhookBody = {
    name: "VW-$BOARD_ID",
    url: `${CONF.BASE_URL}/api/webhook/jira?worldId=${worldId}&boardId=${boardId}&issueId=\${issue.id}`,
    events: ["jira:issue_updated", "jira:issue_deleted"],
    filters: {
      "issue-related-events-section": "project in ($PROJECT)",
    },
    excludeBody: false,
  };

  const mapObj = {
    $BOARD_ID: boardId,
    $PROJECT: projects.length
      ? projects.map((item) => item.key).join(",")
      : null,
  };

  return JSON.stringify(webhookBody).replace(
    /\$BOARD_ID|\$PROJECT/gi,
    (matched) => mapObj[matched]
  );
};

export default {
  async create(data) {
    try {
      data = {
        ...data,
        pathname: "/rest/webhooks/1.0/webhook",
        body: webhookBody(data),
      };
      const response = await apiWrapper.post(data);
      return await response.json();
    } catch (error) {
      const { scope, socket } = data;
      log.errorJira(socket.me.identity.email, "webhook/create", scope, error);
    }
  },

  async update(data) {
    try {
      data = {
        ...data,
        pathname: `/rest/webhooks/1.0/webhook/${data.board.data.jira.webhook.id}`,
        body: webhookBody(data),
      };
      const response = await apiWrapper.put(data);
      return response && (await response.json());
    } catch (error) {
      const { scope, socket } = data;
      log.errorJira(socket.me.identity.email, "webhook/update", scope, error);
    }
  },

  async delete(data) {
    try {
      data = {
        ...data,
        pathname: `/rest/webhooks/1.0/webhook/${data.board.data.jira.webhook.id}`,
      };
      const response = await apiWrapper.delete(data);
      return await response;
    } catch (error) {
      const { scope, socket } = data;
      log.errorJira(socket.me.identity.email, "webhook/delete", scope, error);
    }
  },
};
