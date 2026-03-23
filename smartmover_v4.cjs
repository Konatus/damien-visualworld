const path = require("path");

function getArgValue(args, key) {
  const i = args.indexOf(key);
  if (i === -1) return null;
  return args[i + 1] || null;
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

(async function main() {
  const args = process.argv.slice(2);

  const worldId = getArgValue(args, "--worldId");
  const boardId = getArgValue(args, "--boardId");

  const componentName = getArgValue(args, "--componentName") || "K - Work Item";
  const projectField = getArgValue(args, "--projectField") || "project";
  const dateField = getArgValue(args, "--dateField") || "start_date_test";

  if (!worldId || !boardId) {
    console.error("Missing --worldId or --boardId");
    process.exit(2);
  }

  // On charge le mover existant (tu l’as déjà)
  const moverPath = path.resolve(__dirname, "./smart-work-item-mover-v4-project-rows.js");
  const SmartWorkItemMoverV4 = require(moverPath);
  const mover = new SmartWorkItemMoverV4();

  // ? On injecte une config simple lisible par le mover (si ton mover ne l'utilise pas, on s'en sert dans logs)
  mover.__RUN_CONFIG__ = { componentName, projectField, dateField };

  console.log("RUN smartmover_v4");
  console.log("worldId=", worldId);
  console.log("boardId=", boardId);
  console.log("componentName=", componentName);
  console.log("projectField=", projectField);
  console.log("dateField=", dateField);

  try {
    // ? si ton mover supporte une config optionnelle, il la prendra
    const results = await mover.organizeWorkItems(worldId, boardId, {
      componentName,
      projectField,
      dateField,
    });

    const moved = Array.isArray(results) ? results.length : 0;
    console.log("DONE moved=", moved);
    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();
