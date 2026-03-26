// /root/visualworld-main/api/src/listeners-express/index.js

import CONF from "../conf.js";
import Cors from "cors";

import me from "../me/index.js";
import log from "../utils/log.js";

import boardIo from "./board-io.js";
import boardExportExcel from "./board-export-excel.js";
import saveInputDataOptimization from "./save-input-data-optimization.js";
import processExcel from "./process-saved-excel.js";

import calculateCapacityNV from "./calculate-capacity-nv.js";
import executeCalculDates from "./execute-calcul-dates.js";
import recalculateIterations from "./recalculate-iterations.js";
import checkDatabase from "./check-database.js";
import getTeamCapacity from "./get-team-capacity.js";

import eraseCookies from "./erase-cookies.js";
import guest from "./guest.js";
import img from "./img.js";
import stripe from "./stripe.js";
import jiraWebhook from "./jira-webhook.js";
import deleteTrashedDocument from "./delete-trashed-document.js";
import profile from "./profile.js";
import positionUpdate from "./position-update.js";

// Pr?traitement (POST /api/preatretment-input)
import preatretmentInputListener from "./preatretment_input.js";

// T?l?chargements
import downloadInputDataOptimization from "./download-input-data-optimization.js";
import downloadOptimizationOutput from "./download-optimization-output.js";
import downloadOutDataOptimizationV1 from "./download-outdata-optimization-v1.js";

// Smart mover + verify
import registerSmartMoverPositioning from "./smart-mover-positioning.js";
import registerJiraSmartPositioning from "./jira-smart-positioning.js";
import registerVerifyBeforeOptimization from "./verify-before-optimization.js";

// Options Konatus (gate/date/dur?e) (POST/GET /api/konatus-options)
import konatusOptions from "./konatus-options.js";

export default async (express) => {
  /* ==============================
     ? Body parsers (OBLIGATOIRE)
     ============================== */
  // Sans ?a: req.body = {} => Gate ON/OFF ne se sauvegarde jamais correctement
  express.use((req, _res, next) => {
    // s?curit?: ne pas casser si d?j? branch? ailleurs
    next();
  });
  express.use(
    (await import("express")).default.json({ limit: "50mb" })
  );
  express.use(
    (await import("express")).default.urlencoded({ extended: true, limit: "50mb" })
  );

  /* ==============================
     CORS - Autoriser toutes les origines
     ============================== */
  express.use(
    Cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-Email', 'X-Forwarded-Access-Token', 'X-Requested-With'],
    })
  );

  /* ==============================
     Middleware pour req.me
     ============================== */
  express.use(async (req, res, next) => {
    req.me = await me({
      email: req.headers["x-forwarded-email"],
      accessToken: req.headers["x-forwarded-access-token"],
      userAgent: req.headers["user-agent"],
      worldId: req.query.worldId,
      boardId: req.query.boardId,
    });
    next();
  });

  /* ==============================
     Log des requ?tes
     ============================== */
  express.use((req, res, next) => {
    next();
    log.rest(req, res);
  });

  /* ==============================
     Routes principales
     ============================== */

  // ? Options Konatus (Gate/Date/Dur?e it?ration)
  konatusOptions(express);

  // Export / Import
  boardIo(express);
  boardExportExcel(express);
  saveInputDataOptimization(express);
  processExcel(express);

  // Pr?traitement InputDataOptimizationV1.xlsx
  preatretmentInputListener(express);

  // T?l?chargements
  downloadInputDataOptimization(express);
  downloadOptimizationOutput(express);
  downloadOutDataOptimizationV1(express);

  // Positionnement + Verify
  registerSmartMoverPositioning(express);
  registerJiraSmartPositioning(express);
  registerVerifyBeforeOptimization(express);

  // Capacit?s / Calculs
  calculateCapacityNV(express);
  executeCalculDates(express);
  recalculateIterations(express);

  // Divers
  checkDatabase(express);
  getTeamCapacity(express);
  eraseCookies(express);
  guest(express);
  img(express);
  stripe(express);
  jiraWebhook(express);
  deleteTrashedDocument(express);
  profile(express);
  positionUpdate(express);
};
