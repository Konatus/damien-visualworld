// /root/visualworld-main/api/src/listeners-express/download-optimization-output.js
import fs from "fs";
import path from "path";

export default (express) => {
  express.get("/api/download-optimization-output", (req, res) => {
    try {
      // On essaye plusieurs noms possibles (selon tes scripts)
      const candidates = [
        "/root/visualworld-main/DataFile/OutDataOptimizationV1.xlsx",
        "/root/visualworld-main/DataFile/OutputDataOptimizationV1.xlsx",
        "/root/visualworld-main/DataFile/OutDataOptimizationV0.xlsx",
        "/root/visualworld-main/DataFile/OutputDataOptimization.xlsx",
      ];

      const filePath = candidates.find((p) => fs.existsSync(p));

      if (!filePath) {
        return res
          .status(404)
          .send(
            `Aucun fichier de sortie trouv�. Cherch�: \n- ${candidates.join(
              "\n- "
            )}\n\nLance d'abord: optimisation + recalculate-iterations.`
          );
      }

      const filename = path.basename(filePath);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      return res.sendFile(filePath);
    } catch (e) {
      return res.status(500).send(`Erreur download output: ${e.message}`);
    }
  });
};
