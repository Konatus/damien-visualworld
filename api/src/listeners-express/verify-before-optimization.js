// /root/visualworld/api/src/listeners-express/verify-before-optimization.js
// -*- coding: utf-8 -*-

import fs from "fs";
import Excel from "exceljs";

/**
 * G�n�re (�crase) :
 * 1) work_element_6.4.3.txt
 * 2) attribut_6.4.3.txt
 * 3) team_backlog_6.4.3.txt
 * 4) depends_6.4.3.txt   (depuis INPUT_XLSX feuille "Liens")
 * 5) team_resources_6.4.3.txt (depuis INPUT_XLSX feuille "capacite")
 *
 * Gate ON:
 * - ajoute des d�pendances "par phase/gate" UNIQUEMENT � l'int�rieur du m�me projet
 * - et UNIQUEMENT entre phases adjacentes :
 *   phase 2 d�pend de phase 1, phase 3 d�pend de phase 2, etc.
 *
 * IMPORTANT:
 * - Projet d�tect� soit via une colonne project/projet/programme (si elle existe),
 *   soit via les lignes "titre projet" (phase vide / non-work-item), comme dans ton Excel.
 */

const INPUT_XLSX = "/root/visualworld/DataFile/InputDataOptimizationV1.xlsx";

const WORK_ELEMENT_TXT =
  "/root/visualworld/OptimizationCode/OptimizationAlgorithm/Input/Konatus_instances/work_element_6.4.3.txt";
const ATTRIBUT_TXT =
  "/root/visualworld/OptimizationCode/OptimizationAlgorithm/Input/Konatus_instances/attribut_6.4.3.txt";
const TEAM_BACKLOG_TXT =
  "/root/visualworld/OptimizationCode/OptimizationAlgorithm/Input/Konatus_instances/team_backlog_6.4.3.txt";
const DEPENDS_TXT =
  "/root/visualworld/OptimizationCode/OptimizationAlgorithm/Input/Konatus_instances/depends_6.4.3.txt";
const TEAM_RESOURCES_TXT =
  "/root/visualworld/OptimizationCode/OptimizationAlgorithm/Input/Konatus_instances/team_resources_6.4.3.txt";

// options �crites par /api/konatus-options
const OPTIONS_PATH = "/root/visualworld/DataFile/konatus_options.json";

const SHEET_OBJECTS = "Objets";
const SHEET_LINKS = "Liens";
const SHEET_CAPACITY = "capacite";

/* ================= Helpers ================= */
function normStr(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}
function isEmpty(v) {
  const s = normStr(v).toLowerCase();
  return s === "" || s === "null" || s === "undefined";
}
function nv(v) {
  return isEmpty(v) ? "\\N" : normStr(v);
}
function nvOrDefault(v, defVal) {
  return isEmpty(v) ? String(defVal) : normStr(v);
}

function getCellValue(row, colIdx1Based) {
  const cell = row.getCell(colIdx1Based);
  const v = cell ? cell.value : null;
  if (v && typeof v === "object") {
    if (v.result !== undefined) return v.result;
    if (v.text !== undefined) return v.text;
    if (Array.isArray(v.richText)) return v.richText.map((x) => x.text).join("");
  }
  return v;
}

function normalizeHeaderName(s) {
  return normStr(s).toLowerCase().replace(/\s+/g, "_");
}
function buildHeaderMap(ws) {
  const headerRow = ws.getRow(1);
  const map = {};
  headerRow.eachCell((cell, colNumber) => {
    const key = normalizeHeaderName(cell?.value);
    if (key) map[key] = colNumber;
  });
  return map;
}
function getByHeaderAliases(row, headerMap, aliases, fallbackCol = null) {
  for (const a of aliases) {
    const key = normalizeHeaderName(a);
    const col = headerMap[key];
    if (col) return getCellValue(row, col);
  }
  if (fallbackCol) return getCellValue(row, fallbackCol);
  return null;
}

function normTaskNameForMatch(s) {
  return normStr(s).toUpperCase().replace(/\s+/g, "").replace(/\./g, "");
}

function parseDateStringToDate(s) {
  const str = normStr(s);
  if (!str) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(str);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
}

function toISODateOrNV(v) {
  if (isEmpty(v)) return "\\N";

  if (v instanceof Date) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof v === "number" && Number.isFinite(v)) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = Math.round(v * 86400000);
    const d = new Date(epoch.getTime() + ms);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof v === "string") {
    const d = parseDateStringToDate(v);
    if (d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return nv(v);
  }

  return nv(v);
}

function readKonatusOptionsSafe() {
  try {
    const s = fs.readFileSync(OPTIONS_PATH, "utf-8");
    const j = JSON.parse(s);
    return j && typeof j === "object" ? j : {};
  } catch (_) {
    return {};
  }
}

function toBool(v) {
  if (v === true || v === false) return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

function parsePhaseToNumber(v) {
  if (v === undefined || v === null) return 1;
  const s = normStr(v);
  if (!s || s === "\\N") return 1;
  const m = s.match(/(\d+)/);
  if (!m) return 1;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : 1;
}

function normalizeCapacityDate(value) {
  if (value == null || value === "" || value === "\\N") return "\\N";

  if (value instanceof Date && !isNaN(value.getTime())) {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = Math.round(value * 86400000);
    const d = new Date(epoch.getTime() + ms);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const s = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split(/[-/]/);
    return `${yyyy}-${mm}-${dd}`;
  }

  return s || "\\N";
}

function toNumber(v, fallback = 0) {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildHeaderMapFromRow(row) {
  const map = {};
  row.eachCell((cell, colNumber) => {
    const key = String(cell.value || "").trim().toLowerCase();
    if (key) map[key] = colNumber;
  });
  return map;
}

/* ============== 0) work_element ============== */
// Le C++ lit: "<activity_id> <project_id> <tmp...>" (le reste de la ligne est ignor�).
// On garde aussi "<name> <id>" en fin de ligne pour notre mapping name -> id c�t� JS.
async function generateWorkElementFromInputXlsx() {
  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(INPUT_XLSX);

  const ws = wb.getWorksheet(SHEET_OBJECTS);
  if (!ws) throw new Error(`Feuille "${SHEET_OBJECTS}" introuvable dans ${INPUT_XLSX}`);

  const headerMap = buildHeaderMap(ws);

  const MODEL = ["mod�le", "modele"];
  const NAME = ["name", "nom"];
  const PHASE = ["phase", "gate", "gateid", "gate_id", "gate_id_phase", "phase_gate"];
  const PROJECT = ["project", "projet", "programme", "program", "offre", "offer"];

  const fallbackPhaseCol = findColContaining(headerMap, ["phase", "gate"]);
  const fallbackProjectCol = findColContaining(headerMap, [
    "project",
    "projet",
    "programme",
    "program",
    "offre",
    "offer",
  ]);

  const lines = [];
  let id = 1;
  let currentProjectTitle = "";
  const projectNameToId = new Map();

  function getOrCreateProjectId(projectName) {
    const p = normStr(projectName);
    if (!p) return 1;
    if (!projectNameToId.has(p)) projectNameToId.set(p, projectNameToId.size + 1);
    return projectNameToId.get(p);
  }

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const model = normStr(getByHeaderAliases(row, headerMap, MODEL, 1));

    const nameAny = normStr(getByHeaderAliases(row, headerMap, NAME, null));
    if (isEmpty(nameAny)) return;

    let phaseVal = getByHeaderAliases(row, headerMap, PHASE, null);
    if (phaseVal == null && fallbackPhaseCol) phaseVal = getCellValue(row, fallbackPhaseCol);
    const phaseEmpty = isEmpty(phaseVal) || normStr(phaseVal) === "\\N";

    let projectVal = getByHeaderAliases(row, headerMap, PROJECT, null);
    if (projectVal == null && fallbackProjectCol) projectVal = getCellValue(row, fallbackProjectCol);
    const projectFromColumn = normStr(projectVal);

    // Ligne "titre projet" (non work-item) : m�morise le projet courant
    if (!projectFromColumn && phaseEmpty && model !== "K - Work Item") {
      currentProjectTitle = nameAny;
      return;
    }

    if (model !== "K - Work Item") return;

    const projectName = projectFromColumn || currentProjectTitle || "default";
    const projectId = getOrCreateProjectId(projectName);

    // activity_id=id, project_id=projectId, puis name+id pour le mapping JS
    lines.push(`${id} ${projectId} ${nameAny} ${id}`);
    id++;
  });

  if (!lines.length) throw new Error(`work_element: aucune ligne "K - Work Item" trouv�e.`);
  fs.writeFileSync(WORK_ELEMENT_TXT, lines.join("\n") + "\n", "utf-8");
  return { total: lines.length, output: WORK_ELEMENT_TXT, projectsDetected: projectNameToId.size };
}

// name peut contenir des espaces
function readWorkElementNameToIdMap() {
  if (!fs.existsSync(WORK_ELEMENT_TXT)) {
    throw new Error(`work_element introuvable: ${WORK_ELEMENT_TXT}`);
  }
  const content = fs.readFileSync(WORK_ELEMENT_TXT, "utf-8").trim();
  const lines = content ? content.split(/\r?\n/).filter(Boolean) : [];

  const map = new Map();
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;
    const id = parts[parts.length - 1];
    const name = parts.slice(2, parts.length - 1).join(" ");
    if (!name || !id) continue;
    map.set(normTaskNameForMatch(name), id);
  }
  return map;
}

/* ============== 1) attribut ============== */
async function generateAttributFileFromInputXlsx() {
  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(INPUT_XLSX);

  const ws = wb.getWorksheet(SHEET_OBJECTS);
  if (!ws) throw new Error(`Feuille "${SHEET_OBJECTS}" introuvable dans ${INPUT_XLSX}`);

  const headerMap = buildHeaderMap(ws);
  const nameToId = readWorkElementNameToIdMap();

  const MODEL = ["mod�le", "modele"];
  const NAME = ["name", "nom"];

  const DUE_DATE = ["due_date"];
  const DUE_START = ["due_start_date"];
  const PRIORITY = ["priority", "att_priority", "attributepriority"];
  const FTE = ["fte", "fte_allocated"];
  const LOAD = ["load", "att_load_engage", "load_engage"];
  const PHASE = ["phase", "gate", "gateid", "gate_id", "phase_gate"];
  const DURATION = ["duration", "att_duration_demande", "duration_demande"];

  const opt = readKonatusOptionsSafe();
  const withGate = toBool(opt.withGate);

  const lines = [];
  let idx = 1;

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const model = normStr(getByHeaderAliases(row, headerMap, MODEL, 1));
    if (model !== "K - Work Item") return;

    const name = normStr(getByHeaderAliases(row, headerMap, NAME));
    if (isEmpty(name)) return;

    const taskId = nameToId.get(normTaskNameForMatch(name));
    if (!taskId) return;

    const dueDate = toISODateOrNV(getByHeaderAliases(row, headerMap, DUE_DATE));
    const dueStart = toISODateOrNV(getByHeaderAliases(row, headerMap, DUE_START));
    const priority = nvOrDefault(getByHeaderAliases(row, headerMap, PRIORITY), 1);
    const phase = withGate ? nv(getByHeaderAliases(row, headerMap, PHASE)) : "1";
    const load = nv(getByHeaderAliases(row, headerMap, LOAD));
    const duration = nv(getByHeaderAliases(row, headerMap, DURATION));
    const fte = nv(getByHeaderAliases(row, headerMap, FTE));

    const cols = [
      String(idx),
      nv(taskId),
      "1",
      "\\N",
      priority,
      "\\N",
      "\\N",
      "\\N",
      phase,
      load,
      "\\N",
      "\\N",
      duration,
      "\\N",
      "\\N",
      fte,
      "0",
      dueStart,
      dueStart,
      "1111-11-11",
      dueDate,
      dueDate,
      "\\N",
      "\\N",
    ];

    lines.push(cols.join(" "));
    idx++;
  });

  if (!lines.length) throw new Error(`attribut: aucune ligne g�n�r�e.`);
  fs.writeFileSync(ATTRIBUT_TXT, lines.join("\n") + "\n", "utf-8");
  return { total: lines.length, output: ATTRIBUT_TXT };
}

/**
 * Construit une map teamId -> Map<date, capacity> depuis la feuille capacite.
 * Utilis� pour l'affectation optimale des �quipes (optimizeTeamAssignment).
 */
function buildCapacityByTeamAndDate(wb) {
  const ws = wb.getWorksheet(SHEET_CAPACITY);
  if (!ws) return null;

  const headers = buildHeaderMapFromRow(ws.getRow(1));
  const colDate = headers["date"];
  const colTeam = headers["team_id"];
  const colTotalCapacity = headers["total_capacity"];
  if (!colDate || !colTeam || !colTotalCapacity) return null;

  const map = new Map(); // teamId -> Map<dateStr, capacity>
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const date = normalizeCapacityDate(row.getCell(colDate).value);
    const teamId = toNumber(row.getCell(colTeam).value, -1);
    const capacity = toNumber(row.getCell(colTotalCapacity).value, 0);
    if (date === "\\N" || teamId <= 0 || capacity <= 0) continue;

    if (!map.has(teamId)) map.set(teamId, new Map());
    const byDate = map.get(teamId);
    byDate.set(date, (byDate.get(date) || 0) + capacity);
  }
  return map.size ? map : null;
}

/**
 * Retourne l'�quipe avec la plus grande capacit� totale dans la plage [startDate, endDate].
 * @param {Map} capacityByTeam - Map<teamId, Map<date, capacity>>
 * @param {string} startDate - YYYY-MM-DD ou "\\N"
 * @param {string} endDate - YYYY-MM-DD ou "\\N"
 * @returns {number|null} teamId ou null si pas de donn�es
 */
function findBestTeamByCapacity(capacityByTeam, startDate, endDate) {
  if (!capacityByTeam || capacityByTeam.size === 0) return null;
  if (startDate === "\\N" || endDate === "\\N" || !startDate || !endDate) return null;

  const start = startDate.replace(/-/g, "");
  const end = endDate.replace(/-/g, "");
  if (start > end) return null;

  let bestTeam = null;
  let bestSum = -1;

  for (const [teamId, byDate] of capacityByTeam.entries()) {
    let sum = 0;
    for (const [dateStr, cap] of byDate.entries()) {
      const d = dateStr.replace(/-/g, "");
      if (d >= start && d <= end) sum += cap;
    }
    if (sum > bestSum) {
      bestSum = sum;
      bestTeam = teamId;
    }
  }
  return bestTeam;
}

/* ============== 2) team_backlog ============== */
async function generateTeamBacklogFileFromInputXlsx() {
  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(INPUT_XLSX);

  const ws = wb.getWorksheet(SHEET_OBJECTS);
  if (!ws) throw new Error(`Feuille "${SHEET_OBJECTS}" introuvable dans ${INPUT_XLSX}`);

  const headerMap = buildHeaderMap(ws);
  const nameToId = readWorkElementNameToIdMap();

  const raw = readKonatusOptionsSafe();
  const optimizeTeamAssignment = toBool(raw.optimizeTeamAssignment);
  const capacityByTeam = optimizeTeamAssignment ? buildCapacityByTeamAndDate(wb) : null;

  const MODEL = ["mod�le", "modele"];
  const NAME = ["name", "nom"];

  const TEAM = ["team", "att_team", "teamid"];
  const DUE_START = ["due_start_date"];
  const DUE_DATE = ["due_date"];

  const lines = [];
  let idx = 1;
  let optimizedCount = 0;

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const model = normStr(getByHeaderAliases(row, headerMap, MODEL, 1));
    if (model !== "K - Work Item") return;

    const name = normStr(getByHeaderAliases(row, headerMap, NAME));
    if (isEmpty(name)) return;

    const taskId = nameToId.get(normTaskNameForMatch(name));
    if (!taskId) return;

    let team = nv(getByHeaderAliases(row, headerMap, TEAM));
    const dueStart = toISODateOrNV(getByHeaderAliases(row, headerMap, DUE_START));
    const dueDate = toISODateOrNV(getByHeaderAliases(row, headerMap, DUE_DATE));

    if (optimizeTeamAssignment && capacityByTeam) {
      const bestTeam = findBestTeamByCapacity(capacityByTeam, dueStart, dueDate);
      if (bestTeam != null) {
        team = String(bestTeam);
        optimizedCount++;
      }
    }

    const cols = [String(idx), team, dueStart, dueDate, "11/11/1111", "11/11/1111", nv(taskId)];
    lines.push(cols.join(" "));
    idx++;
  });

  fs.writeFileSync(TEAM_BACKLOG_TXT, lines.join("\n") + (lines.length ? "\n" : ""), "utf-8");
  return {
    total: lines.length,
    optimizedTeams: optimizeTeamAssignment ? optimizedCount : 0,
    output: TEAM_BACKLOG_TXT,
  };
}

/* ============== 2bis) team_resources depuis "capacite" ============== */
async function generateTeamResourcesFromCapacitySheet() {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(INPUT_XLSX);

  const ws = workbook.getWorksheet(SHEET_CAPACITY);
  if (!ws) {
    throw new Error(`Feuille "${SHEET_CAPACITY}" introuvable dans ${INPUT_XLSX}`);
  }

  const headers = buildHeaderMapFromRow(ws.getRow(1));

  const colDate = headers["date"];
  const colTeam = headers["team_id"];
  const colIteration = headers["iteration"];
  const colTotalCapacity = headers["total_capacity"];
  const colMaxLoad = headers["max_load"];

  if (!colDate || !colTeam || !colTotalCapacity) {
    throw new Error(
      'Colonnes obligatoires manquantes dans la feuille "capacite" : date, team_id, total_capacity'
    );
  }

  const rows = [];
  let lineId = 1;

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);

    const rawDate = row.getCell(colDate).value;
    const rawTeam = row.getCell(colTeam).value;
    const rawIteration = colIteration ? row.getCell(colIteration).value : null;
    const rawTotalCapacity = row.getCell(colTotalCapacity).value;
    const rawMaxLoad = colMaxLoad ? row.getCell(colMaxLoad).value : null;

    const date = normalizeCapacityDate(rawDate);
    const teamId = toNumber(rawTeam, -1);
    const iteration = toNumber(rawIteration, 0);
    const totalCapacity = toNumber(rawTotalCapacity, 0);
    const maxLoad = toNumber(rawMaxLoad, 0);

    if (date === "\\N" || teamId <= 0 || totalCapacity <= 0) {
      continue;
    }

    const resourceId = Number(`${teamId}${String(lineId).padStart(4, "0")}`);

    rows.push({
      id: lineId,
      capacity: totalCapacity,
      mandat: "\\N",
      startdate: date,
      enddate: date,
      teamid: teamId,
      resourceid: resourceId,
      skillsetid: 1,
      iteration,
      maxLoad,
    });

    lineId++;
  }

  rows.sort((a, b) => {
    if (a.teamid !== b.teamid) return a.teamid - b.teamid;
    if (a.startdate !== b.startdate) return a.startdate.localeCompare(b.startdate);
    return a.id - b.id;
  });

  const lines = rows.map(
    (x) =>
      `${x.id} ${x.capacity} ${x.mandat} ${x.startdate} ${x.enddate} ${x.teamid} ${x.resourceid} ${x.skillsetid}`
  );

  fs.writeFileSync(TEAM_RESOURCES_TXT, lines.join("\n") + "\n", "utf8");

  return {
    total: rows.length,
    output: TEAM_RESOURCES_TXT,
  };
}

/* ============== 3) depends depuis "Liens" ============== */
async function generateDependsFileFromInputLinksXlsx() {
  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(INPUT_XLSX);

  const wsLinks = wb.getWorksheet(SHEET_LINKS);
  if (!wsLinks) throw new Error(`Feuille "${SHEET_LINKS}" introuvable dans ${INPUT_XLSX}`);

  const wsObj = wb.getWorksheet(SHEET_OBJECTS);
  if (!wsObj) throw new Error(`Feuille "${SHEET_OBJECTS}" introuvable dans ${INPUT_XLSX}`);

  const objHeaderMap = buildHeaderMap(wsObj);
  const MODEL_OBJ = ["mod�le", "modele"];
  const NAME_OBJ = ["name", "nom"];

  const objRowToWorkId = new Map();
  let workId = 1;

  wsObj.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const model = normStr(getByHeaderAliases(row, objHeaderMap, MODEL_OBJ, 1));
    if (model !== "K - Work Item") return;

    const name = normStr(getByHeaderAliases(row, objHeaderMap, NAME_OBJ));
    if (isEmpty(name)) return;

    objRowToWorkId.set(String(rowNumber), String(workId));
    workId++;
  });

  if (objRowToWorkId.size === 0) {
    throw new Error(`depends: aucun "K - Work Item" trouv� dans "${SHEET_OBJECTS}"`);
  }

  const linkHeaderMap = buildHeaderMap(wsLinks);

  const ORIGIN = ["origine", "origin", "linkorigin"];
  const TARGET = ["cible", "target", "linkend"];
  const MODEL = ["mod�le", "modele", "model", "linkmodel"];

  const lines = [];
  let idx = 1;

  wsLinks.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const originRaw = getByHeaderAliases(row, linkHeaderMap, ORIGIN, 1);
    const targetRaw = getByHeaderAliases(row, linkHeaderMap, TARGET, 2);
    const modelRaw = getByHeaderAliases(row, linkHeaderMap, MODEL, 3);

    const model = normStr(modelRaw).toLowerCase();
    if (model !== "dependency") return;

    const originKey = normStr(originRaw);
    const targetKey = normStr(targetRaw);
    if (isEmpty(originKey) || isEmpty(targetKey)) return;

    const originWorkId = objRowToWorkId.get(originKey);
    const targetWorkId = objRowToWorkId.get(targetKey);
    if (!originWorkId || !targetWorkId) return;

    lines.push(`${idx} ${targetWorkId} ${originWorkId}`);
    idx++;
  });

  if (!lines.length) {
    throw new Error(`depends: aucune d�pendance "dependency" trouv�e dans "${SHEET_LINKS}"`);
  }

  fs.writeFileSync(DEPENDS_TXT, lines.join("\n") + "\n", "utf-8");
  return { total: lines.length, output: DEPENDS_TXT };
}

/* ===========================================================
   EXTRACTION PROJETS + GATE DEPS PAR PROJET (adjacent only)
   =========================================================== */

function findColContaining(map, needles) {
  const keys = Object.keys(map || {});
  for (const k of keys) {
    for (const n of needles) {
      if (k.includes(n)) return map[k];
    }
  }
  return null;
}

async function extractProjectsPhaseTasksFromObjectsSheet() {
  const nameToId = readWorkElementNameToIdMap();

  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(INPUT_XLSX);

  const wsObj = wb.getWorksheet(SHEET_OBJECTS);
  if (!wsObj) throw new Error(`Feuille "${SHEET_OBJECTS}" introuvable dans ${INPUT_XLSX}`);

  const headerMap = buildHeaderMap(wsObj);

  const MODEL = ["mod�le", "modele"];
  const NAME = ["name", "nom"];

  const PHASE_ALIASES = [
    "phase",
    "gate",
    "gateid",
    "gate_id",
    "phase_gate",
    "phase/gate",
    "gate_id_phase",
  ];

  const PROJECT_ALIASES = ["project", "projet", "programme", "program", "offre", "offer"];

  const fallbackPhaseCol = findColContaining(headerMap, ["phase", "gate"]);
  const fallbackProjectCol = findColContaining(headerMap, [
    "project",
    "projet",
    "programme",
    "program",
    "offre",
    "offer",
  ]);

  const projects = new Map();

  function addTask(projectName, phaseNum, taskId) {
    const p = normStr(projectName);
    if (!p) return;
    if (!projects.has(p)) projects.set(p, new Map());
    const byPhase = projects.get(p);
    if (!byPhase.has(phaseNum)) byPhase.set(phaseNum, []);
    byPhase.get(phaseNum).push(String(taskId));
  }

  let currentProjectTitle = "";

  wsObj.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const nameAny = normStr(getByHeaderAliases(row, headerMap, NAME, null));
    if (isEmpty(nameAny)) return;

    const model = normStr(getByHeaderAliases(row, headerMap, MODEL, 1));

    let phaseVal = getByHeaderAliases(row, headerMap, PHASE_ALIASES, null);
    if (phaseVal == null && fallbackPhaseCol) phaseVal = getCellValue(row, fallbackPhaseCol);

    let projectVal = getByHeaderAliases(row, headerMap, PROJECT_ALIASES, null);
    if (projectVal == null && fallbackProjectCol) projectVal = getCellValue(row, fallbackProjectCol);

    const projectFromColumn = normStr(projectVal);

    const phaseEmpty = isEmpty(phaseVal) || normStr(phaseVal) === "\\N";

    const isProjectHeader =
      (!projectFromColumn && model !== "K - Work Item") ||
      (!projectFromColumn && phaseEmpty && model !== "K - Work Item");

    if (isProjectHeader) {
      currentProjectTitle = nameAny;
      return;
    }

    if (model !== "K - Work Item") return;

    const taskId = nameToId.get(normTaskNameForMatch(nameAny));
    if (!taskId) return;

    const phaseNum = parsePhaseToNumber(phaseVal);

    const projectName = projectFromColumn || currentProjectTitle || "";
    if (!projectName) return;

    addTask(projectName, phaseNum, taskId);
  });

  return { projects };
}

async function appendGateDependenciesFromObjectsSheet() {
  const opt = readKonatusOptionsSafe();
  const withGate = toBool(opt.withGate);
  if (!withGate) return { appended: 0, reason: "Gate OFF" };

  // IMPORTANT:
  // Les d�pendances "par gate" ne doivent PAS �tre �crites en produit cart�sien dans depends_*.txt.
  // L'algorithme C++ g�re d�j� la contrainte "phase (gate) adjacente" par projet (voir Data::readData),
  // � condition que work_element contienne le bon project_id et attribut le bon phase_id.
  return { appended: 0, reason: "Gate ON: handled by project_id (work_element) + phase_id (attribut)" };
}

/* ============== Runner ============== */
async function runVerifyAndGenerateAll() {
  const work_element = await generateWorkElementFromInputXlsx();
  const attribut = await generateAttributFileFromInputXlsx();
  const team_backlog = await generateTeamBacklogFileFromInputXlsx();
  const team_resources = await generateTeamResourcesFromCapacitySheet();
  const depends = await generateDependsFileFromInputLinksXlsx();

  let gate = { appended: 0, reason: "Gate OFF" };
  try {
    gate = await appendGateDependenciesFromObjectsSheet();
  } catch (e) {
    gate = { appended: 0, reason: "Gate error: " + (e?.message || String(e)) };
  }

  return {
    success: true,
    message: "V�rification + g�n�ration des fichiers OK",
    gate,
    files: { work_element, attribut, team_backlog, team_resources, depends },
  };
}

/* ============== Express ============== */
export default (app) => {
  app.get("/api/verify-before-optimization", async (_req, res) => {
    try {
      const result = await runVerifyAndGenerateAll();
      res.json(result);
    } catch (e) {
      res.status(500).json({ success: false, message: e.message || String(e) });
    }
  });
};
