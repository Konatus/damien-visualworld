import room from "../../rooms/index.js";
import read from "../../services/read.js";
import log from "../../utils/log.js";
import { getTeams } from "../../utils/jira/team.js";

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

        // Récupérer les clés des projets Jira activés sur ce board
        const projectKeys = (board.data.jira.projects || [])
            .filter((p) => p.activatedProject)
            .map((p) => p.key);

        const result = await getTeams({ socket, scope, board }, projectKeys);

        const document = [{ data: result }];

        room.jiraTeam.emit(socket, scope, document, { me: true, others: false });
    } catch (error) {
        log.errorController(
            socket.handshake.headers["x-forwarded-for"],
            "jiraTeam/get",
            scope,
            request,
            error
        );
    }
};
