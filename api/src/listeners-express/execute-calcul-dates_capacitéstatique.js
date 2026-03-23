import Express from "express";
import { exec } from "child_process";

// Dossier o� se trouve ton code C++
const OPTI_DIR = "/root/visualworld-main/OptimizationCode/OptimizationAlgorithm";

// Commande de compilation + ex�cution
const COMPILE_AND_RUN_CMD =
  "g++ main.cpp Commun.cpp DateUtils.cpp Parameters.cpp Logger.cpp Data.cpp GeneticAlgo_Nokia.cpp GeneticAlgo.cpp AbstractGeneticAlgo.cpp -o program && ./program -p Input/parameters.txt";

export default async (express) => {
  express.post(
    "/api/execute-calcul-dates",
    function (req, res, next) {
      console.log("?? Endpoint /api/execute-calcul-dates appel�");
      next();
    },
    async function (req, res) {
      try {
        console.log("?? Lancement du programme C++ d'optimisation...");
        const result = await executeCppProgram();

        console.log("? Programme C++ termin� avec succ�s");

        res.status(200).json({
          success: true,
          message: "Programme C++ ex�cut� avec succ�s",
          stdout: result.stdout,
          stderr: result.stderr,
        });
      } catch (error) {
        console.error("? Erreur lors de l'ex�cution du programme C++:", error);
        res.status(500).send({
          success: false,
          error: "Erreur lors de l'ex�cution du programme C++",
          details: error.message,
        });
      }
    }
  );
};

function executeCppProgram() {
  return new Promise((resolve, reject) => {
    console.log(`?? R�pertoire de travail: ${OPTI_DIR}`);
    console.log(`?? Commande C++: ${COMPILE_AND_RUN_CMD}`);

    exec(COMPILE_AND_RUN_CMD, { cwd: OPTI_DIR }, (error, stdout, stderr) => {
      if (error) {
        console.error("? Erreur d'ex�cution C++:", error);
        reject(error);
        return;
      }

      console.log("?? Sortie STDOUT C++:", stdout);
      if (stderr) {
        console.warn("?? Sortie STDERR C++:", stderr);
      }

      resolve({ stdout, stderr });
    });
  });
}
