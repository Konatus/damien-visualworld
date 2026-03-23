// /root/visualworld/api/src/listeners-express/recalculate-iterations.js

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const fs = require("fs");

const OUT_V1_XLSX = "/root/visualworld/DataFile/OutputDataOptimizationV1.xlsx";
const OPTIONS_JSON = "/root/visualworld/DataFile/konatus_options.json";

function readKonatusOptions() {
  const defaults = {
    startDate: "2025-01-01",
    iterationDurationDays: 14,
    withGate: false,
  };

  try {
    if (!fs.existsSync(OPTIONS_JSON)) return defaults;

    const raw = fs.readFileSync(OPTIONS_JSON, "utf-8");
    const j = JSON.parse(raw || "{}");

    const d = Number(j.iterationDurationDays);
    const iterationDurationDays =
      Number.isFinite(d) && d >= 1 ? Math.floor(d) : defaults.iterationDurationDays;

    return {
      startDate: j.startDate || defaults.startDate,
      iterationDurationDays,
      withGate: !!j.withGate,
    };
  } catch (e) {
    console.error("? Impossible de lire konatus_options.json:", e.message);
    return defaults;
  }
}

export default (express) => {
  // POST /api/recalculate-iterations
  express.post("/api/recalculate-iterations", async (_req, res) => {
    try {
      const opt = readKonatusOptions();
      console.log("?? Options utilisées:", opt);

      const calculatorPath = path.join(__dirname, "../../../iteration-calculator.js");

      delete require.cache[require.resolve(calculatorPath)];
      const CalculatorModule = require(calculatorPath);
      const IterationCalculator = CalculatorModule.default || CalculatorModule;

      const calculator = new IterationCalculator();

      const results =
        (await calculator.processOptimizationFiles({
          startDate: opt.startDate,
          iterationDurationDays: opt.iterationDurationDays,
          withGate: opt.withGate,
        })) || [];

      if (!fs.existsSync(OUT_V1_XLSX)) {
        return res.status(500).json({
          success: false,
          error: `Le fichier attendu n'a pas été généré: ${OUT_V1_XLSX}`,
          optionsUsed: opt,
          details: results,
        });
      }

      const successCount = results.filter((r) => r.success).length;
      const totalUpdated = results.reduce((sum, r) => sum + (r.updatedCount || 0), 0);
      const totalProcessed = results.reduce((sum, r) => sum + (r.processedCount || 0), 0);

      res.json({
        success: true,
        outputFile: OUT_V1_XLSX,
        optionsUsed: opt,
        summary: {
          filesProcessed: results.length,
          filesSuccess: successCount,
          totalLinesProcessed: totalProcessed,
          totalLinesUpdated: totalUpdated,
        },
        details: results,
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e?.message || String(e) });
    }
  });

  // GET /api/recalculate-iterations/status
  express.get("/api/recalculate-iterations/status", (_req, res) => {
    const opt = readKonatusOptions();
    res.json({
      success: true,
      currentDate: opt.startDate,
      iterationDuration: opt.iterationDurationDays,
      withGate: opt.withGate,
      optionsFileExists: fs.existsSync(OPTIONS_JSON),
    });
  });
};