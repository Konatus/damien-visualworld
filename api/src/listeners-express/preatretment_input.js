// /root/visualworld-main/api/src/listeners-express/preatretment_input.js
// Route Express: POST /api/preatretment-input
// Elle appelle le script Node du dossier /server

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// On importe la fonction Node (CommonJS) situ�e dan/root/visualworld-mainld/server
const runPretraitementInput = require("/root/visualworld-main/server/preatretment_input.js");

export default (express) => {
  express.post("/api/preatretment-input", async (req, res) => {
    try {
      console.log("[API] /api/preatretment-input called");

      const outputPath = await runPretraitementInput();

      console.log("[API] pretraitement OK, output:", outputPath);
      return res.json({
        success: true,
        output: outputPath,
      });
    } catch (err) {
      console.error("[API] pretraitement error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Unknown error in pretraitement",
      });
    }
  });
};
