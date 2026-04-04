import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

/**
 * Récupère les équipes Jira.
 * - Stratégie 1 : agility teams API
 * - Stratégie 2 : POST /rest/api/3/search/jql (même endpoint que Issue.js)
 */
export async function getTeams(data, projectKeys = []) {

    // ── Stratégie 1 : agility teams API ─────────────────────────────
    try {
        const agilityRes = await apiWrapper.get({
            ...data,
            pathname: "/jira/software/rest/agility/1.0/team/all",
            query: { maxResults: 200 },
        });
        if (agilityRes && agilityRes.ok) {
            const json = await agilityRes.json();
            const raw = json.values || json.teams || [];
            if (raw.length > 0) {
                console.log("[JIRA TEAMS] Agility API OK:", raw.length, "teams");
                return {
                    teams: raw.map((t) => ({
                        id: String(t.id || t.teamId || t.name || ""),
                        name: t.name || t.title || String(t.id || ""),
                    })),
                };
            }
        }
    } catch (_) { /* fall through */ }

    // ── Stratégie 2 : POST /rest/api/3/search/jql ───────────────────
    try {
        const jql = projectKeys.length > 0
            ? `project IN (${projectKeys.map((k) => `"${k}"`).join(",")}) ORDER BY updated DESC`
            : `ORDER BY updated DESC`;

        console.log("[JIRA TEAMS] POST /rest/api/3/search/jql:", jql);

        const body = JSON.stringify({
            jql,
            fields: ["customfield_10001", "summary"],
            maxResults: 100,
        });

        const searchRes = await apiWrapper.post({
            ...data,
            pathname: "/rest/api/3/search/jql",
            body,
        });

        console.log("[JIRA TEAMS] search/jql status:", searchRes?.status);

        if (!searchRes || !searchRes.ok) {
            const errText = await searchRes?.text().catch(() => "");
            console.error("[JIRA TEAMS] search/jql error:", errText);
            return { error: "search_failed", teams: [] };
        }

        const json = await searchRes.json();
        const issues = json.issues || [];
        console.log("[JIRA TEAMS] Issues found:", issues.length);

        const teamMap = new Map();

        for (const issue of issues) {
            const raw = issue.fields?.customfield_10001;
            if (!raw) continue;

            const items = Array.isArray(raw) ? raw : [raw];
            for (const item of items) {
                if (!item) continue;
                if (typeof item === "string" && item.trim()) {
                    teamMap.set(item, { id: item, name: item });
                } else if (typeof item === "object") {
                    const id = String(item.id || item.teamId || item.accountId || item.key || item.name || "");
                    const name = item.name || item.title || item.displayName || item.emailAddress || id;
                    if (id || name) {
                        teamMap.set(id || name, { id: id || name, name: name || id });
                    }
                }
            }
        }

        const teams = Array.from(teamMap.values());
        console.log("[JIRA TEAMS] Unique teams extracted:", teams.length);

        if (teams.length > 0) return { teams };
        if (issues.length > 0) return { error: "no_teams_found", teams: [] };
        return { error: "no_issues_found", teams: [] };

    } catch (error) {
        const { scope, socket } = data;
        console.error("[JIRA TEAMS] Exception:", error);
        log.errorJira(socket.me.identity.email, "get/teams", scope, error);
        return { error: error.message, teams: [] };
    }
}

export default { getTeams };
