import { spawn } from "child_process";

// Script de positionnement Jira optimis?
const SCRIPT = "/root/visualworld/test-jira-mover.js";
const CWD = "/root/visualworld";

const state = {
  running: false,
  done: false,
  success: null,
  percent: 0,
  message: "",
  logs: [],
  startedAt: 0,
  endedAt: 0,
};

function pushLog(line) {
  const msg = String(line || "").trim();
  if (!msg) return;
  state.logs.push({ t: new Date().toISOString(), m: msg });
  if (state.logs.length > 200) state.logs = state.logs.slice(-200);
  state.message = msg;
}

function computePercent() {
  if (!state.running) return state.done ? 100 : 0;
  const elapsed = Date.now() - state.startedAt;
  const expectedMs = 120000;
  const p = Math.floor(5 + Math.min(90, (elapsed / expectedMs) * 90));
  return Math.max(0, Math.min(95, p));
}

export default function registerSmartMoverPositioning(app) {
  app.post("/api/execute-positioning", async (req, res) => {
    try {
      if (state.running) {
        return res.status(409).json({
          success: false,
          error: "Positionnement d?j? en cours",
          running: true,
        });
      }

      state.running = true;
      state.done = false;
      state.success = null;
      state.percent = 5;
      state.message = "Positionnement: d?marrage...";
      state.logs = [];
      state.startedAt = Date.now();
      state.endedAt = 0;

      pushLog("?? Lancement Smart Mover Jira (organisation automatique)...");

      const child = spawn("node", [SCRIPT], {
        cwd: CWD,
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });

      child.stdout.on("data", (buf) => {
        String(buf)
          .split("\n")
          .forEach(pushLog);
      });

      child.stderr.on("data", (buf) => {
        String(buf)
          .split("\n")
          .forEach((l) => pushLog("?? " + l));
      });

      child.on("close", (code) => {
        state.running = false;
        state.done = true;
        state.endedAt = Date.now();
        state.percent = 100;

        if (code === 0) {
          state.success = true;
          pushLog("? Positionnement Jira termin? avec succ?s");
        } else {
          state.success = false;
          pushLog(`? Positionnement Jira termin? avec erreur (code ${code})`);
        }
      });

      return res.json({ success: true, message: "Positionnement lanc? ?" });
    } catch (e) {
      state.running = false;
      state.done = true;
      state.success = false;
      state.percent = 100;
      pushLog("? Erreur serveur: " + e.message);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/positioning-status", (req, res) => {
    const percent = computePercent();
    const lastLogs = state.logs.slice(-8);

    return res.json({
      running: state.running,
      done: state.done,
      success: state.success,
      percent,
      message: state.message,
      logs: lastLogs,
      startedAt: state.startedAt,
      endedAt: state.endedAt,
    });
  });
}
