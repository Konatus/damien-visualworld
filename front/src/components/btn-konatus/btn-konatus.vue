<template>
  <div>
    <!-- Launcher -->
    <el-tooltip content="Konatus" placement="right" :open-delay="400">
      <div
        id="btn-konatus"
        class="k-launch"
        :class="{ 'is-active': isPressed }"
        @mousedown="isPressed = true"
        @mouseup="isPressed = false"
        @mouseleave="isPressed = false"
        @click="openWizard"
      >
        <img
          src="../../assets/konatus-ico.png"
          alt="Konatus"
          class="k-launch-ico"
        />
      </div>
    </el-tooltip>

    <!-- Modal -->
    <el-dialog
      v-if="showWizard"
      :visible="true"
      width="860px"
      :append-to-body="true"
      :modal-append-to-body="true"
      :close-on-click-modal="false"
      :lock-scroll="true"
      :show-close="true"
      @close="onCloseWizard"
      class="k-dialog"
    >
      <!-- Header -->
      <div class="k-head">
        <div class="k-brand">
          <div class="k-logo">
            <img src="../../assets/konatus-ico.png" alt="Konatus" />
          </div>
          <div class="k-brand-text">
            <div class="k-title">Konatus</div>
            <div class="k-subtitle">Pipeline d’optimisation</div>
          </div>
        </div>

        <div class="k-head-right">
          <div class="k-status" :class="pipeline.status">
            <span class="k-pulse" v-if="pipeline.status === 'RUNNING'"></span>
            <span class="k-ico" v-else-if="pipeline.status === 'PAUSED'">⏸</span>
            <span class="k-ico" v-else-if="pipeline.status === 'CANCELLED'">⛔</span>
            <span class="k-ico" v-else-if="pipeline.status === 'ERROR'">⚠</span>
            <span class="k-ico" v-else-if="pipeline.status === 'SUCCESS'">✅</span>
            <span class="k-status-text">{{ uiStateText }}</span>
          </div>
        </div>
      </div>

      <div class="k-body">
        <!-- CONFIG CARD -->
        <div class="k-card">
          <div class="k-card-head">
            <div class="k-card-title">
              <i class="el-icon-setting"></i>
              Configuration
            </div>
            <div class="k-card-sub">
              Sélectionne les tableaux et démarre l’exécution.
            </div>
          </div>

          <div class="k-form-grid">
            <div class="k-field-block">
              <div class="k-label">Contexte</div>
              <el-select
                v-model="form.capacityTable"
                placeholder="Choisir le tableau contexte"
                filterable
                clearable
                :loading="tablesLoading"
                @change="onConfigChanged"
                class="k-field"
              >
                <el-option
                  v-for="t in tables"
                  :key="t.id + '-c'"
                  :label="t.label"
                  :value="t.id"
                />
              </el-select>
            </div>

            <div class="k-field-block">
              <div class="k-label">Réponse</div>
              <el-select
                v-model="form.tasksTable"
                placeholder="Choisir le tableau réponse"
                filterable
                clearable
                :loading="tablesLoading"
                @change="onConfigChanged"
                class="k-field"
              >
                <el-option
                  v-for="t in tables"
                  :key="t.id + '-r'"
                  :label="t.label"
                  :value="t.id"
                />
              </el-select>
            </div>

            <div class="k-field-block k-compact">
              <div class="k-label">Mode gate</div>
              <div class="k-inline">
                <el-switch
                  v-model="gateEnabled"
                  active-text="ON"
                  inactive-text="OFF"
                  @change="onConfigChanged"
                />
              </div>
            </div>

            <div class="k-field-block k-compact">
              <div class="k-label">Affectation optimale</div>
              <div class="k-inline">
                <el-tooltip content="Affecte chaque tâche à l'équipe avec la plus grande capacité sur sa plage de dates" placement="top">
                  <el-switch
                    v-model="form.optimizeTeamAssignment"
                    active-text="ON"
                    inactive-text="OFF"
                    @change="onConfigChanged"
                  />
                </el-tooltip>
              </div>
            </div>

            <div class="k-field-block k-date-block">
              <div class="k-label">Début</div>
              <el-date-picker
                v-model="form.startDate"
                type="date"
                format="dd-MM-yyyy"
                value-format="yyyy-MM-dd"
                placeholder="01-01-2025"
                @change="onConfigChanged"
                class="k-date"
              />
            </div>

            <div class="k-field-block k-iter-block">
              <div class="k-label">Itération (jours)</div>
              <el-input-number
                v-model="form.iterationDurationDays"
                :min="1"
                :max="365"
                :step="1"
                controls-position="right"
                @change="onConfigChanged"
                class="k-number"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="k-row-split">
            <div class="k-targets" style="display:none;"></div>

            <div class="k-actions">
              <button
                class="k-btn k-btn-primary"
                :disabled="!canRun || pipeline.running"
                @click="runPipeline"
                title="Exécuter le pipeline"
              >
                <i class="el-icon-video-play"></i>
                <span>{{ pipeline.running ? "En cours" : "Exécuter" }}</span>
              </button>

              <button
                class="k-btn k-btn-warn"
                :disabled="(!pipeline.running && pipeline.status !== 'PAUSED') || pipeline.status==='CANCELLED'"
                @click="togglePause"
                :title="pipeline.status === 'PAUSED' ? 'Reprendre' : 'Mettre en pause'"
              >
                <i
                  :class="pipeline.status === 'PAUSED'
                    ? 'el-icon-video-play'
                    : 'el-icon-video-pause'"
                ></i>
                <span>{{ pipeline.status === "PAUSED" ? "Reprendre" : "Pause" }}</span>
              </button>

              <button
                class="k-btn k-btn-danger"
                :disabled="(!pipeline.running && pipeline.status !== 'PAUSED') || pipeline.status==='CANCELLED'"
                @click="stopPipeline"
                title="Arrêter l'exécution"
              >
                <i class="el-icon-circle-close"></i>
                <span>Stop</span>
              </button>

              <button
                class="k-btn"
                :disabled="pipeline.running"
                @click="resetPipeline"
                title="Réinitialiser"
              >
                <i class="el-icon-refresh"></i>
              </button>

              <div class="k-sep"></div>

              <button
                class="k-btn k-btn-soft"
                :disabled="!pipeline.flags.exportDone"
                @click="downloadInputFile"
                title="Télécharger l’entrée"
              >
                <i class="el-icon-download"></i>
                <span>Entrée</span>
              </button>

              <button
                class="k-btn k-btn-soft"
                :disabled="!pipeline.flags.optimDone"
                @click="downloadOptimizationOutput"
                title="Télécharger la sortie"
              >
                <i class="el-icon-download"></i>
                <span>Sortie</span>
              </button>
            </div>
          </div>

          <!-- Pause / Stop -->
          <transition name="k-fade">
            <div
              v-if="pipeline.status === 'PAUSED' || pipeline.status === 'CANCELLED'"
              class="k-intermediate"
            >
              <div class="k-intermediate-left">
                <span class="k-intermediate-ico" v-if="pipeline.status === 'PAUSED'">⏸</span>
                <span class="k-intermediate-ico" v-else>⛔</span>

                <div class="k-intermediate-txt">
                  <div class="k-intermediate-title">
                    {{ pipeline.status === 'PAUSED' ? 'Exécution en pause' : 'Exécution arrêtée' }}
                  </div>
                  <div class="k-intermediate-sub">
                    {{ pipeline.status === 'PAUSED'
                      ? "L’exécution est temporairement suspendue."
                      : "L’exécution a été arrêtée."
                    }}
                  </div>
                </div>
              </div>

              <div class="k-intermediate-actions">
                <button
                  v-if="pipeline.status === 'PAUSED'"
                  class="k-btn k-btn-warn"
                  @click="togglePause"
                >
                  <i class="el-icon-video-play"></i>
                  Reprendre
                </button>
                <button
                  class="k-btn k-btn-danger"
                  @click="resetPipeline"
                  :disabled="pipeline.running"
                >
                  <i class="el-icon-refresh-left"></i>
                  Réinitialiser
                </button>
              </div>
            </div>
          </transition>

          <!-- Progress -->
          <div class="k-progress">
            <div class="k-progress-top">
              <div class="k-progress-left">
                <div class="k-progress-percent">{{ pipeline.percent }}%</div>
                <div class="k-progress-msg" v-if="pipeline.message">
                  {{ pipeline.message }}
                </div>
                <div class="k-progress-msg k-muted" v-else>Prêt</div>
              </div>

              <div class="k-progress-badge" :class="'st-' + pipeline.status">
                {{ uiStateText }}
              </div>
            </div>

            <div class="k-progress-bar">
              <div
                class="k-progress-fill"
                :style="{ width: pipeline.percent + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- STEPS CARD -->
        <div class="k-card">
          <div class="k-card-head">
            <div class="k-card-title">
              <i class="el-icon-tickets"></i>
              Étapes
            </div>
            <div class="k-card-sub">Suivi des étapes et journaux.</div>
          </div>

          <div class="k-steps">
            <div
              v-for="p in phaseList"
              :key="p.key"
              class="k-step"
              :class="'st-' + pipeline.phaseStatus[p.key]"
            >
              <div class="k-step-main">
                <div class="k-step-left">
                  <div class="k-bullet">
                    <span v-if="pipeline.phaseStatus[p.key] === 'DONE'">✓</span>
                    <span v-else-if="pipeline.phaseStatus[p.key] === 'ERROR'">!</span>
                    <span v-else-if="pipeline.phaseStatus[p.key] === 'RUNNING'">•</span>
                    <span v-else-if="pipeline.phaseStatus[p.key] === 'PAUSED'">⏸</span>
                    <span v-else-if="pipeline.phaseStatus[p.key] === 'CANCELLED'">⛔</span>
                    <span v-else> </span>
                  </div>
                  <div class="k-step-name">
                    {{ p.label }}
                    <span class="k-step-chip" :class="'st-' + pipeline.phaseStatus[p.key]">
                      {{ phaseStatusText(pipeline.phaseStatus[p.key]) }}
                    </span>
                  </div>
                </div>

                <button
                  class="k-link"
                  @click="toggleLogs(p.key)"
                  :title="logsOpen[p.key] ? 'Réduire' : 'Voir les détails'"
                >
                  <i class="el-icon-document-copy"></i>
                  <span>{{ logsOpen[p.key] ? "Réduire" : "Détails" }}</span>
                </button>
              </div>

              <transition name="k-fade">
                <div v-if="logsOpen[p.key]" class="k-logs-panel">
                  <div class="k-logs-toolbar">
                    <div class="k-logs-title">
                      <i class="el-icon-document"></i>
                      <span>Journal {{ p.label }}</span>
                    </div>
                    <div class="k-logs-count">{{ normalizedLogs(p.key).length }} ligne<span v-if="normalizedLogs(p.key).length > 1">s</span></div>
                  </div>

                  <div class="k-logs-body" :ref="'logBody-' + p.key">
                    <div v-if="!normalizedLogs(p.key).length" class="k-log-empty">
                      Aucun journal
                    </div>

                    <div
                      v-for="(l, i) in normalizedLogs(p.key)"
                      :key="i"
                      class="k-log-row"
                      :class="logRowClass(l)"
                    >
                      <div class="k-log-t">{{ extractLogTime(l) }}</div>
                      <div class="k-log-badge" :class="logBadgeClass(l)">
                        {{ logBadgeText(l) }}
                      </div>
                      <div class="k-log-m">{{ extractLogMessage(l) }}</div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="k-foot">
        <el-button size="mini" @click="finishWizard" :disabled="pipeline.running">
          Fermer
        </el-button>
      </div>

      <!-- MINI MODAL Import options -->
      <el-dialog
        v-if="showImportOptions"
        :visible="true"
        width="520px"
        :append-to-body="true"
        :modal-append-to-body="true"
        :close-on-click-modal="false"
        :show-close="true"
        custom-class="k-import-modal"
        @close="cancelImportOptions"
      >
        <div class="k-import-head">
          <div>
            <div class="k-import-title">Options d’import</div>
            <div class="k-import-sub">Sélectionne les éléments à importer</div>
          </div>
        </div>

        <div class="k-import-box clean">
          <div class="k-import-item">
            <div class="k-import-item-left">
              <div class="k-import-item-title">Avant-plan</div>
              <div class="k-import-item-sub">Objets visibles au premier plan</div>
            </div>
            <el-switch v-model="importOpt.importForeground" />
          </div>

          <div class="k-import-item">
            <div class="k-import-item-left">
              <div class="k-import-item-title">Arrière-plan</div>
              <div class="k-import-item-sub">Objets de fond</div>
            </div>
            <el-switch v-model="importOpt.importBackground" />
          </div>

          <div class="k-import-item">
            <div class="k-import-item-left">
              <div class="k-import-item-title">Liens</div>
              <div class="k-import-item-sub">Relations entre objets</div>
            </div>
            <el-switch v-model="importOpt.importLinks" />
          </div>
        </div>

        <div class="k-import-actions">
          <el-button @click="cancelImportOptions" :disabled="importRunning">
            Fermer
          </el-button>
          <el-button
            type="primary"
            :disabled="noImportOptionIsChecked || importRunning"
            @click="confirmImportOptions"
          >
            {{ importRunning ? "Import…" : "Importer" }}
          </el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import omit from "lodash.omit";

/** IDs */
const TARGET_WORLD_ID = "68b70d885688a422d9513890";
const TARGET_BOARD_BY_CONTEXT = {
  demo2contexte: "690a1d27ee300fc9f6ee5ae9",
  demo3contexte: "693fc24fd7aa7f89fcf3ef48",
  demo3bcontexte: "695b7ce65d95bf117f328c6c",
  demo4contexte: "6995b5f8de97794d98028fd0",
};

export default {
  name: "BtnKonatus",
  inject: ["$view"],

  data() {
    return {
      isPressed: false,
      showWizard: false,

      tables: [],
      tablesLoading: false,

      form: {
        capacityTable: null,
        tasksTable: null,
        gateMode: "without",
        optimizeTeamAssignment: false,
        startDate: "2025-01-01",
        iterationDurationDays: 14,
      },

      logsOpen: {
        export: false,
        verify: false,
        optim: false,
        position: false,
      },

      XLSX: null,
      lastInputWorkbook: null,

      showImportOptions: false,
      importRunning: false,
      importOpt: {
        importForeground: true,
        importBackground: true,
        importLinks: true,
      },
      _importResolve: null,
      _importReject: null,

      pipeline: {
        running: false,
        status: "IDLE", // IDLE | RUNNING | PAUSED | SUCCESS | ERROR | CANCELLED
        percent: 0,
        message: "",

        paused: false,
        cancelRequested: false,

        flags: {
          exportDone: false,
          verifyDone: false,
          optimDone: false,
          iterationDone: false,
          importDone: false,
          positionDone: false,
        },

        phaseStatus: {
          export: "WAIT",
          verify: "WAIT",
          optim: "WAIT",
          position: "WAIT",
        },

        optimizationPollTimer: null,
        positioningPollTimer: null,
      },

      logs: {
        export: [],
        verify: [],
        optim: [],
        position: [],
      },
    };
  },

  computed: {
    TARGET_WORLD_ID() {
      return TARGET_WORLD_ID;
    },

    gateEnabled: {
      get() {
        return this.form.gateMode === "with";
      },
      set(v) {
        this.form.gateMode = v ? "with" : "without";
      },
    },

    phaseList() {
      return [
        { key: "export", label: "Export" },
        { key: "verify", label: "Vérification" },
        { key: "optim", label: "Optimisation" },
        { key: "position", label: "Import + Positionnement" },
      ];
    },

    uiStateText() {
      if (this.pipeline.status === "RUNNING") return "En cours";
      if (this.pipeline.status === "PAUSED") return "Pause";
      if (this.pipeline.status === "CANCELLED") return "Arrêté";
      if (this.pipeline.status === "SUCCESS") return "Terminé";
      if (this.pipeline.status === "ERROR") return "Erreur";
      return "Prêt";
    },

    resolvedTargetBoardId() {
      const key = this.getSelectedContextKey();
      return key ? TARGET_BOARD_BY_CONTEXT[key] : null;
    },

    canRun() {
      return (
        this.form.capacityTable &&
        this.form.tasksTable &&
        this.form.capacityTable !== this.form.tasksTable &&
        !!this.resolvedTargetBoardId
      );
    },

    noImportOptionIsChecked() {
      return (
        !this.importOpt.importForeground &&
        !this.importOpt.importBackground &&
        !this.importOpt.importLinks
      );
    },
  },

  watch: {
    logs: {
      deep: true,
      handler() {
        this.scrollAllOpenLogsToBottom();
      },
    },
  },

  methods: {
    sanitizeFileName(name) {
      if (!name) return "file";
      return String(name)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "_");
    },

    timestamp() {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}${mm}${dd}_${hh}${min}`;
    },

    getBoardLabelById(id) {
      const t = (this.tables || []).find((x) => x.id === id);
      return t?.label || "";
    },

    async downloadBlobAs(url, filename) {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`Téléchargement ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    },

    phaseStatusText(st) {
      if (st === "WAIT") return "EN ATTENTE";
      if (st === "RUNNING") return "EN COURS";
      if (st === "DONE") return "OK";
      if (st === "PAUSED") return "PAUSE";
      if (st === "CANCELLED") return "ARRÊTÉ";
      if (st === "ERROR") return "ERREUR";
      return String(st || "");
    },

    baseUrl() {
      return location.hostname === "localhost"
        ? "http://localhost:8080"
        : "http://87.106.255.115:8080";
    },

    async saveKonatusOptions() {
      try {
        await fetch(`${this.baseUrl()}/api/konatus-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            withGate: this.form.gateMode === "with",
            optimizeTeamAssignment: !!this.form.optimizeTeamAssignment,
            startDate: this.form.startDate,
            iterationDurationDays: this.form.iterationDurationDays,
          }),
        });
        this.pushLog(
          "export",
          `Options envoyées (gate ${this.form.gateMode === "with" ? "ON" : "OFF"})`
        );
      } catch (_) {
        this.pushLog("export", "Endpoint options absent");
      }
    },

    nowTime() {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    },

    pushLog(phase, msg) {
      const arr = this.logs[phase] || [];
      arr.unshift({ t: this.nowTime(), m: String(msg || "") });
      this.logs[phase] = arr.slice(0, 140);
      this.pipeline.message = String(msg || "");
    },

    clearTimer(name) {
      if (this.pipeline[name]) {
        clearInterval(this.pipeline[name]);
        this.pipeline[name] = null;
      }
    },

    toggleLogs(key) {
      this.$set(this.logsOpen, key, !this.logsOpen[key]);
      this.$nextTick(() => this.scrollLogToBottom(key));
    },

    normalizedLogs(key) {
      const arr = this.logs[key] || [];
      return arr.map((line) => ({
        t: this.extractLogTime(line),
        m: this.extractLogMessage(line),
        raw: line,
      }));
    },

    extractLogTime(line) {
      if (!line) return "--:--:--";
      if (typeof line === "object" && line.t) return String(line.t);
      const match = String(line).match(/^(\d{2}:\d{2}:\d{2})/);
      return match ? match[1] : "--:--:--";
    },

    extractLogMessage(line) {
      if (!line) return "";
      let txt = "";

      if (typeof line === "object" && Object.prototype.hasOwnProperty.call(line, "m")) {
        txt = String(line.m || "").trim();
      } else {
        txt = String(line).replace(/^(\d{2}:\d{2}:\d{2})\s*/, "").trim();
      }

      txt = txt.replace(/termin�e/g, "terminée");
      txt = txt.replace(/d�marr�e/g, "démarrée");
      txt = txt.replace(/it�rations/gi, "itérations");
      txt = txt.replace(/Ã©/g, "é");
      txt = txt.replace(/Ã¨/g, "è");
      txt = txt.replace(/Ã /g, "à");

      if (/^\d+%$/.test(txt)) {
        return `Progression optimisation : ${txt}`;
      }

      if (txt === "%") {
        return "Progression optimisation";
      }

      if (/^\|\s*\^~~~/i.test(txt)) {
        return "Traitement en cours...";
      }

      return txt;
    },

    logBadgeText(line) {
      const msg = this.extractLogMessage(line).toLowerCase();

      if (
        msg.includes("terminée") ||
        msg.includes("ok") ||
        msg.includes("succès") ||
        msg.includes("success")
      ) {
        return "OK";
      }

      if (
        msg.includes("erreur") ||
        msg.includes("error") ||
        msg.includes("échoué") ||
        msg.includes("failed")
      ) {
        return "ERR";
      }

      if (
        msg.includes("progression") ||
        msg.includes("polling") ||
        msg.includes("calcul") ||
        msg.includes("démarrée") ||
        msg.includes("démarrage") ||
        msg.includes("en cours") ||
        msg.includes("attente") ||
        msg.includes("prétraitement") ||
        msg.includes("vérification") ||
        msg.includes("import") ||
        msg.includes("positionnement")
      ) {
        return "RUN";
      }

      return "LOG";
    },

    logBadgeClass(line) {
      const badge = this.logBadgeText(line);
      if (badge === "OK") return "is-ok";
      if (badge === "ERR") return "is-error";
      if (badge === "RUN") return "is-run";
      return "is-log";
    },

    logRowClass(line) {
      const badge = this.logBadgeText(line);
      if (badge === "OK") return "is-ok";
      if (badge === "ERR") return "is-error";
      if (badge === "RUN") return "is-run";
      return "is-log";
    },

    scrollLogToBottom(key) {
      this.$nextTick(() => {
        const ref = this.$refs[`logBody-${key}`];
        const el = Array.isArray(ref) ? ref[0] : ref;
        if (el) {
          el.scrollTop = 0;
        }
      });
    },

    scrollAllOpenLogsToBottom() {
      this.$nextTick(() => {
        ["export", "verify", "optim", "position"].forEach((key) => {
          if (this.logsOpen[key]) this.scrollLogToBottom(key);
        });
      });
    },

    onConfigChanged() {
      if (this.pipeline.running) return;

      this.pipeline.status = "IDLE";
      this.pipeline.percent = 0;
      this.pipeline.message = "";

      this.pipeline.paused = false;
      this.pipeline.cancelRequested = false;

      this.pipeline.flags = {
        exportDone: false,
        verifyDone: false,
        optimDone: false,
        iterationDone: false,
        importDone: false,
        positionDone: false,
      };

      this.pipeline.phaseStatus = {
        export: "WAIT",
        verify: "WAIT",
        optim: "WAIT",
        position: "WAIT",
      };

      this.clearTimer("optimizationPollTimer");
      this.clearTimer("positioningPollTimer");

      this.logs.export = [];
      this.logs.verify = [];
      this.logs.optim = [];
      this.logs.position = [];

      this.pushLog("export", "Configuration modifiée");
    },

    async openWizard() {
      this.showWizard = true;
      await this.loadAvailableTables();
    },

    onCloseWizard() {
      this.showWizard = false;
      this.cancelImportOptions();
    },

    finishWizard() {
      this.showWizard = false;
      this.cancelImportOptions();
    },

    async loadAvailableTables() {
      this.tablesLoading = true;
      try {
        const boardsArray = this.$store.getters["boardAlive/asArray"] || [];
        this.tables = boardsArray
          .filter((b) => b && (b._id || b.id) && (b.data?.name || b.name))
          .map((b) => ({
            id: b._id || b.id,
            label: b.data?.name || b.name || `Board ${b._id || b.id}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        this.tables = [];
      } finally {
        this.tablesLoading = false;
      }
    },

    getSelectedContextKey() {
      const capId = this.form.capacityTable;
      const cap = (this.tables || []).find((t) => t.id === capId);
      const label = String(cap?.label || "")
        .toLowerCase()
        .replace(/\s+/g, "");
      if (label.includes("demo2contexte")) return "demo2contexte";
      if (label.includes("demo3bcontexte")) return "demo3bcontexte";
      if (label.includes("demo3contexte")) return "demo3contexte";
      if (label.includes("demo4contexte")) return "demo4contexte";
      return null;
    },

    resetPipeline() {
      if (this.pipeline.running) return;

      this.pipeline.running = false;
      this.pipeline.status = "IDLE";
      this.pipeline.percent = 0;
      this.pipeline.message = "";

      this.pipeline.paused = false;
      this.pipeline.cancelRequested = false;

      this.pipeline.flags = {
        exportDone: false,
        verifyDone: false,
        optimDone: false,
        iterationDone: false,
        importDone: false,
        positionDone: false,
      };

      this.pipeline.phaseStatus = {
        export: "WAIT",
        verify: "WAIT",
        optim: "WAIT",
        position: "WAIT",
      };

      this.logs.export = [];
      this.logs.verify = [];
      this.logs.optim = [];
      this.logs.position = [];

      this.logsOpen.export = false;
      this.logsOpen.verify = false;
      this.logsOpen.optim = false;
      this.logsOpen.position = false;

      this.clearTimer("optimizationPollTimer");
      this.clearTimer("positioningPollTimer");

      this.cancelImportOptions();
    },

    togglePause() {
      if (!(this.pipeline.running || this.pipeline.status === "PAUSED")) return;

      if (this.pipeline.status === "PAUSED") {
        this.pipeline.paused = false;
        this.pipeline.status = "RUNNING";
        this.pipeline.message = "Reprise…";
        this.pushLog(this.currentRunningPhase() || "export", "▶ Reprise");
        return;
      }

      this.pipeline.paused = true;
      this.pipeline.status = "PAUSED";
      this.pipeline.message = "En pause…";
      const phase = this.currentRunningPhase();
      if (phase) this.pipeline.phaseStatus[phase] = "PAUSED";
      this.pushLog(phase || "export", "⏸ Pause demandée");
    },

    stopPipeline() {
      if (!(this.pipeline.running || this.pipeline.status === "PAUSED")) return;

      this.pipeline.cancelRequested = true;
      this.pipeline.paused = false;

      this.clearTimer("optimizationPollTimer");
      this.clearTimer("positioningPollTimer");
      this.cancelImportOptions();

      const phase = this.currentRunningPhase();
      if (phase) this.pipeline.phaseStatus[phase] = "CANCELLED";

      this.pipeline.status = "CANCELLED";
      this.pipeline.running = false;
      this.pipeline.message = "Exécution arrêtée";

      this.pushLog(phase || "export", "⛔ Stop demandé");
      this.$message.warning("⛔ Pipeline arrêté");
    },

    currentRunningPhase() {
      const st = this.pipeline.phaseStatus || {};
      for (const k of ["export", "verify", "optim", "position"]) {
        if (st[k] === "RUNNING" || st[k] === "PAUSED") return k;
      }
      return null;
    },

    async waitIfPausedOrCancelled(phaseKey) {
      if (this.pipeline.cancelRequested) throw new Error("Annulé");

      while (this.pipeline.paused) {
        if (phaseKey && this.pipeline.phaseStatus[phaseKey] === "RUNNING") {
          this.pipeline.phaseStatus[phaseKey] = "PAUSED";
        }
        await new Promise((r) => setTimeout(r, 250));
        if (this.pipeline.cancelRequested) throw new Error("Annulé");
      }

      if (phaseKey && this.pipeline.phaseStatus[phaseKey] === "PAUSED") {
        this.pipeline.phaseStatus[phaseKey] = "RUNNING";
      }
    },

    excelSerialToISO(v) {
      if (v == null || v === "" || v === "null" || v === "\\N") return "";

      if (typeof v === "string") {
        const s = v.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
          const [dd, mm, yyyy] = s.split("-");
          return `${yyyy}-${mm}-${dd}`;
        }
        if (/^\d+(\.\d+)?$/.test(s)) v = Number(s);
        else return s;
      }

      if (typeof v === "number" && isFinite(v)) {
        const utcDays = Math.floor(v - 25569);
        const utcMs = utcDays * 86400 * 1000;
        const d = new Date(utcMs);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }

      if (v instanceof Date && !isNaN(v.getTime())) {
        const yyyy = v.getFullYear();
        const mm = String(v.getMonth() + 1).padStart(2, "0");
        const dd = String(v.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }

      return String(v);
    },

    normalizeDateFields(objData) {
      if (!objData) return objData;

      const dateKeys = [
        "due_date",
        "due_start_date",
        "start_date_test",
        "start_date",
        "end_date",
        "start_date_engage",
        "end_date_demande",
      ];

      for (const k of dateKeys) {
        if (Object.prototype.hasOwnProperty.call(objData, k)) {
          objData[k] = this.excelSerialToISO(objData[k]);
        }
      }
      return objData;
    },

    async runPipeline() {
      if (!this.canRun || this.pipeline.running) return;

      this.pipeline.running = true;
      this.pipeline.status = "RUNNING";
      this.pipeline.percent = 2;
      this.pipeline.message = "Démarrage";

      this.pipeline.paused = false;
      this.pipeline.cancelRequested = false;

      this.pipeline.phaseStatus.export = "RUNNING";
      this.pipeline.phaseStatus.verify = "WAIT";
      this.pipeline.phaseStatus.optim = "WAIT";
      this.pipeline.phaseStatus.position = "WAIT";

      this.logsOpen.export = true;
      this.logsOpen.verify = false;
      this.logsOpen.optim = false;
      this.logsOpen.position = false;

      try {
        await this.waitIfPausedOrCancelled("export");
        await this.saveKonatusOptions();
        await this.phaseExport();
        this.pipeline.flags.exportDone = true;
        this.pipeline.phaseStatus.export = "DONE";
        this.pipeline.percent = 25;

        this.pipeline.phaseStatus.verify = "RUNNING";
        this.logsOpen.verify = true;
        await this.waitIfPausedOrCancelled("verify");
        await this.phasePretraitAndVerify();
        this.pipeline.flags.verifyDone = true;
        this.pipeline.phaseStatus.verify = "DONE";
        this.pipeline.percent = 45;

        this.pipeline.phaseStatus.optim = "RUNNING";
        this.logsOpen.optim = true;
        await this.waitIfPausedOrCancelled("optim");
        await this.phaseOptimizeAndIterate();
        this.pipeline.flags.optimDone = true;
        this.pipeline.flags.iterationDone = true;
        this.pipeline.phaseStatus.optim = "DONE";
        this.pipeline.percent = 75;

        this.pipeline.phaseStatus.position = "RUNNING";
        this.logsOpen.position = true;
        await this.waitIfPausedOrCancelled("position");
        await this.phaseImportAndPositionV4();
        this.pipeline.flags.importDone = true;
        this.pipeline.flags.positionDone = true;
        this.pipeline.phaseStatus.position = "DONE";
        this.pipeline.percent = 100;

        if (this.pipeline.cancelRequested) throw new Error("Annulé");

        this.pipeline.status = "SUCCESS";
        this.pipeline.running = false;
        this.pipeline.message = "Terminé";
        this.$message.success("✅ Terminé");
      } catch (e) {
        const msg = e?.message || String(e);

        if (msg === "Annulé" || this.pipeline.status === "CANCELLED") {
          this.pipeline.status = "CANCELLED";
          this.pipeline.running = false;
          this.pipeline.message = "Exécution arrêtée";
          for (const k of ["export", "verify", "optim", "position"]) {
            if (
              this.pipeline.phaseStatus[k] === "RUNNING" ||
              this.pipeline.phaseStatus[k] === "PAUSED"
            ) {
              this.pipeline.phaseStatus[k] = "CANCELLED";
            }
          }
          return;
        }

        this.pipeline.status = "ERROR";
        this.pipeline.running = false;
        this.pipeline.message = msg;

        for (const k of ["export", "verify", "optim", "position"]) {
          if (
            this.pipeline.phaseStatus[k] === "RUNNING" ||
            this.pipeline.phaseStatus[k] === "PAUSED"
          ) {
            this.pipeline.phaseStatus[k] = "ERROR";
          }
        }

        this.$message.error("❌ " + msg);
      } finally {
        this.cancelImportOptions();
      }
    },

    async phaseExport() {
      await this.waitIfPausedOrCancelled("export");
      this.pushLog("export", "Export démarré");
      if (!this.XLSX) this.XLSX = await import("xlsx");

      const boardId = this.form.capacityTable;

      let maybeResult = null;
      try {
        maybeResult = await this.$store.dispatch("boardIoGet/get", {
          worldId: this.$view.worldId,
          boardId,
          format: "xlsx",
        });
        this.pushLog("export", "Export demandé au store");
      } catch (e) {
        this.pushLog("export", "Erreur export store : " + e.message);
      }

      const contexteBoardIo =
        (maybeResult && maybeResult.data && maybeResult.data.VW ? maybeResult : null) ||
        (await this.waitForBoardIoData(boardId));

      await this.waitIfPausedOrCancelled("export");
      await this.processContexteExportPlusCapaciteReponse(contexteBoardIo);

      await this.waitIfPausedOrCancelled("export");
      try {
        await fetch(`${this.baseUrl()}/api/konatus-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            withGate: this.form.gateMode === "with",
            optimizeTeamAssignment: !!this.form.optimizeTeamAssignment,
            startDate: this.form.startDate,
            iterationDurationDays: this.form.iterationDurationDays,
          }),
        });
        this.pushLog("export", "Options sauvegardées");
      } catch (_) {
        this.pushLog("export", "Endpoint options absent");
      }

      this.pushLog("export", "Export terminé");
    },

    async waitForBoardIoData(boardId) {
      const startedAt = Date.now();
      const timeoutMs = 180000;
      let delay = 250;
      const maxDelay = 1500;

      this.pushLog("export", "Attente des données du store…");

      while (Date.now() - startedAt < timeoutMs) {
        await this.waitIfPausedOrCancelled("export");

        const boardIo = this.$store.getters["boardIoGet/byId"](boardId);

        if (boardIo?.error) {
          const msg =
            typeof boardIo.error === "string"
              ? boardIo.error
              : boardIo.error?.message || "Erreur export";
          throw new Error(`Export KO : ${msg}`);
        }

        if (boardIo?.data?.VW) return boardIo;

        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(maxDelay, Math.round(delay * 1.25));
      }

      throw new Error("Délai dépassé (export)");
    },

    mapValues(obj, fn) {
      const result = {};
      for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) result[k] = fn(obj[k], k);
      }
      return result;
    },

    async calculateCapacityWithReponseBoard(reponseBoardId) {
      const url = `${this.baseUrl()}/api/calculate-capacity-nv?worldId=${this.$view.worldId}&boardId=${reponseBoardId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur capacité ${res.status}`);
      return await res.json();
    },

    async processContexteExportPlusCapaciteReponse(contexteBoardIo) {
  const CELL_MAX_LENGTH = 32765;

  if (!contexteBoardIo?.data?.VW?.objects) {
    throw new Error("Pas de données export");
  }

  const { objects, links } = contexteBoardIo.data.VW;

  const formattedObjects = objects.map((item) => {
    const data = this.mapValues(item.object?.data || {}, (property) => {
      if (property === null || property === undefined) return "";
      if (property?.[0]?.fileName) return property[0].fileName;

      if (typeof property === "string" && property.length > CELL_MAX_LENGTH) {
        return property.slice(0, CELL_MAX_LENGTH);
      }

      return property;
    });

    this.normalizeDateFields(data);

    // Ne pas forcer due_date ici :
    // elle doit rester vide si absente, pour être héritée plus tard du parent
    if (
      data.due_date === undefined ||
      data.due_date === null ||
      String(data.due_date).trim() === ""
    ) {
      data.due_date = "";
    }

    // due_start_date peut être préparée sans copier due_date
    if (
      data.due_start_date === undefined ||
      data.due_start_date === null ||
      String(data.due_start_date).trim() === ""
    ) {
      data.due_start_date =
        data.start_date_test ||
        data.start_date ||
        "";
    }

    // Harmonisation de la priorité
    if (
      data.priority === undefined ||
      data.priority === null ||
      String(data.priority).trim() === ""
    ) {
      data.priority =
        data.attributepriority ??
        data.att_priority ??
        data.priorite ??
        "";
    }

    return Object.assign(
      {
        [this.$t("xlsx_export.headings.componentName")]:
          this.$store.getters[`componentAlive/nameById`](item.componentId),

        [this.$t("xlsx_export.headings.left")]:
          Math.round(item.position.data.left),

        [this.$t("xlsx_export.headings.top")]:
          Math.round(item.position.data.top),

        [this.$t("xlsx_export.headings.width")]:
          Math.round(item.position.data.width),

        [this.$t("xlsx_export.headings.height")]:
          Math.round(item.position.data.height),

        [this.$t("xlsx_export.headings.zIndex")]:
          Math.round(item.position.data.zIndex),

        [this.$t("xlsx_export.headings.rotation")]:
          Math.round(item.position.data.rotation) || 0,

        [this.$t("xlsx_export.headings.layer")]: this.$t(
          "xlsx_export.placeholders." +
            (item.position.protect.isBackground ? "background" : "foreground")
        ),

        [this.$t("xlsx_export.headings.styleBackgroundColor")]:
          item.object?.protect?.styleBackgroundColor,

        [this.$t("xlsx_export.headings.styleOutlineColor")]:
          item.object?.protect?.styleOutlineColor,

        [this.$t("xlsx_export.headings.styleColor")]:
          item.object?.protect?.styleColor,
      },
      data
    );
  });

  const formattedLinks = (links || []).map((item) => ({
    [this.$t("xlsx_export.headings.linkOrigin")]:
      2 +
      objects.findIndex(
        (o) =>
          o.objectId &&
          o.objectId == item.objects[item.objects[0].data.arrowhead].objectId
      ),

    [this.$t("xlsx_export.headings.linkEnd")]:
      2 +
      objects.findIndex(
        (o) =>
          o.objectId &&
          o.objectId == item.objects[item.objects[1].data.arrowhead].objectId
      ),

    [this.$t("xlsx_export.headings.linkModel")]:
      this.$store.getters[`linkModelAlive/nameById`](item.linkModelId),

    [this.$t("xlsx_export.headings.label")]: item.data.title,
    [this.$t("xlsx_export.headings.color")]: item.data.color,
    [this.$t("xlsx_export.headings.size")]: item.data.size,
    [this.$t("xlsx_export.headings.curve")]: item.data.curve,
    [this.$t("xlsx_export.headings.dash")]: item.data.dash,

    [this.$t("xlsx_export.headings.originShape")]:
      item.objects[item.objects[0].data.arrowhead].data.type,

    [this.$t("xlsx_export.headings.endShape")]:
      item.objects[item.objects[1].data.arrowhead].data.type,
  }));

  this.pushLog(
    "export",
    `Objets : ${formattedObjects.length} • Liens : ${formattedLinks.length}`
  );

  await this.waitIfPausedOrCancelled("export");

  const capacityResults = await this.calculateCapacityWithReponseBoard(
    this.form.tasksTable
  );

  this.pushLog("export", `Lignes capacité : ${capacityResults?.length || 0}`);

  const workbook = this.XLSX.utils.book_new();

  this.XLSX.utils.book_append_sheet(
    workbook,
    this.XLSX.utils.json_to_sheet(formattedObjects),
    this.$t("xlsx_export.sheets.objects")
  );

  this.XLSX.utils.book_append_sheet(
    workbook,
    this.XLSX.utils.json_to_sheet(formattedLinks),
    this.$t("xlsx_export.sheets.links")
  );

  this.XLSX.utils.book_append_sheet(
    workbook,
    this.XLSX.utils.json_to_sheet(capacityResults),
    "capacite"
  );

  this.lastInputWorkbook = workbook;

  await this.waitIfPausedOrCancelled("export");

  const buffer = this.XLSX.write(workbook, { type: "array" });

  const res = await fetch(`${this.baseUrl()}/api/save-input-data-optimization`, {
    method: "POST",
    body: buffer,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur sauvegarde ${res.status}`);
  }
},

    async phasePretraitAndVerify() {
      await this.waitIfPausedOrCancelled("verify");
      this.pushLog("verify", "Prétraitement…");
      const pre = await fetch(`${this.baseUrl()}/api/preatretment-input`, { method: "POST" });
      if (!pre.ok) throw new Error(await pre.text());

      await this.waitIfPausedOrCancelled("verify");
      this.pushLog("verify", "Vérification…");
      const res = await fetch(`${this.baseUrl()}/api/verify-before-optimization`, { method: "GET" });
      if (!res.ok)
        throw new Error(`Vérification ${res.status}: ${await res.text().catch(() => "")}`);
      const data = await res.json().catch(() => ({}));
      if (data.success === false) throw new Error(data.message || "Échec vérification");

      const optTeams = data.files?.team_backlog?.optimizedTeams;
      if (optTeams > 0) {
        this.pushLog("verify", `Vérification OK (${optTeams} tâches → meilleure équipe)`);
      } else {
        this.pushLog("verify", "Vérification OK");
      }
    },

    async phaseOptimizeAndIterate() {
      await this.waitIfPausedOrCancelled("optim");
      this.pushLog("optim", "Optimisation démarrée");
      const start = await fetch(`${this.baseUrl()}/api/execute-calcul-dates`, { method: "POST" });
      if (!start.ok) throw new Error(await start.text());

      await this.pollOptimizationStatus();

      await this.waitIfPausedOrCancelled("optim");
      this.pushLog("optim", "Calcul des itérations…");
      const it = await fetch(`${this.baseUrl()}/api/recalculate-iterations`, { method: "POST" });
      if (!it.ok) throw new Error(await it.text());
      const itData = await it.json().catch(() => ({}));
      if (!itData.success) throw new Error(itData.error || "Échec itérations");

      const updated = itData.summary?.totalLinesUpdated || 0;
      this.pushLog("optim", `Itérations OK (${updated})`);
    },

    async pollOptimizationStatus() {
      try {
        const test = await fetch(`${this.baseUrl()}/api/optimization-status`, { method: "GET" });
        if (!test.ok) throw new Error("bad");
      } catch (_) {
        this.pushLog("optim", "Pas de polling");
        return;
      }

      this.pushLog("optim", "Polling…");
      await new Promise((resolve, reject) => {
        this.clearTimer("optimizationPollTimer");
        this.pipeline.optimizationPollTimer = setInterval(async () => {
          try {
            if (this.pipeline.paused) return;
            if (this.pipeline.cancelRequested) {
              this.clearTimer("optimizationPollTimer");
              reject(new Error("Annulé"));
              return;
            }

            const r = await fetch(`${this.baseUrl()}/api/optimization-status`, { method: "GET" });
            if (!r.ok) throw new Error("bad status");
            const data = await r.json();

            const percent = Math.max(0, Math.min(100, Number(data.percent || 0)));
            const global = 45 + Math.round((percent / 100) * 30);
            this.pipeline.percent = Math.max(this.pipeline.percent, global);

            if (data.message) this.pushLog("optim", data.message);

            if (data.done) {
              this.clearTimer("optimizationPollTimer");
              if (data.success === false) reject(new Error(data.message || "Échec optimisation"));
              else resolve();
            }
          } catch (e) {
            this.clearTimer("optimizationPollTimer");
            reject(new Error("Polling optimisation stoppé : " + e.message));
          }
        }, 1200);
      });
    },

    async phaseImportAndPositionV4() {
      const boardId = this.resolvedTargetBoardId;
      if (!boardId) throw new Error("Board cible manquant");

      await this.waitIfPausedOrCancelled("position");
      this.pushLog("position", "Attente des options d’import…");
      await this.requestImportOptions();

      await this.waitIfPausedOrCancelled("position");
      this.pushLog("position", "Import sortie…");
      const wb = await this.downloadOptimizationWorkbook();
      await this.injectWorkbookToTargetBoard(wb, TARGET_WORLD_ID, boardId, this.importOpt);
      this.pushLog("position", "Import OK");

      await this.waitIfPausedOrCancelled("position");
      this.pushLog("position", "Attente de sauvegarde…");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await this.waitIfPausedOrCancelled("position");
      this.pushLog("position", "Rafraîchissement du board…");
      try {
        await this.$store.dispatch("boardIoGet/get", {
          worldId: TARGET_WORLD_ID,
          boardId,
          format: "json",
        });
        this.pushLog("position", "Board rafraîchi");
      } catch (e) {
        this.pushLog("position", `Avertissement refresh : ${e.message}`);
      }

      await this.waitIfPausedOrCancelled("position");
      this.pushLog("position", "Vérification des objets importés…");
      await this.verifyImportedObjects(TARGET_WORLD_ID, boardId);

      await this.waitIfPausedOrCancelled("position");
      this.pushLog("position", "Positionnement V4…");
      const res = await fetch(
        `${this.baseUrl()}/api/execute-positioning-v4?worldId=${TARGET_WORLD_ID}&boardId=${boardId}&componentName=K - Work Item&projectField=project&dateField=start_date_test`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(await res.text().catch(() => `Start position ${res.status}`));

      await this.pollPositioningStatus();
    },

    async downloadOptimizationWorkbook() {
      if (!this.XLSX) this.XLSX = await import("xlsx");
      const url = `${this.baseUrl()}/api/download-optimization-output`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Téléchargement sortie ${res.status}`);
      const ab = await res.arrayBuffer();
      return this.XLSX.read(ab, { type: "array" });
    },

    requireSheet(wb, sheetName) {
      const ws = wb?.Sheets?.[sheetName];
      if (!ws) {
        const available = Object.keys(wb?.Sheets || {}).join(", ");
        throw new Error(`Feuille "${sheetName}" manquante. Dispo : ${available}`);
      }
      return ws;
    },

    ensureIdsResolved(objects, links) {
      const missingComponents = [];
      for (const o of objects) if (!o.componentId) missingComponents.push(o.objectId);
      const missingLinkModels = [];
      for (const l of links) if (!l.linkModelId) missingLinkModels.push(l._id);
      if (missingComponents.length) throw new Error(`Composants manquants (${missingComponents.length})`);
      if (missingLinkModels.length) throw new Error(`Modèles de liens manquants (${missingLinkModels.length})`);
    },

    async injectWorkbookToTargetBoard(wb, worldId, boardId, opt) {
      const sheetObjectsName = this.$t("xlsx_export.sheets.objects");
      const sheetLinksName = this.$t("xlsx_export.sheets.links");

      const wsObjects = this.requireSheet(wb, sheetObjectsName);
      const wsLinks = this.requireSheet(wb, sheetLinksName);

      const rowsObjects = this.XLSX.utils.sheet_to_json(wsObjects, { defval: "" });
      const rowsLinks = this.XLSX.utils.sheet_to_json(wsLinks, { defval: "" });
      if (!rowsObjects.length) throw new Error("Aucun objet dans la sortie");

      const allObjects = rowsObjects.map((item, index) => {
        const compName = item[this.$t("xlsx_export.headings.componentName")];
        const componentId = this.$store.getters[`componentAlive/idByName`](compName);

        const rawData = omit(item, [
          this.$t("xlsx_export.headings.componentName"),
          this.$t("xlsx_export.headings.styleBackgroundColor"),
          this.$t("xlsx_export.headings.styleOutlineColor"),
          this.$t("xlsx_export.headings.styleColor"),
          this.$t("xlsx_export.headings.left"),
          this.$t("xlsx_export.headings.top"),
          this.$t("xlsx_export.headings.zIndex"),
          this.$t("xlsx_export.headings.width"),
          this.$t("xlsx_export.headings.height"),
          this.$t("xlsx_export.headings.rotation"),
          this.$t("xlsx_export.headings.layer"),
        ]);

        this.normalizeDateFields(rawData);

if (!rawData.due_date) {
  rawData.due_date =
    rawData.due_date_export ||
    rawData.due_start_date ||
    rawData.end_date_demande ||
    rawData.start_date_test ||
    rawData.start_date ||
    "";
}

if (!rawData.due_start_date) {
  rawData.due_start_date =
    rawData.start_date_test ||
    rawData.start_date ||
    rawData.due_date ||
    "";
}

        return {
          index,
          objectId: `object_${2 + index}`,
          componentId,
          object: {
            data: rawData,
            protect: {
              styleBackgroundColor: item[this.$t("xlsx_export.headings.styleBackgroundColor")],
              styleOutlineColor: item[this.$t("xlsx_export.headings.styleOutlineColor")],
              styleColor: item[this.$t("xlsx_export.headings.styleColor")],
            },
          },
          position: {
            data: {
              left: Number(item[this.$t("xlsx_export.headings.left")] || 0),
              top: Number(item[this.$t("xlsx_export.headings.top")] || 0),
              zIndex: Number(item[this.$t("xlsx_export.headings.zIndex")] || 0),
              rotation: Number(item[this.$t("xlsx_export.headings.rotation")] || 0),
              width: Number(item[this.$t("xlsx_export.headings.width")] || 120),
              height: Number(item[this.$t("xlsx_export.headings.height")] || 60),
            },
            protect: {
              isBackground:
                item[this.$t("xlsx_export.headings.layer")] ==
                this.$t("xlsx_export.placeholders.background"),
            },
          },
        };
      });

      const allLinks = rowsLinks.map((item, index) => {
        const lmName = item[this.$t("xlsx_export.headings.linkModel")];
        const linkModelId = this.$store.getters[`linkModelAlive/idByName`](lmName);

        const originIndex = Number(item[this.$t("xlsx_export.headings.linkOrigin")]);
        const endIndex = Number(item[this.$t("xlsx_export.headings.linkEnd")]);

        return {
          _id: `link_${2 + index}`,
          linkModelId,
          data: {
            title: item[this.$t("xlsx_export.headings.label")] || "",
            color: item[this.$t("xlsx_export.headings.color")],
            size: item[this.$t("xlsx_export.headings.size")],
            curve: item[this.$t("xlsx_export.headings.curve")],
            dash: item[this.$t("xlsx_export.headings.dash")],
          },
          objects: [
            {
              _id: `link_start_${2 + index}`,
              linkId: `link_${2 + index}`,
              objectId: `object_${originIndex}`,
              data: { arrowhead: 0, type: item[this.$t("xlsx_export.headings.originShape")] },
            },
            {
              _id: `link_end_${2 + index}`,
              linkId: `link_${2 + index}`,
              objectId: `object_${endIndex}`,
              data: { arrowhead: 1, type: item[this.$t("xlsx_export.headings.endShape")] },
            },
          ],
        };
      });

      const objects = allObjects
        .filter((o) => (opt.importBackground ? true : !o?.position?.protect?.isBackground))
        .filter((o) => (opt.importForeground ? true : o?.position?.protect?.isBackground));

      const keptIds = new Set(objects.map((o) => o.objectId));
      let links = opt.importLinks ? allLinks : [];
      if (opt.importLinks) {
        links = links.filter((l) => {
          const a = l.objects?.[0]?.objectId;
          const b = l.objects?.[1]?.objectId;
          return keptIds.has(a) && keptIds.has(b);
        });
      }

      this.ensureIdsResolved(objects, links);

      objects.sort((a, b) => (a?.position?.data?.zIndex || 0) - (b?.position?.data?.zIndex || 0));
      let zIndex = this.$store.getters[`positionAlive/zIndexMax`];
      for (const o of objects) if (o?.position?.data) o.position.data.zIndex = ++zIndex;

      for (const obj of objects) {
        if (!obj.object?.data?.team) {
          obj.object.data = obj.object.data || {};
          obj.object.data.team = "default";
          this.pushLog("position", `Team par défaut ajouté à ${obj.objectId}`);
        }
        if (!obj.object?.data?.iteration) {
          obj.object.data = obj.object.data || {};
          obj.object.data.iteration = "default";
        }
      }

      this.pushLog("position", `Injection objets=${objects.length}, liens=${links.length}`);

      await this.$store.dispatch("boardIoSet/set", {
        worldId,
        boardId,
        VW: { objects, links },
        options: {
          flushForeground: !!opt.importForeground,
          flushBackground: !!opt.importBackground,
          updateModel: false,
          useNewObjectId: true,
        },
      });
    },

    async pollPositioningStatus() {
      try {
        const test = await fetch(`${this.baseUrl()}/api/positioning-status`, { method: "GET" });
        if (!test.ok) throw new Error("bad");
      } catch (_) {
        this.pushLog("position", "Pas d’endpoint de polling");
        return;
      }

      this.pushLog("position", "Polling positionnement…");
      const startedAt = Date.now();
      const timeoutMs = 300000;

      await new Promise((resolve, reject) => {
        this.clearTimer("positioningPollTimer");
        this.pipeline.positioningPollTimer = setInterval(async () => {
          try {
            if (this.pipeline.paused) return;
            if (this.pipeline.cancelRequested) {
              this.clearTimer("positioningPollTimer");
              reject(new Error("Annulé"));
              return;
            }

            if (Date.now() - startedAt > timeoutMs) {
              this.clearTimer("positioningPollTimer");
              reject(new Error("Délai positionnement dépassé (5 min)"));
              return;
            }

            const r = await fetch(`${this.baseUrl()}/api/positioning-status`, { method: "GET" });
            if (!r.ok) throw new Error("bad status");
            const data = await r.json();

            const percent = Math.max(0, Math.min(100, Number(data.percent || 0)));
            const global = 75 + Math.round((percent / 100) * 25);
            this.pipeline.percent = Math.max(this.pipeline.percent, global);

            if (data.message) {
              const msg = String(data.message || "").trim();
              if (msg && msg !== this.pipeline.message) this.pushLog("position", msg);
            }

            if (data.done) {
              this.clearTimer("positioningPollTimer");
              if (data.success === false || data.success === null) {
                reject(new Error(data.message || "Échec positionnement"));
              } else {
                resolve();
              }
            }
          } catch (e) {
            this.clearTimer("positioningPollTimer");
            reject(new Error("Polling position stoppé : " + (e?.message || String(e))));
          }
        }, 1200);
      });
    },

    async verifyImportedObjects(worldId, boardId) {
      const maxAttempts = 10;
      const delayMs = 500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await this.waitIfPausedOrCancelled("position");

        try {
          const boardIo = await this.$store
            .dispatch("boardIoGet/get", { worldId, boardId, format: "json" })
            .catch(() => null);

          if (boardIo?.data?.VW?.objects) {
            const objects = boardIo.data.VW.objects;
            const workItems = objects.filter(
              (obj) =>
                obj.object?.data?.name &&
                obj.object?.data?.team &&
                obj.object?.data?.name.trim() !== ""
            );

            if (workItems.length > 0) {
              this.pushLog("position", `${workItems.length} work item(s) prêts pour le positionnement`);
              return;
            }
          }

          if (attempt < maxAttempts) {
            this.pushLog("position", `Attente des objets… (${attempt}/${maxAttempts})`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        } catch (e) {
          this.pushLog("position", `Erreur vérification : ${e.message}`);
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      this.pushLog("position", "Impossible de vérifier les objets importés, poursuite du traitement…");
    },

    requestImportOptions() {
      this.showImportOptions = true;
      this.importRunning = false;
      return new Promise((resolve, reject) => {
        this._importResolve = resolve;
        this._importReject = reject;
      });
    },

    confirmImportOptions() {
      if (this.noImportOptionIsChecked) return;
      this.importRunning = true;
      this.showImportOptions = false;
      if (this._importResolve) this._importResolve(true);
      this.importRunning = false;
      this._importResolve = null;
      this._importReject = null;
    },

    cancelImportOptions() {
      if (!this.showImportOptions && !this._importReject) return;
      this.showImportOptions = false;
      if (this._importReject) this._importReject(new Error("Import annulé"));
      this.importRunning = false;
      this._importResolve = null;
      this._importReject = null;
    },

    downloadInputFile() {
      const url = `${this.baseUrl()}/api/download-input-data-optimization`;
      const contexteLabel = this.getBoardLabelById(this.form.capacityTable);
      const baseName = this.sanitizeFileName(contexteLabel || "Contexte");
      const fileName = `${baseName}_INPUT_${this.timestamp()}.xlsx`;

      this.downloadBlobAs(url, fileName)
        .then(() => this.pushLog("export", `Téléchargement entrée : ${fileName}`))
        .catch((e) => this.$message.error("❌ " + (e?.message || e)));
    },

    downloadOptimizationOutput() {
      const url = `${this.baseUrl()}/api/download-optimization-output`;
      const reponseLabel = this.getBoardLabelById(this.form.tasksTable);
      const baseName = this.sanitizeFileName(reponseLabel || "Reponse");
      const fileName = `${baseName}_OUTPUT_${this.timestamp()}.xlsx`;

      this.downloadBlobAs(url, fileName)
        .then(() => this.pushLog("optim", `Téléchargement sortie : ${fileName}`))
        .catch((e) => this.$message.error("❌ " + (e?.message || e)));
    },
  },

  beforeDestroy() {
    clearInterval(this.pipeline.optimizationPollTimer);
    clearInterval(this.pipeline.positioningPollTimer);
  },

  beforeUnmount() {
    clearInterval(this.pipeline.optimizationPollTimer);
    clearInterval(this.pipeline.positioningPollTimer);
  },
};
</script>

<style scoped>
:root,
.k-dialog {
  --bg: #f6f8fc;
  --card: #ffffff;
  --txt: #0f172a;
  --muted: #64748b;
  --border: rgba(15, 23, 42, 0.08);
  --shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  --blue1: #3b82f6;
  --blue2: #2563eb;
  --warn: #f59e0b;
  --red1: #ef4444;
  --red2: #dc2626;
}

/* Launcher */
.k-launch {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.k-launch:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}
.k-launch.is-active {
  transform: translateY(0px) scale(0.98);
}
.k-launch-ico {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

/* Dialog */
:deep(.el-dialog) {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.18);
}
:deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}
:deep(.el-dialog__body) {
  padding: 0;
  background: var(--bg);
}

/* Header */
.k-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(90deg, #0b1220 0%, #111827 50%, #0b1220 100%);
  color: white;
}
.k-brand {
  display: flex;
  gap: 10px;
  align-items: center;
}
.k-logo {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.k-logo img {
  width: 22px;
  height: 22px;
}
.k-title {
  font-weight: 900;
  font-size: 16px;
}
.k-subtitle {
  font-weight: 700;
  font-size: 12px;
  opacity: 0.8;
}
.k-status {
  position: relative;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.k-status.RUNNING {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.25);
}
.k-status.SUCCESS {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.25);
}
.k-status.ERROR,
.k-status.PAUSED,
.k-status.CANCELLED {
  background: rgba(220, 38, 38, 0.14);
  border-color: rgba(220, 38, 38, 0.28);
}
.k-pulse {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--warn);
  box-shadow: 0 0 0 rgba(245, 158, 11, 0.6);
  animation: pulse 1.2s infinite;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

/* Body */
.k-body {
  padding: 14px;
  display: grid;
  gap: 12px;
}

/* Cards */
.k-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
}
.k-card-head {
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.k-card-title {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-weight: 950;
  color: var(--txt);
}
.k-card-sub {
  margin-top: 4px;
  font-weight: 700;
  color: var(--muted);
  font-size: 12px;
}

/* Form grid */
.k-form-grid {
  padding: 12px;
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 130px 130px 180px 170px;
  gap: 10px;
  align-items: end;
}
.k-field-block .k-label {
  font-size: 11px;
  font-weight: 900;
  color: var(--txt);
  margin-bottom: 6px;
  white-space: nowrap;
}
.k-inline {
  height: 40px;
  display: flex;
  align-items: center;
}
.k-field :deep(.el-input__inner),
.k-date :deep(.el-input__inner) {
  border-radius: 12px;
  height: 40px;
}

/* compact iteration field */
.k-number {
  width: 140px;
}
.k-number :deep(.el-input__inner) {
  border-radius: 12px;
  height: 40px;
  text-align: center;
  padding-right: 46px;
}
.k-number :deep(.el-input-number__increase),
.k-number :deep(.el-input-number__decrease) {
  width: 34px;
}

/* Row split */
.k-row-split {
  padding: 0 12px 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* Buttons */
.k-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.k-sep {
  width: 1px;
  height: 26px;
  background: rgba(15, 23, 42, 0.1);
  margin: 0 2px;
}
.k-btn {
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.k-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}
.k-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
  box-shadow: none;
}
.k-btn-primary {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, var(--blue1) 0%, var(--blue2) 100%);
}
.k-btn-soft {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.18);
}
.k-btn-warn {
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}
.k-btn-danger {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, var(--red1) 0%, var(--red2) 100%);
}

/* Intermediate pause/stop box */
.k-intermediate {
  margin: 0 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(220, 38, 38, 0.22);
  background: rgba(220, 38, 38, 0.06);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.k-intermediate-left {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}
.k-intermediate-ico {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.22);
  font-size: 16px;
}
.k-intermediate-title {
  font-weight: 950;
  color: #7f1d1d;
}
.k-intermediate-sub {
  margin-top: 2px;
  font-weight: 800;
  color: rgba(127, 29, 29, 0.8);
  font-size: 12px;
  max-width: 520px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.k-intermediate-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* Progress */
.k-progress {
  padding: 0 12px 12px;
  display: grid;
  gap: 10px;
}
.k-progress-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.k-progress-percent {
  font-weight: 950;
  color: var(--txt);
  font-size: 18px;
  line-height: 1.1;
}
.k-progress-msg {
  margin-top: 2px;
  font-weight: 800;
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 520px;
}
.k-progress-badge {
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 950;
  font-size: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
}
.k-progress-badge.st-RUNNING {
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.1);
  color: #a16207;
}
.k-progress-badge.st-SUCCESS {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
}
.k-progress-badge.st-ERROR,
.k-progress-badge.st-CANCELLED,
.k-progress-badge.st-PAUSED {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: #7f1d1d;
}
.k-progress-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  overflow: hidden;
}
.k-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--blue1) 0%, var(--blue2) 100%);
  transition: width 0.35s ease;
}

/* Steps */
.k-steps {
  padding: 12px;
  display: grid;
  gap: 10px;
}
.k-step {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
}
.k-step-main {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.k-step-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.k-bullet {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 950;
  background: rgba(15, 23, 42, 0.04);
  color: #111827;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
.k-step-name {
  font-weight: 950;
  color: var(--txt);
  display: flex;
  gap: 10px;
  align-items: center;
}
.k-step-chip {
  font-weight: 950;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);
  color: rgba(15, 23, 42, 0.75);
}
.k-step-chip.st-RUNNING {
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.1);
  color: #a16207;
}
.k-step-chip.st-DONE {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
}
.k-step-chip.st-PAUSED,
.k-step-chip.st-CANCELLED,
.k-step-chip.st-ERROR {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: #7f1d1d;
}

.k-link {
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 900;
  color: #334155;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  opacity: 0.9;
}
.k-link:hover {
  opacity: 1;
  color: #1d4ed8;
}

/* Professional logs */
.k-logs-panel {
  margin-top: 10px;
  border: 1px solid #e7eaf3;
  border-radius: 14px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.06);
}
.k-logs-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(180deg, #fbfcff 0%, #f4f7fc 100%);
  border-bottom: 1px solid #edf1f7;
}
.k-logs-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #24324a;
}
.k-logs-title i {
  color: #3b82f6;
  font-size: 16px;
}
.k-logs-count {
  font-size: 12px;
  font-weight: 700;
  color: #7b8798;
  background: #eef2f8;
  padding: 4px 8px;
  border-radius: 999px;
}
.k-logs-body {
  max-height: 280px;
  overflow-y: auto;
  padding: 10px;
  background: #fcfdff;
}
.k-logs-body::-webkit-scrollbar {
  width: 8px;
}
.k-logs-body::-webkit-scrollbar-thumb {
  background: #cfd7e6;
  border-radius: 10px;
}
.k-logs-body::-webkit-scrollbar-track {
  background: transparent;
}
.k-log-empty {
  padding: 18px;
  text-align: center;
  color: #98a2b3;
  font-size: 13px;
  font-weight: 700;
}
.k-log-row {
  display: grid;
  grid-template-columns: 82px 52px 1fr;
  align-items: start;
  gap: 12px;
  padding: 9px 10px;
  margin-bottom: 6px;
  border-radius: 10px;
  transition: background 0.2s ease, transform 0.2s ease;
}
.k-log-row:hover {
  background: #f6f9ff;
}
.k-log-t {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 12px;
  font-weight: 800;
  color: #7f8a9f;
  padding-top: 2px;
  white-space: nowrap;
}
.k-log-badge {
  min-width: 44px;
  text-align: center;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.3px;
  border-radius: 999px;
  padding: 4px 8px;
  line-height: 1.2;
}
.k-log-m {
  font-size: 13px;
  line-height: 1.55;
  color: #27364b;
  word-break: break-word;
  white-space: pre-wrap;
  font-weight: 700;
}
.k-log-row.is-ok {
  background: #f1fbf5;
}
.k-log-row.is-run {
  background: #f7f9ff;
}
.k-log-row.is-error {
  background: #fff4f4;
}
.k-log-row.is-log {
  background: #fafbfd;
}
.k-log-badge.is-ok {
  color: #117a43;
  background: #ddf7e8;
}
.k-log-badge.is-run {
  color: #3156d3;
  background: #e5edff;
}
.k-log-badge.is-error {
  color: #c0392b;
  background: #ffe2df;
}
.k-log-badge.is-log {
  color: #667085;
  background: #edf1f5;
}

/* Footer */
.k-foot {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px 12px;
  background: var(--bg);
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

/* Import modal propre et compacte */
.k-import-head {
  padding: 6px 0 14px;
}
.k-import-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.2;
}
.k-import-sub {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.k-import-box.clean {
  display: grid;
  gap: 12px;
  padding: 4px 0 0;
}
.k-import-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #f8fafc;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.k-import-item:hover {
  border-color: rgba(59, 130, 246, 0.22);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}
.k-import-item-left {
  min-width: 0;
}
.k-import-item-title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.k-import-item-sub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}
.k-import-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
}
:deep(.k-import-modal .el-dialog) {
  border-radius: 18px;
  overflow: hidden;
}
:deep(.k-import-modal .el-dialog__body) {
  padding: 22px 22px 18px;
  background: #ffffff;
}

/* Anim */
.k-fade-enter-active,
.k-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.k-fade-enter,
.k-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Responsive */
@media (max-width: 920px) {
  :deep(.el-dialog) {
    width: 94vw !important;
  }
  .k-form-grid {
    grid-template-columns: 1fr;
  }
  .k-number {
    width: 100%;
  }
  .k-progress-msg {
    max-width: 70vw;
  }
  .k-intermediate-sub {
    max-width: 60vw;
  }
  .k-log-row {
    grid-template-columns: 72px 46px 1fr;
    gap: 8px;
  }
}

.k-muted {
  color: var(--muted);
  font-weight: 800;
}
</style>
