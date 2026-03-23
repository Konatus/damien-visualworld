/**
 * ? SMART WORK ITEM MOVER V4 - PROJECT ROWS
 * - Alignement horizontal par projet (rangées)
 * - Saut de ligne intelligent
 * - Gestion overflow
 * - Tri start_date_test
 *
 * ? Modifs:
 * - worldId & boardId passés en arguments: --worldId / --boardId
 * - mode --auto (pas de confirmation / pas de countdown)
 */

const SmartWorkItemMoverV4 = require("./smart-work-item-mover-v4-project-rows.js");

function getArgValue(args, key) {
  const i = args.indexOf(key);
  if (i === -1) return null;
  return args[i + 1] || null;
}
function hasFlag(args, flag) {
  return args.includes(flag);
}

async function runProjectRows({ worldId, boardId, auto }) {
  const mover = new SmartWorkItemMoverV4();

  console.log("?? SMART MOVER V4 - PROJECT ROWS");
  console.log(`?? worldId=${worldId}`);
  console.log(`?? boardId=${boardId}`);
  console.log("");

  try {
    console.log("?? ÉTAPE 1: Détection et analyse des projets\n");
    await mover.displayProjectSummary(worldId, boardId);

    if (!auto) {
      console.log("\n?? CONFIRMATION REQUISE (mode manuel)");
      console.log("Ctrl+C pour annuler, sinon attendre 10 secondes...\n");
      for (let i = 10; i > 0; i--) {
        process.stdout.write(`\r? Organisation dans ${i} secondes...`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log("\r? Démarrage de l'organisation !                \n");
    } else {
      console.log("? MODE AUTO: pas de confirmation, démarrage direct.\n");
    }

    console.log("?? ÉTAPE 2: Organisation par projets en rangées\n");
    const results = await mover.organizeWorkItems(worldId, boardId);

    console.log("\n?? ÉTAPE 3: Résumé final\n");
    await mover.displayProjectSummary(worldId, boardId);

    console.log("\n?? RÉSULTATS:");
    const resultsByProject = {};
    results.forEach((r) => {
      const p = r.project || "UNKNOWN";
      if (!resultsByProject[p]) resultsByProject[p] = [];
      resultsByProject[p].push(r);
    });

    Object.entries(resultsByProject).forEach(([project, items]) => {
      console.log(`\n?? Projet ${project}:`);
      console.log(`   ? ${items.length} items organisés`);
      const overflowCount = items.filter((i) => i.isOverflow).length;
      if (overflowCount > 0) console.log(`   ?? Overflow: ${overflowCount}`);
    });

    console.log("\n?? TERMINÉ (V4 Project Rows) !");
    return { success: true, moved: results.length };
  } catch (error) {
    console.error("? ERREUR:", error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);

  const worldId =
    getArgValue(args, "--worldId") ||
    getArgValue(args, "-w") ||
    "68b70d885688a422d9513890"; // fallback

  const boardId =
    getArgValue(args, "--boardId") ||
    getArgValue(args, "-b") ||
    "693fc24fd7aa7f89fcf3ef48"; // fallback

  const auto = hasFlag(args, "--auto") || hasFlag(args, "-a") || !hasFlag(args, "--manual");

  if (hasFlag(args, "--help") || hasFlag(args, "-h")) {
    console.log("SMART WORK ITEM MOVER V4 - PROJECT ROWS\n");
    console.log("Usage:");
    console.log("  node test-smart-mover-v4-project-rows.js --worldId <id> --boardId <id> --auto");
    console.log("  node test-smart-mover-v4-project-rows.js -w <id> -b <id> --manual");
    process.exit(0);
  }

  const res = await runProjectRows({ worldId, boardId, auto });
  process.exit(res.success ? 0 : 1);
}

main();
