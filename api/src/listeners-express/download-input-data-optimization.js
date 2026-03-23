// /root/visualworld-main/api/src/listeners-express/download-input-data-optimization.js
// -*- coding: utf-8 -*-

import fs from "fs";
import path from "path";

const FILE_PATH = "/root/visualworld-main/DataFile/InputDataOptimizationV1.xlsx";
const FILE_NAME = "InputDataOptimizationV1.xlsx";

export default (express) => {
  // GET /api/download-input-data-optimization
  express.get("/api/download-input-data-optimization", (req, res) => {
    console.log("[API] /api/download-input-data-optimization");

    fs.access(FILE_PATH, fs.constants.R_OK, (err) => {
      if (err) {
        console.error("[API] Fichier introuvable :", FILE_PATH, err);
        return res.status(404).json({
          success: false,
          error: "Fichier InputDataOptimizationV1.xlsx introuvable sur le serveur.",
        });
      }

      // T�l�chargement direct
      res.download(FILE_PATH, FILE_NAME, (downloadErr) => {
        if (downloadErr) {
          console.error("[API] Erreur durant le t�l�chargement :", downloadErr);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: "Erreur lors de l'envoi du fichier.",
            });
          }
        }
      });
    });
  });
};
