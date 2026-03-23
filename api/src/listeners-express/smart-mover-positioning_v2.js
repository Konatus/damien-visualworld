// /root/visualworld/api/src/listeners-express/smart-mover-positioning.js
// -*- coding: utf-8 -*-

import { spawn } from "child_process";

const SCRIPT = "/root/visualworld/smartmover_v4.cjs";
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
  if (state.logs.length > 300) state.logs = state.logs.slice(-300);
  state.message = msg;
}

function resetState() {
  state.running = false;
  state.done = false;
  state.success = null;
  state.percent = 0;
  state.message = "";
  state.logs = [];
  state.startedAt = 0;
  state.endedAt = 0;
}

function computePercent() {
  if (!state.running) return state.done ? 100 : 0;
  const elapsed = Date.now() - state.startedAt;
  const expectedMs = 120000;
  const p = Math.floor(5 + Math.min(90, (elapsed / expectedMs) * 90));
  return Math.max(0, Math.min(99, p));
}

export default function registerSmartMoverPositioning(app) {
  // ? Start positioning V4
  app.post("/api/execute-positioning-v4", async (req, res) => {
    try {
      const worldId = String(req.query.worldId || "").trim();
      const boardId = String(req.query.boardId || "").trim();

      // ? on passe explicitement le composant/fields au mover (solution directe)
      const componentName = String(req.query.componentName || "K - Work Item").trim();
      const projectField = String(req.query.projectField || "project").trim();
      const dateField = String(req.query.dateField || "start_date_test").trim();

      if (!worldId || !boardId) return res.status(400).send("Missing worldId or boardId");
      if (state.running) return res.status(409).send("Positioning already running");

      resetState();
      state.running = true;
      state.startedAt = Date.now();
      state.message = "Starting V4 project rows...";

      pushLog(`START V4 worldId=${worldId} boardId=${boardId}`);
      pushLog(`CFG componentName="${componentName}" projectField="${projectField}" dateField="${dateField}"`);
      pushLog(`CMD: node ${SCRIPT} --worldId ${worldId} --boardId ${boardId} --componentName "${componentName}" --projectField "${projectField}" --dateField "${dateField}"`);

      const child = spawn(
        "node",
        [
          SCRIPT,
          "--worldId", worldId,
          "--boardId", boardId,
          "--componentName", componentName,
          "--projectField", projectField,
          "--dateField", dateField,
        ],
        { cwd: CWD }
      );

      child.on("error", (err) => {
        state.running = false;
        state.done = true;
        state.success = false;
        state.percent = 100;
        pushLog("SPAWN ERROR: " + (err?.message || String(err)));
      });

      child.stdout.on("data", (d) => {
        pushLog(String(d));
        state.percent = computePercent();
      });

      child.stderr.on("data", (d) => {
        pushLog("ERR: " + String(d));
        state.percent = computePercent();
      });

      child.on("close", (code) => {
        state.running = false;
        state.done = true;
        state.endedAt = Date.now();
        state.percent = 100;
        state.success = code === 0;
        pushLog(code === 0 ? "DONE: success" : `DONE: failed (exit=${code})`);
      });

      return res.json({ success: true, started: true });
    } catch (e) {
      state.running = false;
      state.done = true;
      state.success = false;
      state.percent = 100;
      state.message = e?.message || String(e);
      pushLog("FATAL: " + state.message);
      return res.status(500).send(state.message);
    }
  });

  // ? Poll status
  app.get("/api/positioning-status", (req, res) => {
    state.percent = state.running ? computePercent() : (state.done ? 100 : 0);
    return res.json({
      running: state.running,
      done: state.done,
      success: state.success,
      percent: state.percent,
      message: state.message,
      logs: state.logs.slice(-160),
      startedAt: state.startedAt,
      endedAt: state.endedAt,
    });
  });
}
