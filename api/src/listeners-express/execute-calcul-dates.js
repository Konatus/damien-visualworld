import { spawn } from "child_process";

const OPTI_DIR = "/root/visualworld-main/OptimizationCode/OptimizationAlgorithm";

const optimizationState = {
  running: false,
  done: false,
  success: null,
  percent: 0,
  message: "",
  details: "",
  logs: [],
  startedAt: null,
  endedAt: null,
};

let currentProcess = null;

function resetState() {
  optimizationState.running = false;
  optimizationState.done = false;
  optimizationState.success = null;
  optimizationState.percent = 0;
  optimizationState.message = "";
  optimizationState.details = "";
  optimizationState.logs = [];
  optimizationState.startedAt = null;
  optimizationState.endedAt = null;
}

function addLog(line) {
  const msg = String(line || "").trim();
  if (!msg) return;

  optimizationState.logs.push({
    t: new Date().toISOString(),
    m: msg,
  });

  if (optimizationState.logs.length > 400) {
    optimizationState.logs = optimizationState.logs.slice(-400);
  }

  optimizationState.message = msg;

  const m = msg.match(/(\d+)\s*%/);
  if (m) {
    const p = Number(m[1]);
    if (Number.isFinite(p)) {
      optimizationState.percent = Math.max(optimizationState.percent, Math.min(100, p));
    }
  }
}

function fail(message, details = "") {
  optimizationState.running = false;
  optimizationState.done = true;
  optimizationState.success = false;
  optimizationState.message = message;
  optimizationState.details = details || message;
  optimizationState.endedAt = new Date().toISOString();
}

function succeed(details = "") {
  optimizationState.running = false;
  optimizationState.done = true;
  optimizationState.success = true;
  optimizationState.percent = 100;
  optimizationState.message = "Optimisation termin�e";
  optimizationState.details = details || "Programme termin� avec succ�s";
  optimizationState.endedAt = new Date().toISOString();
}

function runOptimization() {
  resetState();
  optimizationState.running = true;
  optimizationState.startedAt = new Date().toISOString();
  optimizationState.percent = 1;
  optimizationState.message = "D�marrage optimisation...";

  const cmd = [
    "cd /root/visualworld-main/OptimizationCode/OptimizationAlgorithm",
    "g++ -std=c++17 main.cpp Commun.cpp DateUtils.cpp Parameters.cpp Logger.cpp Data.cpp GeneticAlgo_Nokia.cpp GeneticAlgo.cpp AbstractGeneticAlgo.cpp -o program",
    "./program -p Input/parameters.txt",
  ].join(" && ");

  console.log("?? Commande optimisation:");
  console.log(cmd);

  try {
    currentProcess = spawn("bash", ["-lc", cmd], {
      cwd: OPTI_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    console.error("? Erreur spawn:", err);
    fail("Erreur lors du lancement du programme C++", err.message || String(err));
    return;
  }

  let stdoutAll = "";
  let stderrAll = "";

  if (currentProcess.stdout) {
    currentProcess.stdout.on("data", (data) => {
      const text = data.toString();
      stdoutAll += text;
      console.log("[optimization stdout]", text);
      text.split(/\r?\n/).forEach(addLog);
    });
  }

  if (currentProcess.stderr) {
    currentProcess.stderr.on("data", (data) => {
      const text = data.toString();
      stderrAll += text;
      console.warn("[optimization stderr]", text);
      text.split(/\r?\n/).forEach(addLog);
    });
  }

  currentProcess.on("error", (err) => {
    console.error("? Process error:", err);
    fail("Erreur lors du lancement du programme C++", err.message || String(err));
    currentProcess = null;
  });

  currentProcess.on("close", (code) => {
    console.log("?? Process close code =", code);
    currentProcess = null;

    if (code !== 0) {
      fail(
        "Erreur lors de l'ex�cution du programme C++",
        stderrAll || stdoutAll || `Code retour: ${code}`
      );
      return;
    }

    succeed(stdoutAll || "Programme termin� correctement");
  });
}

export default async (express) => {
  express.post("/api/execute-calcul-dates", async (_req, res) => {
    try {
      console.log("?? /api/execute-calcul-dates");

      if (optimizationState.running) {
        return res.status(409).json({
          success: false,
          message: "Une optimisation est d�j� en cours",
        });
      }

      runOptimization();

      return res.status(200).json({
        success: true,
        message: "Optimisation d�marr�e",
      });
    } catch (error) {
      console.error("? /api/execute-calcul-dates:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors du lancement du programme C++",
        details: error.message || String(error),
      });
    }
  });

  express.get("/api/optimization-status", async (_req, res) => {
    return res.status(200).json({
      running: optimizationState.running,
      done: optimizationState.done,
      success: optimizationState.success,
      percent: optimizationState.percent,
      message: optimizationState.message,
      details: optimizationState.details,
      startedAt: optimizationState.startedAt,
      endedAt: optimizationState.endedAt,
      logs: optimizationState.logs,
    });
  });
};
