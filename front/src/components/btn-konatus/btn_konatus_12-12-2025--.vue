<template>
    <div>
        <!-- Bouton lanceur -->
        <el-tooltip content="Konatus" placement="right" :open-delay="500">
            <div
                id="btn-konatus"
                class="vw-card vw-link-color"
                :class="{ 'is-active': isPressed }"
                @mousedown="isPressed = true"
                @mouseup="isPressed = false"
                @mouseleave="isPressed = false"
                @click="openWizard"
            >
                <img src="../../assets/konatus-ico.png" alt="Konatus" />
            </div>
        </el-tooltip>

        <!-- ✅ IMPORTANT: pas de v-if ici -->
        <el-dialog
            :visible.sync="showWizard"
            width="820px"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal="true"
            :lock-scroll="true"
            :show-close="true"
            @close="onCloseWizard"
        >
            <!-- ✅ Header -->
            <div class="wizard-header">
                <div class="wizard-brand">
                    <img src="../../assets/konatus-ico.png" alt="Konatus" />
                    <div>
                        <h2 class="wizard-title">
                            Assistant d'import & optimisation
                        </h2>
                        <div class="wizard-subtitle">
                            Export → Prétraitement → Optimisation → Itération →
                            Import → Positionnement
                        </div>
                    </div>
                </div>

                <div class="wizard-meta">
                    <el-tag size="mini" type="info" effect="dark"
                        >Étape {{ activeStep + 1 }}/3</el-tag
                    >
                    <el-tag
                        v-if="activeStep === 0 && isStep1Done"
                        size="mini"
                        type="success"
                        effect="dark"
                        >OK ✅</el-tag
                    >
                    <el-tag
                        v-if="activeStep === 1 && isIterationDone"
                        size="mini"
                        type="success"
                        effect="dark"
                        >OK ✅</el-tag
                    >
                    <el-tag
                        v-if="activeStep === 2 && isStep3Done"
                        size="mini"
                        type="success"
                        effect="dark"
                        >Terminé ✅</el-tag
                    >
                </div>
            </div>

            <div class="body-pad">
                <el-steps
                    :active="activeStep"
                    align-center
                    class="custom-steps mb-4"
                >
                    <el-step
                        title="Étape 1"
                        description="Choisir 2 tableaux"
                        :status="stepStatus(0)"
                    />
                    <el-step
                        title="Étape 2"
                        description="Optimisation"
                        :status="stepStatus(1)"
                    />
                    <el-step
                        title="Étape 3"
                        description="Positionnement"
                        :status="stepStatus(2)"
                    />
                </el-steps>

                <!-- ======================
               ÉTAPE 1
          ======================= -->
                <div v-if="activeStep === 0" class="step-card">
                    <el-alert
                        type="info"
                        show-icon
                        title="Sélectionne un tableau Contexte et un tableau Réponse (différents), puis clique sur « Exporter les données »."
                        class="mb-3"
                    />

                    <div class="grid-2">
                        <el-form :model="form" label-position="top">
                            <el-form-item
                                label="Tableau Contexte"
                                :error="errors.capacity"
                            >
                                <el-select
                                    v-model="form.capacityTable"
                                    placeholder="Choisir un tableau..."
                                    filterable
                                    clearable
                                    :loading="tablesLoading"
                                    @change="recheckStep1"
                                >
                                    <el-option
                                        v-for="t in tables"
                                        :key="t.id + '-cap'"
                                        :label="t.label"
                                        :value="t.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-form>

                        <el-form :model="form" label-position="top">
                            <el-form-item
                                label="Tableau Réponse"
                                :error="errors.tasks"
                            >
                                <el-select
                                    v-model="form.tasksTable"
                                    placeholder="Choisir un tableau..."
                                    filterable
                                    clearable
                                    :loading="tablesLoading"
                                    @change="recheckStep1"
                                >
                                    <el-option
                                        v-for="t in tables"
                                        :key="t.id + '-task'"
                                        :label="t.label"
                                        :value="t.id"
                                    />
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </div>

                    <div
                        v-if="tables.length === 0 && !tablesLoading"
                        class="mt-2"
                    >
                        <el-alert
                            type="warning"
                            show-icon
                            title="Aucun tableau trouvé"
                            description="Vérifiez que vous avez des tableaux dans ce monde."
                        />
                    </div>

                    <div class="actions-row mt-2">
                        <el-button
                            class="btn-Export"
                            :disabled="
                                !canImportStep1 || step1Importing || isStep1Done
                            "
                            @click="startStep1Import"
                        >
                            <i class="el-icon-upload2 mr-1"></i>
                            {{
                                step1Importing
                                    ? "Export en cours..."
                                    : "Exporter les données"
                            }}
                        </el-button>

                        <el-tag
                            v-if="isStep1Done"
                            type="success"
                            effect="plain"
                            class="pill"
                            >Étape 1 validée ✅</el-tag
                        >
                    </div>

                    <div v-if="step1Importing" class="mt-2">
                        <el-progress
                            :percentage="step1Progress"
                            :stroke-width="12"
                            status="warning"
                        />
                    </div>

                    <el-collapse class="mt-3">
                        <el-collapse-item title="Journal (Étape 1)" name="s1">
                            <div class="logs">
                                <div
                                    v-for="(l, i) in logs.step1"
                                    :key="i"
                                    class="log-line"
                                >
                                    <span class="log-time">{{ l.t }}</span>
                                    <span class="log-msg">{{ l.m }}</span>
                                </div>
                                <div
                                    v-if="!logs.step1.length"
                                    class="log-empty"
                                >
                                    Aucun log.
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>

                <!-- ======================
               ÉTAPE 2
          ======================= -->
                <div v-if="activeStep === 1" class="step-card">
                    <el-alert
                        type="info"
                        show-icon
                        title="Lance le prétraitement, puis l’optimisation (≈ 3 minutes) et enfin le calcul d’itération."
                        class="mb-3"
                    />

                    <div class="actions-row">
                        <el-button
                            class="btn-pretraitement"
                            :disabled="pretraiting || isPretraitementDone"
                            @click="startPretraitement"
                        >
                            <i class="el-icon-setting mr-1"></i>
                            {{
                                pretraiting
                                    ? "Prétraitement..."
                                    : "Prétraitement pour optimisation"
                            }}
                        </el-button>

                        <el-tooltip
                            content="Télécharger InputDataOptimizationV1.xlsx"
                            placement="top"
                        >
                            <el-button
                                class="btn-download"
                                icon="el-icon-download"
                                circle
                                :disabled="!isPretraitementDone"
                                @click="downloadInputFile"
                            />
                        </el-tooltip>

                        <el-tag
                            v-if="isPretraitementDone"
                            type="success"
                            effect="plain"
                            class="pill"
                            >Prétraitement OK ✅</el-tag
                        >
                    </div>

                    <div class="actions-row mt-3">
                        <el-button
                            class="btn-optim"
                            :disabled="
                                !isPretraitementDone ||
                                optimizing ||
                                isStep2Done
                            "
                            @click="startOptimization"
                        >
                            <i class="el-icon-video-play mr-1"></i>
                            {{
                                optimizing
                                    ? "Optimisation en cours..."
                                    : "Lancer l’optimisation"
                            }}
                        </el-button>

                        <el-tag
                            v-if="isStep2Done"
                            type="success"
                            effect="plain"
                            class="pill"
                            >Optimisation terminée ✅</el-tag
                        >
                    </div>

                    <div class="actions-row mt-3">
                        <el-button
                            class="btn-iteration"
                            :disabled="
                                !isStep2Done || iterating || isIterationDone
                            "
                            @click="startIteration"
                        >
                            <i class="el-icon-refresh mr-1"></i>
                            {{
                                iterating
                                    ? "Calcul en cours..."
                                    : "Calculer itération"
                            }}
                        </el-button>

                        <el-tooltip
                            content="Télécharger OutDataOptimizationV1.xlsx"
                            placement="top"
                        >
                            <el-button
                                class="btn-download"
                                icon="el-icon-download"
                                circle
                                :disabled="!isIterationDone"
                                @click="downloadIterationFile"
                            />
                        </el-tooltip>

                        <el-tag
                            v-if="isIterationDone"
                            type="success"
                            effect="plain"
                            class="pill"
                            >Itération OK ✅</el-tag
                        >
                    </div>

                    <div v-if="optimizing" class="centered mt-3">
                        <el-progress
                            type="circle"
                            :percentage="progressPercent"
                            :stroke-width="10"
                            status="warning"
                        />
                        <div class="countdown">
                            Progression : {{ progressPercent }}%
                        </div>
                        <div class="hint" v-if="optimizationUsingPolling">
                            Mode: Polling serveur ✅
                        </div>
                        <div class="hint" v-else>Mode: Timer fallback</div>
                    </div>

                    <el-collapse class="mt-3">
                        <el-collapse-item title="Journal (Étape 2)" name="s2">
                            <div class="logs">
                                <div
                                    v-for="(l, i) in logs.step2"
                                    :key="i"
                                    class="log-line"
                                >
                                    <span class="log-time">{{ l.t }}</span>
                                    <span class="log-msg">{{ l.m }}</span>
                                </div>
                                <div
                                    v-if="!logs.step2.length"
                                    class="log-empty"
                                >
                                    Aucun log.
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>

                <!-- ======================
               ÉTAPE 3
          ======================= -->
                <div v-if="activeStep === 2" class="step-card">
                    <el-alert
                        type="info"
                        show-icon
                        title="Importe les données optimisées (output1) directement dans le board cible, puis applique le positionnement."
                        class="mb-3"
                    />

                    <div class="actions-row">
                        <el-button
                            class="btn-import"
                            :disabled="
                                importingOptimized || isOptimizedImported
                            "
                            @click="openImportOptimizedDialog"
                        >
                            <i class="el-icon-upload mr-1"></i>
                            {{
                                importingOptimized
                                    ? "Importation en cours..."
                                    : "Importer données optimisées"
                            }}
                        </el-button>

                        <el-tag
                            v-if="isOptimizedImported"
                            type="success"
                            effect="plain"
                            class="pill"
                            >Import terminé ✅</el-tag
                        >
                    </div>

                    <el-dialog
                        v-if="showImportOptimizedDialog"
                        :visible="true"
                        width="610px"
                        :close-on-click-modal="false"
                        :append-to-body="true"
                        @close="closeImportOptimizedDialog"
                    >
                        <div class="modal-head">
                            <div>
                                <h3 class="modal-title">
                                    Importer données optimisées (output1)
                                </h3>
                                <div class="modal-subtitle">
                                    Le fichier output1 est chargé depuis le
                                    serveur puis importé directement dans le
                                    board cible.
                                </div>
                            </div>
                            <el-tag type="info" effect="plain" size="mini"
                                >Options</el-tag
                            >
                        </div>

                        <div class="switch-panel vw-flex-col" style="gap: 10px">
                            <el-switch
                                v-model="importOpt.importForeground"
                                active-text="Importer objets (foreground)"
                            />
                            <el-switch
                                v-model="importOpt.importBackground"
                                active-text="Importer objets (background)"
                            />
                            <el-switch
                                v-model="importOpt.importLinks"
                                active-text="Importer liens"
                            />
                        </div>

                        <div class="modal-actions">
                            <el-button @click="closeImportOptimizedDialog"
                                >Annuler</el-button
                            >
                            <el-button
                                type="primary"
                                :disabled="noImportOptionIsChecked"
                                @click="importOptimizedDataFromServer"
                            >
                                Importer
                            </el-button>
                        </div>

                        <div v-if="importErrors.length" class="mt-2">
                            <el-alert
                                v-for="(e, idx) in importErrors"
                                :key="idx"
                                type="error"
                                show-icon
                                :title="e.title || 'Erreur'"
                                :description="e.message || String(e)"
                                class="mb-2"
                            />
                        </div>
                    </el-dialog>

                    <div v-if="importingOptimized" class="centered mt-3">
                        <el-progress
                            type="circle"
                            :percentage="importProgress"
                            :stroke-width="10"
                            status="warning"
                        />
                        <div class="countdown">
                            Importation : {{ importProgress }}%
                        </div>
                    </div>

                    <div class="actions-row mt-3">
                        <el-button
                            class="btn-finish"
                            :disabled="
                                positioning ||
                                isStep3Done ||
                                !isOptimizedImported
                            "
                            @click="startPositioning"
                        >
                            <i class="el-icon-magic-stick mr-1"></i>
                            {{
                                positioning
                                    ? "Positionnement en cours..."
                                    : "Appliquer le positionnement"
                            }}
                        </el-button>

                        <el-tag
                            v-if="isStep3Done"
                            type="success"
                            effect="plain"
                            class="pill"
                            >Positionnement OK ✅</el-tag
                        >
                    </div>

                    <div v-if="positioning" class="centered mt-3">
                        <el-progress
                            type="circle"
                            :percentage="positioningPercent"
                            :stroke-width="10"
                            status="warning"
                        />
                        <div class="countdown">
                            Positionnement : {{ positioningPercent }}%
                        </div>
                        <div class="hint" v-if="positioningUsingPolling">
                            Mode: Polling serveur ✅
                        </div>
                        <div class="hint" v-else>Mode: Timer fallback</div>
                    </div>

                    <el-collapse class="mt-3">
                        <el-collapse-item title="Journal (Étape 3)" name="s3">
                            <div class="logs">
                                <div
                                    v-for="(l, i) in logs.step3"
                                    :key="i"
                                    class="log-line"
                                >
                                    <span class="log-time">{{ l.t }}</span>
                                    <span class="log-msg">{{ l.m }}</span>
                                </div>
                                <div
                                    v-if="!logs.step3.length"
                                    class="log-empty"
                                >
                                    Aucun log.
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>

            <!-- ✅ Sticky Action Bar -->
            <div class="sticky-bar">
                <div class="sticky-left">
                    <span class="sticky-step">Étape {{ activeStep + 1 }}:</span>
                    <span class="sticky-label">{{ currentStepLabel }}</span>
                </div>

                <div class="sticky-right">
                    <el-button
                        v-if="activeStep > 0"
                        class="btn-prev"
                        @click="prevStep"
                    >
                        <i class="el-icon-arrow-left mr-1"></i> Précédent
                    </el-button>

                    <el-button
                        v-if="activeStep === 0"
                        class="btn-next"
                        :disabled="!isStep1Done"
                        @click="nextStep"
                    >
                        Continuer <i class="el-icon-arrow-right ml-1"></i>
                    </el-button>

                    <el-button
                        v-if="activeStep === 1"
                        class="btn-next"
                        :disabled="!isIterationDone"
                        @click="nextStep"
                    >
                        Continuer <i class="el-icon-arrow-right ml-1"></i>
                    </el-button>

                    <el-button
                        v-if="activeStep === 2"
                        class="btn-success"
                        :disabled="!isStep3Done"
                        @click="finishWizard"
                    >
                        Terminer <i class="el-icon-check ml-1"></i>
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import omit from "lodash.omit";

export default {
    name: "BtnKonatus",
    inject: ["$view"],

    data() {
        return {
            isPressed: false,
            showWizard: false,
            activeStep: 0,

            isStep1Done: false,
            isStep2Done: false,
            isStep3Done: false,

            // Étape 1
            tables: [],
            tablesLoading: false,
            form: { capacityTable: null, tasksTable: null },
            errors: { capacity: "", tasks: "" },
            step1Importing: false,
            step1Progress: 0,

            // Étape 2
            pretraiting: false,
            isPretraitementDone: false,
            optimizing: false,
            progressPercent: 0,
            iterating: false,
            isIterationDone: false,

            optimizationPollTimer: null,
            optimizationUsingPolling: false,
            optimizationFallbackInterval: null,
            optimizationFallbackTimeout: null,

            // Étape 3
            importingOptimized: false,
            isOptimizedImported: false,
            importProgress: 0,

            positioning: false,
            positioningPercent: 0,
            positioningPollTimer: null,
            positioningUsingPolling: false,
            positioningFallbackInterval: null,
            positioningFallbackTimeout: null,

            showImportOptimizedDialog: false,
            importOpt: {
                importForeground: true,
                importBackground: true,
                importLinks: true,
            },
            importErrors: [],

            XLSX: null,
            lastInputWorkbook: null,

            logs: { step1: [], step2: [], step3: [] },

            // anti-concurrence
            step1RunId: 0,
            step2RunId: 0,
            step3RunId: 0,

            // abort fetch
            aborters: { step1: null, step2: null, step3: null },
        };
    },

    computed: {
        canImportStep1() {
            return (
                this.form.capacityTable &&
                this.form.tasksTable &&
                this.form.capacityTable !== this.form.tasksTable
            );
        },
        noImportOptionIsChecked() {
            return (
                !this.importOpt.importForeground &&
                !this.importOpt.importBackground &&
                !this.importOpt.importLinks
            );
        },
        currentStepLabel() {
            if (this.activeStep === 0) return "Sélection & export des données";
            if (this.activeStep === 1)
                return "Prétraitement, optimisation & itération";
            return "Import output1 & positionnement";
        },
    },

    methods: {
        baseUrl() {
            return location.hostname === "localhost"
                ? "http://localhost:8080"
                : "http://87.106.255.115:8080";
        },

        nowTime() {
            const d = new Date();
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            const ss = String(d.getSeconds()).padStart(2, "0");
            return `${hh}:${mm}:${ss}`;
        },

        pushLog(step, message) {
            const key = step === 1 ? "step1" : step === 2 ? "step2" : "step3";
            this.logs[key].unshift({ t: this.nowTime(), m: message });
            this.logs[key] = this.logs[key].slice(0, 120);
        },

        // ✅ fetch robuste + timeout + abort
        async fetchWithTimeout(
            url,
            options = {},
            timeoutMs = 180000,
            abortKey = null
        ) {
            if (abortKey) {
                try {
                    this.aborters[abortKey]?.abort?.();
                } catch (_) {}
                this.aborters[abortKey] = new AbortController();
                options.signal = this.aborters[abortKey].signal;
            }

            const t = setTimeout(() => {
                try {
                    options.signal?.abort?.();
                } catch (_) {}
            }, timeoutMs);

            try {
                return await fetch(url, options);
            } finally {
                clearTimeout(t);
            }
        },

        async openWizard() {
            this.showWizard = true;
            await this.loadAvailableTables();
        },

        onCloseWizard() {
            this.showWizard = false;
            this.resetWizard();
        },

        async loadAvailableTables() {
            this.tablesLoading = true;
            try {
                const boardsArray =
                    this.$store.getters["boardAlive/asArray"] || [];
                this.tables = boardsArray
                    .filter(
                        (b) => b && (b._id || b.id) && (b.data?.name || b.name)
                    )
                    .map((b) => ({
                        id: b._id || b.id,
                        label:
                            b.data?.name ||
                            b.name ||
                            `Tableau ${b._id || b.id}`,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));

                if (this.tables.length === 0) this.loadFallbackTables();
                this.pushLog(1, `Tables chargées: ${this.tables.length}`);
            } catch (e) {
                this.loadFallbackTables();
                this.pushLog(1, `Fallback tables (erreur store): ${e.message}`);
            } finally {
                this.tablesLoading = false;
            }
        },

        loadFallbackTables() {
            this.tables = [
                {
                    id: this.$view.boardId,
                    label: `Tableau actuel (${this.$view.boardId})`,
                },
                { id: "demo2Contexte", label: "demo2Contexte" },
                { id: "demo2Reponse", label: "demo2Reponse" },
            ].filter((t, i, arr) => i === arr.findIndex((x) => x.id === t.id));
        },

        // ✅ stop timers + polling + aborts
        resetWizard() {
            this.activeStep = 0;
            this.isStep1Done = false;
            this.isStep2Done = false;
            this.isStep3Done = false;

            this.form = { capacityTable: null, tasksTable: null };
            this.errors = { capacity: "", tasks: "" };

            this.step1Importing = false;
            this.step1Progress = 0;

            this.pretraiting = false;
            this.isPretraitementDone = false;

            this.optimizing = false;
            this.progressPercent = 0;
            this.iterating = false;
            this.isIterationDone = false;

            this.importingOptimized = false;
            this.isOptimizedImported = false;
            this.importProgress = 0;

            this.positioning = false;
            this.positioningPercent = 0;

            clearInterval(this.optimizationPollTimer);
            clearInterval(this.positioningPollTimer);
            clearInterval(this.optimizationFallbackInterval);
            clearInterval(this.positioningFallbackInterval);
            clearTimeout(this.optimizationFallbackTimeout);
            clearTimeout(this.positioningFallbackTimeout);

            this.optimizationPollTimer = null;
            this.positioningPollTimer = null;
            this.optimizationFallbackInterval = null;
            this.positioningFallbackInterval = null;
            this.optimizationFallbackTimeout = null;
            this.positioningFallbackTimeout = null;

            this.optimizationUsingPolling = false;
            this.positioningUsingPolling = false;

            this.showImportOptimizedDialog = false;
            this.importOpt = {
                importForeground: true,
                importBackground: true,
                importLinks: true,
            };
            this.importErrors = [];

            this.lastInputWorkbook = null;

            this.logs.step1 = [];
            this.logs.step2 = [];
            this.logs.step3 = [];

            // annule requêtes en cours
            try {
                this.aborters.step1?.abort?.();
            } catch (_) {}
            try {
                this.aborters.step2?.abort?.();
            } catch (_) {}
            try {
                this.aborters.step3?.abort?.();
            } catch (_) {}
        },

        stepStatus(i) {
            if (i < this.activeStep) return "finish";
            if (i === this.activeStep) return "process";
            return "wait";
        },

        /* ===========================
         ✅ FIX EXPORT: attente fiable
         - watch store
         - + redispatch si rien n'arrive
      ============================ */
        waitForBoardIoDataStable(boardId, timeoutMs = 240000, runId = null) {
            return new Promise((resolve, reject) => {
                let done = false;

                const stop = () => {
                    if (done) return;
                    done = true;
                    try {
                        unwatch && unwatch();
                    } catch (_) {}
                    clearTimeout(timer);
                    clearInterval(pulse);
                };

                const timer = setTimeout(() => {
                    stop();
                    reject(
                        new Error(
                            `Timeout: export du tableau ${boardId} non reçu (${Math.round(
                                timeoutMs / 1000
                            )}s).`
                        )
                    );
                }, timeoutMs);

                // 🔁 “pulse” : si le store ne bouge pas, on relance un export (effet anti-aléatoire)
                const pulse = setInterval(async () => {
                    try {
                        if (runId && runId !== this.step1RunId) return;
                        await this.$store.dispatch("boardIoGet/get", {
                            worldId: this.$view.worldId,
                            boardId,
                            format: "xlsx",
                        });
                        this.pushLog(1, "Pulse export (relance)...");
                    } catch (_) {}
                }, 35000); // toutes les 35s

                const unwatch = this.$store.watch(
                    () => this.$store.getters["boardIoGet/byId"](boardId),
                    (val) => {
                        if (runId && runId !== this.step1RunId) return;
                        if (val?.data?.VW?.objects) {
                            stop();
                            resolve(val);
                        }
                    },
                    { immediate: true }
                );
            });
        },

        /* ---- Étape 1 ---- */
        recheckStep1() {
            this.step1RunId++;
            this.isStep1Done = false;
            this.step1Importing = false;
            this.step1Progress = 0;
            this.lastInputWorkbook = null;
            try {
                this.aborters.step1?.abort?.();
            } catch (_) {}
            this.pushLog(1, "Sélection modifiée → reset validation étape 1");
        },

        async startStep1Import() {
            if (!this.canImportStep1 || this.step1Importing || this.isStep1Done)
                return;

            const runId = ++this.step1RunId;
            this.step1Importing = true;
            this.step1Progress = 0;

            try {
                this.pushLog(
                    1,
                    "Début export + génération InputDataOptimization..."
                );

                if (!this.XLSX) this.XLSX = await import("xlsx");
                this.step1Progress = 10;

                const exportOnce = async (label) => {
                    this.pushLog(1, `Export store (${label})...`);
                    await this.$store.dispatch("boardIoGet/get", {
                        worldId: this.$view.worldId,
                        boardId: this.form.capacityTable,
                        format: "xlsx",
                    });

                    // ✅ attente stable (watch + pulse)
                    return await this.waitForBoardIoDataStable(
                        this.form.capacityTable,
                        240000,
                        runId
                    );
                };

                let contexteBoardIo = null;

                // ✅ 2 tentatives (couvre le “une fois oui, une fois non”)
                try {
                    contexteBoardIo = await exportOnce("tentative 1/2");
                } catch (e1) {
                    if (runId !== this.step1RunId) return;
                    this.pushLog(1, `Non reçu → retry 2/2 (${e1.message})`);
                    contexteBoardIo = await exportOnce("tentative 2/2");
                }

                if (runId !== this.step1RunId) return;
                this.step1Progress = 55;

                await this.processContexteExportPlusCapaciteReponse(
                    contexteBoardIo
                );
                if (runId !== this.step1RunId) return;

                this.step1Progress = 100;
                this.step1Importing = false;
                this.isStep1Done = true;

                this.pushLog(
                    1,
                    "Export terminé ✅ (InputDataOptimization sauvegardé côté serveur)"
                );
                this.$message.success(
                    "Import terminé ✔ - Contexte : Objets/Liens, Réponse : capacite"
                );
            } catch (err) {
                if (runId !== this.step1RunId) return;
                this.step1Importing = false;
                this.step1Progress = 0;
                this.pushLog(1, `Erreur export: ${err.message}`);
                this.$message.error(`Erreur lors de l'import: ${err.message}`);
            }
        },

        async processContexteExportPlusCapaciteReponse(contexteBoardIo) {
            const CELL_MAX_LENGTH = 32765;

            if (!contexteBoardIo?.data?.VW?.objects) {
                throw new Error(
                    "Données d'export (xlsx) introuvables pour le tableau Contexte."
                );
            }

            const { objects, links } = contexteBoardIo.data.VW;

            const formattedObjects = objects.map((item) =>
                Object.assign(
                    {
                        [this.$t("xlsx_export.headings.componentName")]:
                            this.$store.getters[`componentAlive/nameById`](
                                item.componentId
                            ),
                        [this.$t("xlsx_export.headings.left")]: Math.round(
                            item.position.data.left
                        ),
                        [this.$t("xlsx_export.headings.top")]: Math.round(
                            item.position.data.top
                        ),
                        [this.$t("xlsx_export.headings.width")]: Math.round(
                            item.position.data.width
                        ),
                        [this.$t("xlsx_export.headings.height")]: Math.round(
                            item.position.data.height
                        ),
                        [this.$t("xlsx_export.headings.zIndex")]: Math.round(
                            item.position.data.zIndex
                        ),
                        [this.$t("xlsx_export.headings.rotation")]:
                            Math.round(item.position.data.rotation) || 0,
                        [this.$t("xlsx_export.headings.layer")]: this.$t(
                            "xlsx_export.placeholders." +
                                (item.position.protect.isBackground
                                    ? "background"
                                    : "foreground")
                        ),
                        [this.$t("xlsx_export.headings.styleBackgroundColor")]:
                            item.object?.protect?.styleBackgroundColor,
                        [this.$t("xlsx_export.headings.styleOutlineColor")]:
                            item.object?.protect?.styleOutlineColor,
                        [this.$t("xlsx_export.headings.styleColor")]:
                            item.object?.protect?.styleColor,
                    },
                    this.mapValues(item.object.data, (property) => {
                        if (!property) return "null";
                        if (property?.[0]?.fileName)
                            return property?.[0]?.fileName;
                        if (
                            typeof property === "string" &&
                            property.length > CELL_MAX_LENGTH
                        )
                            return property.slice(0, CELL_MAX_LENGTH);
                        return property;
                    })
                )
            );

            const formattedLinks = links.map((item) => ({
                [this.$t("xlsx_export.headings.linkOrigin")]:
                    2 +
                    objects.findIndex(
                        (o) =>
                            o.objectId &&
                            o.objectId ==
                                item.objects[item.objects[0].data.arrowhead]
                                    .objectId
                    ),
                [this.$t("xlsx_export.headings.linkEnd")]:
                    2 +
                    objects.findIndex(
                        (o) =>
                            o.objectId &&
                            o.objectId ==
                                item.objects[item.objects[1].data.arrowhead]
                                    .objectId
                    ),
                [this.$t("xlsx_export.headings.linkModel")]:
                    this.$store.getters[`linkModelAlive/nameById`](
                        item.linkModelId
                    ),
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
                1,
                `Objets exportés: ${formattedObjects.length}, Liens: ${formattedLinks.length}`
            );

            const capacityResults =
                await this.calculateCapacityWithReponseBoard(
                    this.form.tasksTable
                );
            this.pushLog(
                1,
                `Capacité calculée: ${capacityResults?.length || 0} lignes`
            );

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

            const buffer = this.XLSX.write(workbook, { type: "array" });

            const res = await this.fetchWithTimeout(
                `${this.baseUrl()}/api/save-input-data-optimization`,
                {
                    method: "POST",
                    body: buffer,
                    headers: {
                        "Content-Type":
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                },
                180000,
                "step1"
            );

            if (!res.ok)
                throw new Error(
                    `Erreur sauvegarde: ${res.status} ${await res.text()}`
                );
        },

        async calculateCapacityWithReponseBoard(reponseBoardId) {
            const url = `${this.baseUrl()}/api/calculate-capacity-nv?worldId=${
                this.$view.worldId
            }&boardId=${reponseBoardId}`;
            const res = await this.fetchWithTimeout(
                url,
                { method: "GET" },
                180000,
                "step1"
            );
            if (!res.ok)
                throw new Error(
                    `Erreur calcul capacité: ${res.status} ${await res.text()}`
                );
            return await res.json();
        },

        mapValues(obj, fn) {
            const result = {};
            for (const k in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, k))
                    result[k] = fn(obj[k], k);
            }
            return result;
        },

        /* ---- Étape 2 ---- */
        async startPretraitement() {
            if (this.pretraiting || this.isPretraitementDone) return;
            this.pretraiting = true;
            this.pushLog(2, "Prétraitement lancé...");
            try {
                const res = await this.fetchWithTimeout(
                    `${this.baseUrl()}/api/preatretment-input`,
                    { method: "POST" },
                    180000,
                    "step2"
                );
                if (!res.ok) throw new Error(await res.text());
                this.isPretraitementDone = true;
                this.pushLog(2, "Prétraitement terminé ✅");
                this.$message.success("Prétraitement terminé ✔");
            } catch (e) {
                this.pushLog(2, `Erreur prétraitement: ${e.message}`);
                this.$message.error(
                    "Erreur durant le prétraitement : " + e.message
                );
            } finally {
                this.pretraiting = false;
            }
        },

        downloadInputFile() {
            const url = `${this.baseUrl()}/api/download-input-data-optimization`;
            const link = document.createElement("a");
            link.href = url;
            link.download = "InputDataOptimizationV1.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.pushLog(2, "Téléchargement InputDataOptimizationV1.xlsx");
        },

        async startOptimization() {
            if (
                this.optimizing ||
                this.isStep2Done ||
                !this.isPretraitementDone
            )
                return;

            const runId = ++this.step2RunId;
            this.optimizing = true;
            this.progressPercent = 0;
            this.optimizationUsingPolling = false;
            this.pushLog(2, "Optimisation lancée...");

            try {
                const res = await this.fetchWithTimeout(
                    `${this.baseUrl()}/api/execute-calcul-dates`,
                    { method: "POST" },
                    60000,
                    "step2"
                );
                if (!res.ok) throw new Error(await res.text());
            } catch (e) {
                if (runId !== this.step2RunId) return;
                this.optimizing = false;
                this.pushLog(2, `Erreur lancement optimisation: ${e.message}`);
                this.$message.error(
                    "Erreur durant l'optimisation : " + e.message
                );
                return;
            }

            const okPolling = await this.tryStartOptimizationPolling(runId);
            if (!okPolling) this.startOptimizationFallbackTimer(runId);
        },

        async tryStartOptimizationPolling(runId) {
            try {
                const test = await this.fetchWithTimeout(
                    `${this.baseUrl()}/api/optimization-status`,
                    { method: "GET" },
                    8000,
                    "step2"
                );
                if (!test.ok) throw new Error("status endpoint not ok");

                this.optimizationUsingPolling = true;
                this.pushLog(
                    2,
                    "Polling serveur activé ✅ (/api/optimization-status)"
                );

                clearInterval(this.optimizationPollTimer);
                this.optimizationPollTimer = setInterval(async () => {
                    try {
                        if (runId !== this.step2RunId) return;

                        const r = await this.fetchWithTimeout(
                            `${this.baseUrl()}/api/optimization-status`,
                            { method: "GET" },
                            15000,
                            "step2"
                        );
                        if (!r.ok) throw new Error("bad status");
                        const data = await r.json();

                        this.progressPercent = Math.max(
                            0,
                            Math.min(100, Number(data.percent || 0))
                        );
                        if (data.message) this.pushLog(2, data.message);

                        if (data.done) {
                            clearInterval(this.optimizationPollTimer);
                            this.optimizationPollTimer = null;

                            if (data.success === false) {
                                this.optimizing = false;
                                this.pushLog(
                                    2,
                                    `Optimisation KO: ${
                                        data.message || "erreur"
                                    }`
                                );
                                this.$message.error(
                                    "Optimisation échouée : " +
                                        (data.message || "")
                                );
                                return;
                            }

                            this.progressPercent = 100;
                            this.isStep2Done = true;
                            this.optimizing = false;
                            this.pushLog(2, "Optimisation terminée ✅");
                            this.$message.success("Optimisation terminée ✔");
                        }
                    } catch (_) {
                        clearInterval(this.optimizationPollTimer);
                        this.optimizationPollTimer = null;
                        this.optimizationUsingPolling = false;
                        this.pushLog(
                            2,
                            "Polling indisponible → fallback timer"
                        );
                        this.startOptimizationFallbackTimer(runId);
                    }
                }, 1500);

                return true;
            } catch (_) {
                this.optimizationUsingPolling = false;
                this.pushLog(
                    2,
                    "Endpoint /api/optimization-status absent → fallback timer"
                );
                return false;
            }
        },

        startOptimizationFallbackTimer(runId) {
            const totalDuration = 3 * 60 * 1000;
            const intervalMs = totalDuration / 100;

            clearInterval(this.optimizationFallbackInterval);
            clearTimeout(this.optimizationFallbackTimeout);

            this.optimizationFallbackInterval = setInterval(() => {
                if (runId !== this.step2RunId) return;
                if (this.progressPercent < 99) this.progressPercent += 1;
            }, intervalMs);

            this.optimizationFallbackTimeout = setTimeout(() => {
                if (runId !== this.step2RunId) return;
                if (!this.optimizing) return;

                this.progressPercent = 100;
                this.isStep2Done = true;
                this.optimizing = false;

                clearInterval(this.optimizationFallbackInterval);
                this.optimizationFallbackInterval = null;
                this.optimizationFallbackTimeout = null;

                this.pushLog(2, "Optimisation terminée (timer) ✅");
                this.$message.success("Optimisation terminée ✔");
            }, totalDuration);
        },

        async startIteration() {
            if (this.iterating || this.isIterationDone || !this.isStep2Done)
                return;
            this.iterating = true;
            this.pushLog(2, "Calcul itération lancé...");
            try {
                const res = await this.fetchWithTimeout(
                    `${this.baseUrl()}/api/recalculate-iterations`,
                    { method: "POST" },
                    240000,
                    "step2"
                );
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                if (data.success) {
                    this.isIterationDone = true;
                    const updated = data.summary?.totalLinesUpdated || 0;
                    this.pushLog(
                        2,
                        `Itération OK: ${updated} lignes mises à jour ✅`
                    );
                    this.$message.success(
                        `Itération calculée ✅ (${updated} lignes mises à jour)`
                    );
                } else {
                    this.pushLog(2, `Itération KO: ${data.error || ""}`);
                    this.$message.error(
                        "Le serveur a répondu sans succès : " +
                            (data.error || "")
                    );
                }
            } catch (e) {
                this.pushLog(2, `Erreur itération: ${e.message}`);
                this.$message.error(
                    "Erreur durant le calcul d'itération : " + e.message
                );
            } finally {
                this.iterating = false;
            }
        },

        downloadIterationFile() {
            const url = `${this.baseUrl()}/api/download-iteration-output`;
            const link = document.createElement("a");
            link.href = url;
            link.download = "OutDataOptimizationV1.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.pushLog(2, "Téléchargement OutDataOptimizationV1.xlsx");
        },

        /* ---- Étape 3 ---- */
        openImportOptimizedDialog() {
            this.importErrors = [];
            this.showImportOptimizedDialog = true;
            this.pushLog(3, "Ouverture modal import output1");
        },
        closeImportOptimizedDialog() {
            this.showImportOptimizedDialog = false;
            this.pushLog(3, "Fermeture modal import output1");
        },

        requireSheet(wb, sheetName) {
            const ws = wb?.Sheets?.[sheetName];
            if (!ws) {
                const available = Object.keys(wb?.Sheets || {}).join(", ");
                throw new Error(
                    `Feuille "${sheetName}" introuvable. Feuilles disponibles: ${available}`
                );
            }
            return ws;
        },

        ensureIdsResolved(objects, links) {
            const missingComponents = [];
            for (const o of objects)
                if (!o.componentId) missingComponents.push(o.objectId);
            const missingLinkModels = [];
            for (const l of links)
                if (!l.linkModelId) missingLinkModels.push(l._id);

            if (missingComponents.length) {
                throw new Error(
                    `Import impossible: ${missingComponents.length} composant(s) introuvable(s).`
                );
            }
            if (missingLinkModels.length) {
                throw new Error(
                    `Import impossible: ${missingLinkModels.length} linkModel(s) introuvable(s).`
                );
            }
        },

        async importOptimizedDataFromServer() {
            if (this.importingOptimized || this.isOptimizedImported) return;

            const runId = ++this.step3RunId;
            this.importErrors = [];
            this.importingOptimized = true;
            this.importProgress = 5;

            const TARGET_WORLD_ID = "68b70d885688a422d9513890";
            const TARGET_BOARD_ID = "690a1d27ee300fc9f6ee5ae9";
            const url = `${this.baseUrl()}/api/download-optimization-output`;

            try {
                this.pushLog(3, "Téléchargement output1...");
                if (!this.XLSX) this.XLSX = await import("xlsx");
                this.importProgress = 15;

                const res = await this.fetchWithTimeout(
                    url,
                    { method: "GET" },
                    240000,
                    "step3"
                );
                if (!res.ok)
                    throw new Error(
                        `Téléchargement XLSX impossible (${
                            res.status
                        }) : ${await res.text()}`
                    );
                if (runId !== this.step3RunId) return;

                const ab = await res.arrayBuffer();
                this.importProgress = 30;

                const wb = this.XLSX.read(ab, { type: "array" });
                this.importProgress = 45;

                const sheetObjectsName = this.$t("xlsx_export.sheets.objects");
                const sheetLinksName = this.$t("xlsx_export.sheets.links");

                const wsObjects = this.requireSheet(wb, sheetObjectsName);
                const wsLinks = this.requireSheet(wb, sheetLinksName);

                const rowsObjects = this.XLSX.utils.sheet_to_json(wsObjects, {
                    defval: "",
                });
                const rowsLinks = this.XLSX.utils.sheet_to_json(wsLinks, {
                    defval: "",
                });

                if (!rowsObjects.length)
                    throw new Error(
                        `La feuille "${sheetObjectsName}" est vide.`
                    );
                this.importProgress = 55;

                const allObjects = rowsObjects.map((item, index) => {
                    const compName =
                        item[this.$t("xlsx_export.headings.componentName")];
                    const componentId =
                        this.$store.getters[`componentAlive/idByName`](
                            compName
                        );

                    return {
                        index,
                        objectId: `object_${2 + index}`,
                        componentId,
                        object: {
                            data: omit(item, [
                                this.$t("xlsx_export.headings.componentName"),
                                this.$t(
                                    "xlsx_export.headings.styleBackgroundColor"
                                ),
                                this.$t(
                                    "xlsx_export.headings.styleOutlineColor"
                                ),
                                this.$t("xlsx_export.headings.styleColor"),
                                this.$t("xlsx_export.headings.left"),
                                this.$t("xlsx_export.headings.top"),
                                this.$t("xlsx_export.headings.zIndex"),
                                this.$t("xlsx_export.headings.width"),
                                this.$t("xlsx_export.headings.height"),
                                this.$t("xlsx_export.headings.rotation"),
                                this.$t("xlsx_export.headings.layer"),
                            ]),
                            protect: {
                                styleBackgroundColor:
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.styleBackgroundColor"
                                        )
                                    ],
                                styleOutlineColor:
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.styleOutlineColor"
                                        )
                                    ],
                                styleColor:
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.styleColor"
                                        )
                                    ],
                            },
                        },
                        position: {
                            data: {
                                left: Number(
                                    item[
                                        this.$t("xlsx_export.headings.left")
                                    ] || 0
                                ),
                                top: Number(
                                    item[this.$t("xlsx_export.headings.top")] ||
                                        0
                                ),
                                zIndex: Number(
                                    item[
                                        this.$t("xlsx_export.headings.zIndex")
                                    ] || 0
                                ),
                                rotation: Number(
                                    item[
                                        this.$t("xlsx_export.headings.rotation")
                                    ] || 0
                                ),
                                width: Number(
                                    item[
                                        this.$t("xlsx_export.headings.width")
                                    ] || 120
                                ),
                                height: Number(
                                    item[
                                        this.$t("xlsx_export.headings.height")
                                    ] || 60
                                ),
                            },
                            protect: {
                                isBackground:
                                    item[
                                        this.$t("xlsx_export.headings.layer")
                                    ] ==
                                    this.$t(
                                        "xlsx_export.placeholders.background"
                                    ),
                            },
                        },
                    };
                });

                const allLinks = rowsLinks.map((item, index) => {
                    const lmName =
                        item[this.$t("xlsx_export.headings.linkModel")];
                    const linkModelId =
                        this.$store.getters[`linkModelAlive/idByName`](lmName);

                    const originIndex = Number(
                        item[this.$t("xlsx_export.headings.linkOrigin")]
                    );
                    const endIndex = Number(
                        item[this.$t("xlsx_export.headings.linkEnd")]
                    );

                    return {
                        _id: `link_${2 + index}`,
                        linkModelId,
                        data: {
                            title:
                                item[this.$t("xlsx_export.headings.label")] ||
                                "",
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
                                data: {
                                    arrowhead: 0,
                                    type: item[
                                        this.$t(
                                            "xlsx_export.headings.originShape"
                                        )
                                    ],
                                },
                            },
                            {
                                _id: `link_end_${2 + index}`,
                                linkId: `link_${2 + index}`,
                                objectId: `object_${endIndex}`,
                                data: {
                                    arrowhead: 1,
                                    type: item[
                                        this.$t("xlsx_export.headings.endShape")
                                    ],
                                },
                            },
                        ],
                    };
                });

                const objects = allObjects
                    .filter((o) =>
                        this.importOpt.importBackground
                            ? true
                            : !o?.position?.protect?.isBackground
                    )
                    .filter((o) =>
                        this.importOpt.importForeground
                            ? true
                            : o?.position?.protect?.isBackground
                    );

                const links = this.importOpt.importLinks ? allLinks : [];

                this.importProgress = 70;
                this.ensureIdsResolved(objects, links);

                objects.sort(
                    (a, b) =>
                        (a?.position?.data?.zIndex || 0) -
                        (b?.position?.data?.zIndex || 0)
                );
                let zIndex = this.$store.getters[`positionAlive/zIndexMax`];
                for (const o of objects) {
                    if (o?.position?.data) o.position.data.zIndex = ++zIndex;
                }

                this.importProgress = 85;

                this.pushLog(
                    3,
                    `Injection board cible: objects=${objects.length}, links=${links.length}`
                );
                await this.$store.dispatch("boardIoSet/set", {
                    worldId: TARGET_WORLD_ID,
                    boardId: TARGET_BOARD_ID,
                    VW: { objects, links },
                    options: {
                        ...this.importOpt,
                        flushForeground: false,
                        flushBackground: false,
                        updateModel: false,
                        useNewObjectId: true,
                    },
                });

                if (runId !== this.step3RunId) return;

                this.importProgress = 100;
                this.isOptimizedImported = true;
                this.showImportOptimizedDialog = false;
                this.pushLog(3, "Import output1 terminé ✅");
                this.$message.success(
                    "✅ output1 importé dans le board cible !"
                );
            } catch (e) {
                if (runId !== this.step3RunId) return;
                this.importErrors = [
                    { title: "Import impossible", message: e.message },
                ];
                this.importProgress = 0;
                this.pushLog(3, `Erreur import: ${e.message}`);
                this.$message.error(e.message);
            } finally {
                if (runId === this.step3RunId) this.importingOptimized = false;
            }
        },

        async startPositioning() {
            if (
                this.positioning ||
                this.isStep3Done ||
                !this.isOptimizedImported
            )
                return;

            const runId = ++this.step3RunId;
            this.positioning = true;
            this.positioningPercent = 0;
            this.positioningUsingPolling = false;
            this.pushLog(3, "Positionnement lancé...");

            const okPolling = await this.tryStartPositioningPolling(runId);
            if (!okPolling) this.startPositioningFallbackTimer(runId);
        },

        async tryStartPositioningPolling(runId) {
            try {
                const test = await this.fetchWithTimeout(
                    `${this.baseUrl()}/api/positioning-status`,
                    { method: "GET" },
                    8000,
                    "step3"
                );
                if (!test.ok) throw new Error("status endpoint not ok");

                this.positioningUsingPolling = true;
                this.pushLog(
                    3,
                    "Polling serveur activé ✅ (/api/positioning-status)"
                );

                clearInterval(this.positioningPollTimer);
                this.positioningPollTimer = setInterval(async () => {
                    try {
                        if (runId !== this.step3RunId) return;

                        const r = await this.fetchWithTimeout(
                            `${this.baseUrl()}/api/positioning-status`,
                            { method: "GET" },
                            15000,
                            "step3"
                        );
                        if (!r.ok) throw new Error("bad status");
                        const data = await r.json();

                        this.positioningPercent = Math.max(
                            0,
                            Math.min(100, Number(data.percent || 0))
                        );
                        if (data.message) this.pushLog(3, data.message);

                        if (data.done) {
                            clearInterval(this.positioningPollTimer);
                            this.positioningPollTimer = null;

                            if (data.success === false) {
                                this.positioning = false;
                                this.pushLog(
                                    3,
                                    `Positionnement KO: ${
                                        data.message || "erreur"
                                    }`
                                );
                                this.$message.error(
                                    "Positionnement échoué : " +
                                        (data.message || "")
                                );
                                return;
                            }

                            this.positioningPercent = 100;
                            this.isStep3Done = true;
                            this.positioning = false;
                            this.pushLog(3, "Positionnement terminé ✅");
                            this.$message.success("Positionnement terminé ✔");
                        }
                    } catch (_) {
                        clearInterval(this.positioningPollTimer);
                        this.positioningPollTimer = null;
                        this.positioningUsingPolling = false;
                        this.pushLog(
                            3,
                            "Polling indisponible → fallback timer"
                        );
                        this.startPositioningFallbackTimer(runId);
                    }
                }, 1500);

                return true;
            } catch (_) {
                this.positioningUsingPolling = false;
                this.pushLog(
                    3,
                    "Endpoint /api/positioning-status absent → fallback timer"
                );
                return false;
            }
        },

        startPositioningFallbackTimer(runId) {
            const totalDuration = 2 * 60 * 1000;
            const intervalMs = totalDuration / 100;

            clearInterval(this.positioningFallbackInterval);
            clearTimeout(this.positioningFallbackTimeout);

            this.positioningFallbackInterval = setInterval(() => {
                if (runId !== this.step3RunId) return;
                if (this.positioningPercent < 99) this.positioningPercent += 1;
            }, intervalMs);

            this.positioningFallbackTimeout = setTimeout(() => {
                if (runId !== this.step3RunId) return;
                if (!this.positioning) return;

                this.positioningPercent = 100;
                this.isStep3Done = true;
                this.positioning = false;

                clearInterval(this.positioningFallbackInterval);
                this.positioningFallbackInterval = null;
                this.positioningFallbackTimeout = null;

                this.pushLog(3, "Positionnement terminé (timer) ✅");
                this.$message.success("Positionnement terminé ✔");
            }, totalDuration);
        },

        nextStep() {
            if (this.activeStep === 0 && this.isStep1Done) this.activeStep = 1;
            else if (this.activeStep === 1 && this.isIterationDone)
                this.activeStep = 2;
        },
        prevStep() {
            if (this.activeStep > 0) this.activeStep--;
        },
        finishWizard() {
            this.$message.success("✅ Processus terminé.");
            this.showWizard = false;
            this.resetWizard();
        },
    },

    // ✅ Vue2 hooks (IMPORTANT)
    beforeDestroy() {
        this.resetWizard();
    },
    destroyed() {
        this.resetWizard();
    },
};
</script>

<style scoped></style>
