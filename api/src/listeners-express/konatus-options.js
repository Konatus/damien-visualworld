// /root/visualworld-main/api/src/listeners-express/konatus-options.js
// -*- coding: utf-8 -*-

import fs from "fs";

const OPTIONS_PATH = "/root/visualworld-main/DataFile/konatus_options.json";

function ensureDir() {
  fs.mkdirSync("/root/visualworld-main/DataFile", { recursive: true });
}

function readOptions() {
  try {
    if (!fs.existsSync(OPTIONS_PATH)) return {};
    const s = fs.readFileSync(OPTIONS_PATH, "utf-8");
    const j = JSON.parse(s || "{}");
    return j && typeof j === "object" ? j : {};
  } catch (_) {
    return {};
  }
}

function writeOptions(obj) {
  ensureDir();
  fs.writeFileSync(OPTIONS_PATH, JSON.stringify(obj, null, 2), "utf-8");
}

function toBool(v) {
  if (v === true || v === false) return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function toInt(v, defVal) {
  const n = Number(v);
  if (!Number.isFinite(n)) return defVal;
  return Math.max(1, Math.floor(n));
}

export default function konatusOptions(app) {
  // ? GET: retourne les options (avec d�fauts si le JSON n'existe pas)
  app.get("/api/konatus-options", (_req, res) => {
    const current = readOptions();
    const merged = {
      withGate: !!current.withGate,
      optimizeTeamAssignment: !!current.optimizeTeamAssignment,
      startDate: current.startDate || "2025-01-01",
      iterationDurationDays: toInt(current.iterationDurationDays, 14),
      updatedAt: current.updatedAt || null,
    };
    // (optionnel) �crire le JSON si absent
    if (!fs.existsSync(OPTIONS_PATH)) writeOptions(merged);
    res.json({ success: true, options: merged });
  });

  // ? POST: sauvegarde gate/date/dur�e venant de l'UI
  app.post("/api/konatus-options", (req, res) => {
    try {
      const body = req.body || {};
      const current = readOptions();

      const merged = {
        ...current,
        withGate: toBool(body.withGate),
        optimizeTeamAssignment: toBool(body.optimizeTeamAssignment),
        startDate: body.startDate || current.startDate || "2025-01-01",
        iterationDurationDays: toInt(
          body.iterationDurationDays ?? current.iterationDurationDays,
          14
        ),
        updatedAt: new Date().toISOString(),
      };

      writeOptions(merged);
      res.json({ success: true, options: merged });
    } catch (e) {
      res.status(500).json({ success: false, error: e?.message || String(e) });
    }
  });
}