// /root/visualworld/api/src/listeners-express/download-outdata-optimization-v1.js
import fs from "fs";
import path from "path";

export default (express) => {
  express.get("/api/download-outdata-optimization-v1", (req, res) => {
    try {
      const filePath = "/root/visualworld/DataFile/OutDataOptimizationV1.xlsx";

      if (!fs.existsSync(filePath)) {
        return res
          .status(404)
          .send(
            `Fichier introuvable: ${filePath}\nLance d'abord: optimisation + recalculate-iterations.`
          );
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`
      );

      return res.sendFile(filePath);
    } catch (e) {
      return res.status(500).send(`Erreur download: ${e.message}`);
    }
  });
};
