// /root/visualworld-main/server/preatretment_input.js
// -*- coding: utf-8 -*-

const Excel = require("exceljs");

// Input & output Excel files
const INPUT_FILE = "/root/visualworld-main/DataFile/InputDataOptimization.xlsx";
const OUTPUT_FILE = "/root/visualworld-main/DataFile/InputDataOptimizationV1.xlsx";

// Mapping: project name -> prefix for its tasks
const PROJECT_PREFIXES = {
  "forfait familial": "FF",
  "nouveau programme reparation": "REP",
  "abonnement ligue1": "L1",
  "nv programme fidelite": "FID",
};

// List of holidays (optional)
const HOLIDAYS = [
  // new Date(2025, 0, 1),
];

// ------------------ Helpers ------------------ //

function normStr(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function isEmpty(v) {
  const s = normStr(v).toLowerCase();
  return s === "" || s === "null" || s === "none" || s === "nan" || s === "undefined";
}

function normalize(text) {
  if (text === null || text === undefined) return "";
  let s = String(text).trim().toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return s;
}

function toFloat(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  const s = normStr(v).replace(",", ".");
  if (!s) return null;
  const f = Number(s);
  return Number.isNaN(f) ? null : f;
}

// ExcelJS cell.value can be string/number/Date or object {formula,result} or {richText}
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

// Excel serial date -> JS Date (1900-based)
function excelSerialToDate(serial) {
  // Excel day 1 = 1899-12-31, but common safe epoch uses 1899-12-30
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const ms = Math.round(serial * 86400000);
  const d = new Date(epoch.getTime() + ms);
  // convert to local date (avoid timezone surprises)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function toDate(value) {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) return value;

  if (typeof value === "object") {
    if (value.text) return toDate(value.text);
    if (value.result !== undefined) return toDate(value.result);
  }

  if (typeof value === "number") {
    return excelSerialToDate(value);
  }

  const s = normStr(value);
  if (!s) return null;

  // YYYY-MM-DD
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

  // DD/MM/YYYY
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));

  // DD-MM-YYYY
  m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));

  return null;
}

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isBusinessDay(d) {
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  for (const h of HOLIDAYS) if (sameDay(d, h)) return false;
  return true;
}

function workdayBackward(endDate, wdCount) {
  if (!wdCount || wdCount <= 1) return endDate;

  let daysToMove = wdCount - 1;
  let current = new Date(endDate.getTime());

  while (daysToMove > 0) {
    current = new Date(current.getTime() - 24 * 3600 * 1000);
    if (isBusinessDay(current)) daysToMove -= 1;
  }
  return current;
}

// ---------- HEADER-BASED COLUMN MAP (FIX MAJEUR) ----------
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

function col(map, headerName, fallbackIdx = null) {
  return map[normalizeHeaderName(headerName)] || fallbackIdx;
}

// ------------------ Core processing ------------------ //

async function runPretraitementInput() {
  console.log("=== START preatretment_input (server) ===");
  console.log("Loading workbook:", INPUT_FILE);

  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(INPUT_FILE);

  let ws = wb.getWorksheet("Objets");
  if (!ws) ws = wb.worksheets[0];

  const headerMap = buildHeaderMap(ws);

  // ? Find columns by headers (robust, avoids wrong indices)
  const COL_MODEL = col(headerMap, "mod�le", 1); // fallback A
  const COL_NAME = col(headerMap, "name"); // required
  const COL_DUE_DATE = col(headerMap, "due_date"); // required
  const COL_FTE = col(headerMap, "fte");
  const COL_LOAD = col(headerMap, "load");
  const COL_DURATION = col(headerMap, "duration");
  const COL_DUE_START = col(headerMap, "due_start_date");

  const missing = [];
  if (!COL_NAME) missing.push("name");
  if (!COL_DUE_DATE) missing.push("due_date");
  if (!COL_FTE) missing.push("fte");
  if (!COL_LOAD) missing.push("load");
  if (!COL_DURATION) missing.push("duration");
  if (!COL_DUE_START) missing.push("due_start_date");

  if (missing.length) {
    throw new Error(
      `Colonnes introuvables dans "Objets": ${missing.join(", ")}. ` +
        `V�rifie la ligne d'en-t�tes (row 1) de InputDataOptimization.xlsx.`
    );
  }

  const projectDueDates = {};
  const rowCount = ws.rowCount;

  // 1) Extract project due dates from "K - Feature" rows
  for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
    const row = ws.getRow(rowNumber);
    const modelValue = getCellValue(row, COL_MODEL);
    const nameValue = getCellValue(row, COL_NAME);

    if (isEmpty(modelValue) || isEmpty(nameValue)) continue;

    const modelNorm = normalize(modelValue);
    const nameNorm = normalize(nameValue);

    if (modelNorm === normalize("k - feature")) {
      const dueDateVal = getCellValue(row, COL_DUE_DATE);
      if (isEmpty(dueDateVal)) continue;

      const dueDate = toDate(dueDateVal);
      if (!dueDate) continue;

      for (const [projName, prefix] of Object.entries(PROJECT_PREFIXES)) {
        if (nameNorm === normalize(projName)) {
          projectDueDates[prefix.toUpperCase()] = dueDate;
        }
      }
    }
  }

  console.log("Detected project due dates:");
  for (const [prefix, dateVal] of Object.entries(projectDueDates)) {
    console.log(`  ${prefix} -> ${dateVal.toISOString().slice(0, 10)}`);
  }

  // 2) Apply project due_date to all tasks ("K - Work Item")
  let updatedDueRows = 0;

  for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
    const row = ws.getRow(rowNumber);
    const modelValue = getCellValue(row, COL_MODEL);
    const nameValue = getCellValue(row, COL_NAME);

    if (isEmpty(modelValue) || isEmpty(nameValue)) continue;

    const modelNorm = normalize(modelValue);
    const nameClean = normStr(nameValue).toUpperCase();

    if (modelNorm === normalize("k - work item")) {
      for (const [prefix, dueDate] of Object.entries(projectDueDates)) {
        if (nameClean.startsWith(prefix)) {
          row.getCell(COL_DUE_DATE).value = dueDate;
          row.getCell(COL_DUE_DATE).numFmt = "dd/mm/yyyy";
          updatedDueRows += 1;
          break;
        }
      }
    }
  }

  console.log("Updated due_date rows:", updatedDueRows);

  // 3) Compute duration = load / fte (only for work items)
  let updatedDurationRows = 0;

  for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
    const row = ws.getRow(rowNumber);
    const modelValue = getCellValue(row, COL_MODEL);
    if (normalize(modelValue) !== normalize("k - work item")) continue;

    const loadF = toFloat(getCellValue(row, COL_LOAD));
    const fteF = toFloat(getCellValue(row, COL_FTE));

    if (loadF !== null && fteF !== null && fteF > 0) {
      const duration = Math.round((loadF / fteF) * 100) / 100;
      row.getCell(COL_DURATION).value = duration;
      updatedDurationRows += 1;
    } else {
      // important: do NOT write "null" string
      // keep empty if not computable
      if (isEmpty(getCellValue(row, COL_DURATION))) row.getCell(COL_DURATION).value = null;
    }
  }

  console.log("Updated duration rows:", updatedDurationRows);

  // 4) Compute due_start_date (working-day backward) for work items
  let updatedStartRows = 0;

  for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
    const row = ws.getRow(rowNumber);
    const modelValue = getCellValue(row, COL_MODEL);
    if (normalize(modelValue) !== normalize("k - work item")) continue;

    const dueVal = getCellValue(row, COL_DUE_DATE);
    const durVal = getCellValue(row, COL_DURATION);

    if (isEmpty(dueVal)) continue;

    const dueDate = toDate(dueVal);
    if (!dueDate) continue;

    const durF = toFloat(durVal);
    if (durF === null || durF <= 0) continue;

    const durationDays = Math.max(1, Math.round(durF));
    const startDate = workdayBackward(dueDate, durationDays);

    row.getCell(COL_DUE_START).value = startDate;
    row.getCell(COL_DUE_START).numFmt = "dd/mm/yyyy";

    updatedStartRows += 1;
  }

  console.log("Updated due_start_date rows:", updatedStartRows);

  // 5) Save workbook
  await wb.xlsx.writeFile(OUTPUT_FILE);
  console.log("Saved result to:", OUTPUT_FILE);
  console.log("=== END preatretment_input (server) ===");

  return OUTPUT_FILE;
}

module.exports = runPretraitementInput;
