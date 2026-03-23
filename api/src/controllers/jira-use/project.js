import room from "../../rooms/index.js";
import read from "../../services/read.js";
import log from "../../utils/log.js";

import { getProjets } from "../../utils/jira/project.js";
import aggregate from "./aggregate.js";

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

    console.log("[JIRA PROJECT] Starting project retrieval...");

    let project = [];
    const getProject = await getProjets({ socket, scope, board });

    console.log("[JIRA PROJECT] getProject result:", getProject);
    console.log("[JIRA PROJECT] Is array?", Array.isArray(getProject));
    console.log("[JIRA PROJECT] Has status-code?", getProject["status-code"]);

    if (getProject["status-code"] && getProject["status-code"] >= 400) {
      console.log("[JIRA PROJECT] Error detected, pushing error");
      project.push({ data: { error: { projectError: getProject } } });
    } else {
      console.log("[JIRA PROJECT] Success, aggregating...");
      project.push(getProject);
      project = await aggregate({ socket, scope, board }, getProject);
      console.log("[JIRA PROJECT] Aggregated projects count:", project?.length || 0);
    }

    console.log("[JIRA PROJECT] Emitting to room:", project?.length || 0, "projects");
    room.jiraProject.emit(socket, scope, project, { me: true, others: false });

    return undefined;
  } catch (error) {
    console.error("[JIRA PROJECT] Exception:", error);
    log.errorController(
      socket.handshake.headers["x-forwarded-for"],
      "jiraProject/get",
      scope,
      request,
      error
    );
  }
};
