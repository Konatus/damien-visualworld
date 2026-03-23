// /root/visualworld-main/server/runKonatus.js
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

// ?? on importe la fonction de pr�traitement
const runPretraitementInput = require("./preatretment_input");

const app = express();
const PORT = 5055; // use a free port

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// --------- NOUVELLE ROUTE : pr�traitement ---------
app.post("/api/preatretment-input", async (req, res) => {
  try {
    const output = await runPretraitementInput();
    return res.json({
      success: true,
      output,
    });
  } catch (error) {
    console.error("[ERR preatretment-input]", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// --------- EXISTANT : lancement optimisation Python ---------
app.post("/run-konatus", (req, res) => {
  const cmd = "python3 /root/visualworld-main/OptimizationCode/ExternScript/main.py";
  console.log("[RUN]", cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("[ERR]", error.message);
      return res
        .status(500)
        .json({ success: false, error: error.message, stderr });
    }
    res.json({ success: true, stdout, stderr });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Konatus API running on port ${PORT}`);
});
