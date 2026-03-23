// /root/visualworld-main/iteration-calculator.js
// Module CommonJS utilis� par recalculate-iterations.js
//
// ? ExcelJS (conserve formats/dates)
// ? Headers row = 1
// ? Remplit start_date depuis solution.csv
// ? Calcule iteration & due_iteration en jours ouvr�s (+ holidays.json optionnel)
// ? �crit OutputDataOptimizationV1.xlsx et v�rifie qu'il existe
//
// ? FIX: iterationDurationDays + startDate pilot�s par l'UI (options)

const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

// --------------------------------------------------------------------
// Chemins des fichiers
const INPUT_XLSX = "/root/visualworld-main/DataFile/InputDataOptimizationV1.xlsx";
const OUT_V0_XLSX = "/root/visualworld-main/DataFile/OutputDataOptimizationV0.xlsx";
const OUT_V1_XLSX = "/root/visualworld-main/DataFile/OutputDataOptimizationV1.xlsx";
const SOLUTION_CSV =
  "/root/visualworld-main/OptimizationCode/OptimizationAlgorithm/Output/solution.csv";

// Jours f�ri�s optionnels
const HOLIDAYS_JSON = "/root/visualworld-main/DataFile/holidays.json";

// --------------------------------------------------------------------
// Param�tres fixes (hors options UI)
const SHEET_NAME = "Objets";
const DATE_FMT = "dd/mm/yyyy";

// Colonnes dans solution.csv (1-based), s�parateur d�tect� auto
const COL_WE_NAME_SOL = 2;     // workelement_name
const COL_START_DATE_SOL = 12; // start_date

// --------------------------------------------------------------------
// Helpers

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function normalizeKey(s) {
  if (s == null) return "";
  let x = String(s).replace(/\u00A0/g, " ").trim().toLowerCase();
  x = x.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  x = x.replace(/[_\-��/\\]+/g, " ");
  x = x.replace(/\s+/g, " ").trim();
  return x;
}

function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function cellToString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return toYMD(value);

  if (typeof value === "object") {
    if (value.result != null) return cellToString(value.result);
    if (Array.isArray(value.richText)) {
      return value.richText.map((t) => t.text || "").join("");
    }
    if (value.text) return String(value.text);
    return String(value);
  }
  return String(value);
}

function parseDateAny(value) {
  if (value == null) return null;

  if (value instanceof Date) return isValidDate(value) ? value : null;

  if (typeof value === "object" && value.result != null) {
    return parseDateAny(value.result);
  }

  // Excel serial number
  if (typeof value === "number") {
    const base = new Date(Date.UTC(1899, 11, 30));
    const dt = new Date(base.getTime() + value * 86400000);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }

  const s = String(cellToString(value)).trim();
  if (!s) return null;

  const patterns = [
    { sep: "-", order: "YMD" },
    { sep: "-", order: "DMY" },
    { sep: "/", order: "DMY" },
    { sep: "/", order: "YMD" },
  ];

  for (const p of patterns) {
    const parts = s.split(p.sep);
    if (parts.length !== 3) continue;

    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const c = parseInt(parts[2], 10);
    if ([a, b, c].some(Number.isNaN)) continue;

    let y, m, d;
    if (p.order === "YMD") {
      y = a; m = b; d = c;
    } else {
      d = a; m = b; y = c;
    }

    const dt = new Date(y, m - 1, d);
    if (isValidDate(dt)) return dt;
  }

  const dt = new Date(s);
  return isValidDate(dt) ? dt : null;
}

function detectCsvSeparator(headerLine) {
  const cands = [";", ",", "\t"];
  let best = ";";
  let bestCount = -1;
  for (const sep of cands) {
    const n = headerLine.split(sep).length;
    if (n > bestCount) {
      bestCount = n;
      best = sep;
    }
  }
  return best;
}

function readSolutionMap() {
  if (!fs.existsSync(SOLUTION_CSV)) {
    throw new Error(`solution.csv introuvable : ${SOLUTION_CSV}`);
  }

  const content = fs.readFileSync(SOLUTION_CSV, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) {
    throw new Error("solution.csv ne contient pas de donn�es (seulement l'ent�te ?)");
  }

  const sep = detectCsvSeparator(lines[0]);
  const dataLines = lines.slice(1);

  const nameIdx0 = COL_WE_NAME_SOL - 1;
  const startIdx0 = COL_START_DATE_SOL - 1;

  const map = new Map();
  for (const line of dataLines) {
    const cols = line.split(sep);
    const rawName = cols[nameIdx0] != null ? String(cols[nameIdx0]).trim() : "";
    const rawDate = cols[startIdx0] != null ? String(cols[startIdx0]).trim() : "";
    if (!rawName) continue;

    const d = parseDateAny(rawDate);
    if (!d) continue;

    map.set(normalizeKey(rawName), d);
  }

  console.log(`? solution.csv: ${map.size} start_date charg�es (sep="${sep}")`);
  return map;
}

function loadHolidaysSet() {
  const set = new Set();
  if (!fs.existsSync(HOLIDAYS_JSON)) {
    console.warn(
      `?? holidays.json introuvable (${HOLIDAYS_JSON}) -> sans jours f�ri�s (weekend only).`
    );
    return set;
  }
  try {
    const obj = JSON.parse(fs.readFileSync(HOLIDAYS_JSON, "utf8"));
    const arr = Array.isArray(obj) ? obj : Array.isArray(obj.holidays) ? obj.holidays : [];
    for (const x of arr) {
      const d = parseDateAny(x);
      if (d) set.add(toYMD(d));
    }
    console.log(`? Jours f�ri�s charg�s: ${set.size}`);
    return set;
  } catch (e) {
    console.warn(`?? holidays.json illisible -> ${e.message} -> sans jours f�ri�s.`);
    return set;
  }
}

function isBusinessDay(d, holidaysSet) {
  const day = d.getDay(); // 0 dim ... 6 sam
  if (day === 0 || day === 6) return false;
  if (holidaysSet && holidaysSet.has(toYMD(d))) return false;
  return true;
}

function businessDaysBetween(d1, d2, holidaysSet) {
  const a = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const b = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  if (!isValidDate(a) || !isValidDate(b)) return 0;
  if (a.getTime() === b.getTime()) return 0;

  const forward = b > a;
  let count = 0;
  const cur = new Date(a);

  while (cur.getTime() !== b.getTime()) {
    cur.setDate(cur.getDate() + (forward ? 1 : -1));
    if (isBusinessDay(cur, holidaysSet)) count += forward ? 1 : -1;
  }
  return count;
}

// --------------------------------------------------------------------
// Headers row = 1. On mappe par nom de colonne.

const REQUIRED_HEADERS = [
  "name",
  "start_date",
  "due_date",
  "due_start_date",
  "iteration",
  "due_iteration",
];

function buildHeaderIndexMap(ws, headerRowNumber = 1) {
  const headerRow = ws.getRow(headerRowNumber);

  const map = {}; // normalized header => colIndex
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const h = normalizeKey(cellToString(cell.value));
    if (h) map[h] = colNumber;
  });

  const missing = [];
  for (const h of REQUIRED_HEADERS) {
    if (!map[normalizeKey(h)]) missing.push(h);
  }

  if (missing.length) {
    const sample = Object.keys(map).slice(0, 60).join(" | ");
    throw new Error(
      `Headers manquants: ${missing.join(", ")}. Headers d�tect�s(sample): ${sample}`
    );
  }

  return {
    name: map[normalizeKey("name")],
    start_date: map[normalizeKey("start_date")],
    due_date: map[normalizeKey("due_date")],
    due_start_date: map[normalizeKey("due_start_date")],
    iteration: map[normalizeKey("iteration")],
    due_iteration: map[normalizeKey("due_iteration")],
  };
}

function findLastDataRow(ws, nameCol, firstDataRow) {
  const max = ws.rowCount;
  for (let r = max; r >= firstDataRow; r--) {
    const v = cellToString(ws.getRow(r).getCell(nameCol).value).trim();
    if (v) return r;
  }
  return firstDataRow - 1;
}

// --------------------------------------------------------------------
// ? Options UI helpers

function parseISODateOrFallback(iso, fallbackDate) {
  const d = parseDateAny(iso);
  if (d && isValidDate(d)) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return new Date(
    fallbackDate.getFullYear(),
    fallbackDate.getMonth(),
    fallbackDate.getDate()
  );
}

function parseIterationDaysOrFallback(v, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const k = Math.floor(n);
  return k >= 1 ? k : fallback;
}

// --------------------------------------------------------------------
// Classe principale

class IterationCalculator {
  /**
   * ? options attendues:
   *  - startDate: "yyyy-MM-dd" (ou autre parseable)
   *  - iterationDurationDays: number
   *  - withGate: bool (pas utilis� ici, mais propag� pour coh�rence)
   */
  async processOptimizationFiles(options = {}) {
    const results = [];
    try {
      const r = await this._processSingleFile(options);
      results.push(r);
    } catch (err) {
      console.error("? Erreur iteration-calculator:", err);
      results.push({
        filePath: INPUT_XLSX,
        success: false,
        processedCount: 0,
        updatedCount: 0,
        error: err.message || String(err),
      });
    }
    return results;
  }

  async _processSingleFile(options = {}) {
    if (!fs.existsSync(INPUT_XLSX)) {
      throw new Error(`Fichier d'entr�e introuvable : ${INPUT_XLSX}`);
    }

    // ? Options UI (avec fallback sur 01-01-2025 et 14)
    const DEFAULT_CURRENT_DATE = new Date(2025, 0, 1); // 01-01-2025
    const CURRENT_DATE = parseISODateOrFallback(options.startDate, DEFAULT_CURRENT_DATE);
    const ITERATION_DAYS = parseIterationDaysOrFallback(options.iterationDurationDays, 14);

    console.log(
      `?? IterationCalculator options: startDate=${toYMD(CURRENT_DATE)}, iterationDays=${ITERATION_DAYS}, withGate=${!!options.withGate}`
    );

    // 1) Copie identique vers V0
    fs.copyFileSync(INPUT_XLSX, OUT_V0_XLSX);
    console.log("? Copie OK ->", OUT_V0_XLSX);

    // 2) Charger V0
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(OUT_V0_XLSX);

    const ws = workbook.getWorksheet(SHEET_NAME);
    if (!ws) {
      throw new Error(`Feuille "${SHEET_NAME}" introuvable dans ${OUT_V0_XLSX}`);
    }

    // 3) Colonnes (headers row 1)
    const cols = buildHeaderIndexMap(ws, 1);
    console.log("? Colonnes d�tect�es:", cols);

    const firstDataRow = 2;
    const lastRow = findLastDataRow(ws, cols.name, firstDataRow);
    console.log(`? Data rows: ${firstDataRow}..${lastRow}`);

    if (lastRow < firstDataRow) {
      throw new Error("Aucune ligne de donn�es d�tect�e (sheet vide ?).");
    }

    // 4) Maps
    const solMap = readSolutionMap();
    const holidaysSet = loadHolidaysSet();

    let processed = 0;
    let updated = 0;

    let matchedFromSolution = 0;
    let keptExisting = 0;
    let missingEverywhere = 0;

    // A) Remplir start_date depuis solution.csv (sinon garder existant)
    for (let r = firstDataRow; r <= lastRow; r++) {
      const row = ws.getRow(r);

      const nameRaw = cellToString(row.getCell(cols.name).value).trim();
      if (!nameRaw) continue;

      const key = normalizeKey(nameRaw);
      const startCell = row.getCell(cols.start_date);

      const dSol = solMap.get(key);
      if (dSol && isValidDate(dSol)) {
        startCell.value = dSol;
        startCell.numFmt = DATE_FMT;
        matchedFromSolution++;
        updated++;
      } else {
        const existing = parseDateAny(startCell.value);
        if (existing) {
          startCell.value = existing;
          startCell.numFmt = DATE_FMT;
          keptExisting++;
        } else {
          missingEverywhere++;
        }
      }

      processed++;
    }

    console.log(
      `? start_date: from solution=${matchedFromSolution}, kept existing=${keptExisting}, missing=${missingEverywhere}`
    );

    // B) Normaliser les dates (due_date & due_start_date) au format date Excel
    let normDue = 0;
    let normDueStart = 0;

    for (let r = firstDataRow; r <= lastRow; r++) {
      const row = ws.getRow(r);

      const dueCell = row.getCell(cols.due_date);
      const d1 = parseDateAny(dueCell.value);
      if (d1) {
        dueCell.value = d1;
        dueCell.numFmt = DATE_FMT;
        normDue++;
      }

      const dueStartCell = row.getCell(cols.due_start_date);
      const d2 = parseDateAny(dueStartCell.value);
      if (d2) {
        dueStartCell.value = d2;
        dueStartCell.numFmt = DATE_FMT;
        normDueStart++;
      }
    }

    console.log(
      `? Normalisation dates: due_date=${normDue}, due_start_date=${normDueStart}`
    );

    // C) iteration (jours ouvr�s) depuis start_date
    let itUpdates = 0;
    for (let r = firstDataRow; r <= lastRow; r++) {
      const row = ws.getRow(r);

      const dStart = parseDateAny(row.getCell(cols.start_date).value);
      const itCell = row.getCell(cols.iteration);

      if (!dStart) {
        itCell.value = null;
        continue;
      }

      const deltaBD = businessDaysBetween(dStart, CURRENT_DATE, holidaysSet);
      const iteration = Math.floor(deltaBD / ITERATION_DAYS) + 1;

      itCell.value = iteration;
      itUpdates++;
      updated++;
    }

    console.log(`? iteration updated: ${itUpdates} (ITERATION_DAYS=${ITERATION_DAYS})`);

    // D) due_iteration (jours ouvr�s) depuis due_start_date
    let dueItUpdates = 0;
    for (let r = firstDataRow; r <= lastRow; r++) {
      const row = ws.getRow(r);

      const dDueStart = parseDateAny(row.getCell(cols.due_start_date).value);
      const dueItCell = row.getCell(cols.due_iteration);

      if (!dDueStart) {
        dueItCell.value = null;
        continue;
      }

      const deltaBD = businessDaysBetween(dDueStart, CURRENT_DATE, holidaysSet);
      const dueIter = Math.floor(deltaBD / ITERATION_DAYS) + 1;

      dueItCell.value = dueIter;
      dueItUpdates++;
      updated++;
    }

    console.log(`? due_iteration updated: ${dueItUpdates} (ITERATION_DAYS=${ITERATION_DAYS})`);

    // 6) �crire V1
    fs.mkdirSync(path.dirname(OUT_V1_XLSX), { recursive: true });
    console.log("?? Writing:", OUT_V1_XLSX);

    await workbook.xlsx.writeFile(OUT_V1_XLSX);

    if (!fs.existsSync(OUT_V1_XLSX)) {
      throw new Error(`�chec: le fichier n'a pas �t� cr�� => ${OUT_V1_XLSX}`);
    }

    const size = fs.statSync(OUT_V1_XLSX).size;
    console.log(`? Output g�n�r�: ${OUT_V1_XLSX} (${size} bytes)`);
    console.log(`?? R�sum� -> processed=${processed}, updated=${updated}`);

    return {
      filePath: OUT_V1_XLSX,
      success: true,
      processedCount: processed,
      updatedCount: updated,
      error: null,
    };
  }
}

module.exports = IterationCalculator;