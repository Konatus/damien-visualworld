<template>
    <div>
        <el-form ref="jira" label-position="right" label-width="100px" :model="jira" :rules="rules">
            <el-alert
                v-if="error || useLimit"
                style="margin: 10px 0"
                :title="useLimit ? useLimit.title : $t('jira.api_error')"
                :description="(useLimit && useLimit.description) || errorDescription"
                :closable="false"
                type="error"
                effect="dark"
            />
            <el-form-item prop="host" :label="$t('jira.host')">
                <el-input :disabled="isConnected" v-model="jira.host" />
            </el-form-item>
            <el-form-item prop="username" :label="$t('jira.username')">
                <el-input :disabled="isConnected" v-model="jira.username" />
            </el-form-item>
            <el-form-item v-if="!isConnected" prop="jiraApiToken" :label="$t('jira.api_token')">
                <el-input show-password :disabled="isConnected" type="jiraApiToken" v-model="jira.jiraApiToken" />
            </el-form-item>
            <el-form-item size="large" style="text-align: right">
                <el-button v-if="!isConnected" :disabled="!validate" type="primary" @click="onSubmit">
                    {{ $t("jira.validate") }}
                </el-button>
                <el-popconfirm
                    v-show="isConnected"
                    :confirm-button-text="$t('jira.confirm_reset')"
                    :cancel-button-text="$t('jira.cancel_reset')"
                    style="margin: 10px"
                    :title="$t('jira.reset_sync')"
                    @confirm="resetForm"
                >
                    <el-button slot="reference">{{ $t("jira.reset_button") }}</el-button>
                </el-popconfirm>
                <el-button v-show="isConnected" @click="doRefresh" icon="el-icon-refresh">
                    {{ $t("jira.refresh") }}
                </el-button>
            </el-form-item>
        </el-form>

        <!-- Projets Jira -->
        <el-select
            v-if="isConnected"
            style="width: 100%"
            v-model="key"
            multiple filterable allow-create default-first-option
            :placeholder="$t('jira.project_sync_placeholder')"
        >
            <el-option
                v-for="item in boardJiraData"
                :key="item.key"
                :label="`${item.key} : ${item.name}`"
                :value="item.key"
            />
        </el-select>

        <!-- ═══════════════ MAPPING ÉQUIPES ═══════════════ -->
        <div v-if="isConnected" class="jts">

            <!-- Titre + bouton charger Jira -->
            <div class="jts-header">
                <span class="jts-title"><i class="el-icon-user"></i> Mapping des équipes</span>
                <el-button size="mini" icon="el-icon-refresh" :loading="teamLoading" @click="loadJiraTeams">
                    Charger les équipes Jira
                </el-button>
            </div>

            <!-- Alerte chargement Jira teams -->
            <el-alert v-if="teamError === 'no_teams_found'" type="info" :closable="false" style="margin:6px 0"
                title="Aucune équipe trouvée dans les issues Jira"
                description="Aucun ticket n'a de champ Team renseigné. Saisissez les noms manuellement." show-icon />
            <el-alert v-else-if="teamError" type="warning" :closable="false" style="margin:6px 0"
                title="Équipes Jira non chargées automatiquement"
                :description="`${teamError} — Saisissez les noms manuellement.`" show-icon />

            <!-- Sélection board réponse VW -->
            <div class="jts-board-selector">
                <span class="jts-label"><i class="el-icon-menu"></i> Board réponse (K-Iteration of Team) :</span>
                <el-select
                    v-model="contextBoardId"
                    placeholder="Choisir le board réponse"
                    filterable clearable
                    style="flex:1; min-width:0"
                    :loading="vwTeamsLoading"
                    @change="onContextBoardChange"
                >
                    <el-option
                        v-for="b in availableBoards"
                        :key="b._id"
                        :label="b.data && b.data.name ? b.data.name : b._id"
                        :value="b._id"
                    />
                </el-select>
            </div>

            <p class="jts-desc">
                Associe chaque équipe Jira à une équipe Visual World (champ <code>team</code> des objets K-Iteration of Team).
                <span v-if="!contextBoardId" style="color:#e6a23c"> Sélectionne d'abord le board réponse.</span>
                <span v-else-if="vwTeams.length === 0 && !vwTeamsLoading" style="color:#f56c6c">
                    Aucun objet avec champ <code>team</code> trouvé — vérifie que le bon board est sélectionné.
                </span>
            </p>

            <!-- Lignes de mapping -->
            <div v-for="(row, idx) in teamMapping" :key="idx" class="jts-row">
                <!-- Colonne Jira -->
                <el-select
                    v-if="jiraTeams.length"
                    v-model="row.jiraTeamId"
                    placeholder="Équipe Jira"
                    filterable
                    style="flex:1; min-width:0"
                    @change="(val) => onJiraTeamSelect(val, idx)"
                >
                    <el-option v-for="t in jiraTeams" :key="t.id" :label="t.name" :value="t.id" />
                </el-select>
                <el-input v-else v-model="row.jiraTeamName" placeholder="Nom équipe Jira" style="flex:1; min-width:0" />

                <i class="el-icon-arrow-right jts-arrow"></i>

                <!-- Colonne VW (values from context board) -->
                <el-select
                    v-model="row.vwTeamId"
                    placeholder="Équipe Visual World"
                    filterable clearable
                    style="width:220px"
                    :loading="vwTeamsLoading"
                    :disabled="!contextBoardId"
                    :class="testRowClass(row)"
                    @change="resetTestResult"
                >
                    <el-option v-for="t in vwTeams" :key="t.id" :label="t.name" :value="t.id" />
                </el-select>

                <!-- Icône résultat test -->
                <span v-if="testDone" class="jts-test-icon">
                    <i v-if="isTeamOk(row)" class="el-icon-circle-check" style="color:#67c23a" />
                    <i v-else class="el-icon-circle-close" style="color:#f56c6c" />
                </span>

                <el-button type="text" icon="el-icon-delete" style="color:#f56c6c;margin-left:2px" @click="removeTeamRow(idx)" />
            </div>

            <!-- Actions mapping -->
            <div class="jts-actions">
                <el-button size="mini" icon="el-icon-plus" @click="addTeamRow">Ajouter une équipe</el-button>
                <el-button size="mini" type="primary" icon="el-icon-check" :disabled="!teamMappingDirty" @click="saveTeamMapping">
                    Sauvegarder le mapping
                </el-button>
            </div>

            <!-- ═══════════════ TEST DE COHÉRENCE ═══════════════ -->
            <div class="jts-test-section">
                <div class="jts-header" style="margin-bottom:6px">
                    <span class="jts-title">
                        <i class="el-icon-warning-outline" style="color:#e6a23c"></i>
                        Test de cohérence
                    </span>
                    <el-button
                        size="mini"
                        :type="testDone && testHasErrors ? 'danger' : 'warning'"
                        icon="el-icon-search"
                        :loading="testLoading"
                        :disabled="!contextBoardId || teamMapping.length === 0"
                        @click="runTest"
                    >
                        Tester
                    </el-button>
                </div>
                <p class="jts-desc">Vérifie que les équipes du mapping existent bien dans les objets K-Iteration of Team du board réponse sélectionné.</p>

                <!-- Résultats -->
                <div v-if="testDone">
                    <el-alert v-if="!testHasErrors" type="success" :closable="false"
                        title="Mapping OK"
                        :description="`Toutes les équipes ont été trouvées dans les ${testObjectCount} objets du board.`"
                        show-icon />
                    <el-alert v-else type="error" :closable="false"
                        title="Incohérences détectées"
                        :description="`${testErrors.length} équipe(s) introuvable(s) dans les ${testObjectCount} objets du board.`"
                        show-icon />

                    <div class="jts-test-detail">
                        <div
                            v-for="row in testDetails"
                            :key="row.vwTeamId"
                            class="jts-test-row"
                            :class="row.found ? 'ok' : 'err'"
                        >
                            <i :class="row.found ? 'el-icon-circle-check' : 'el-icon-circle-close'" />
                            <span class="jts-jira-name">{{ row.jiraTeamName || row.jiraTeamId }}</span>
                            <i class="el-icon-arrow-right" style="color:#c0c4cc;margin:0 4px" />
                            <code>{{ row.vwTeamId }}</code>
                            <span class="jts-badge" :class="row.found ? 'ok' : 'err'">
                                {{ row.found ? 'OK' : 'MANQUANT' }}
                            </span>
                        </div>

                        <div class="jts-found-teams" v-if="testBoardTeamIds.length">
                            <span class="jts-found-label">Présents dans le board :</span>
                            <code v-for="id in testBoardTeamIds" :key="id" class="jts-found-id">{{ id }}</code>
                        </div>
                        <div v-else class="jts-found-teams">
                            <span style="font-size:11px;color:#f56c6c">Aucun champ <code>team</code> dans les objets du board.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import isEqual from "lodash.isequal";

export default {
    name: "JiraSync",
    inject: ["$view"],

    data() {
        return {
            key: [],
            validate: false,
            jira: { host: "", username: "", jiraApiToken: "" },

            // Mapping
            teamMapping: [],
            savedTeamMapping: [],

            // Board contexte VW + équipes issues de ce board
            contextBoardId: null,
            vwTeams: [],       // [{ id, name }] depuis data.team des objets du board
            vwTeamsLoading: false,

            // Test
            testLoading: false,
            testDone: false,
            testBoardTeamIds: [],
            testObjectCount: 0,

            rules: {
                host: [
                    { required: true, message: this.$t("jira.url_error"), trigger: "blur" },
                    { type: "url", message: this.$t("jira.wrong_url"), trigger: ["blur"] },
                ],
                username: [{ required: true, message: this.$t("jira.username_error"), trigger: "blur" }],
                jiraApiToken: [{ required: true, message: this.$t("jira.password_error"), trigger: "blur" }],
            },
        };
    },

    mounted() {
        if (this.settings.username && this.settings.host) {
            this.jira.host = this.settings.host;
            this.jira.username = this.settings.username;
        }
        if (this.boardJiraData) {
            this.key = this.boardJiraData.filter((i) => i.activatedProject).map((i) => i.key);
        }
        this.initTeamMapping();
    },

    computed: {
        isConnected() {
            return !!(this.settings?.host && this.settings?.username);
        },
        error() {
            return this.$store.getters["jiraUse/project/asError"];
        },
        errorDescription() {
            if (this.error) {
                const { message } = this.error[Object.keys(this.error)[0]];
                if (message) return message;
            }
            return undefined;
        },
        useLimit() {
            try {
                const maxUse = this.$store.getters["worldUse/byId"](this.$view.worldId).private.useMaxJiraProjects;
                const currentUse = this.$store.state.worldUse[this.$view.worldId].data.jiraProject;
                if (currentUse >= maxUse) return {
                    title: this.$t("jira_use_warning.title"),
                    description: this.$t("jira_use_warning.warn", { supportMail: this.supportMail }),
                };
                return null;
            } catch (e) { return null; }
        },
        supportMail() { return this.$store.state["connectionMe"].user.supportMail; },
        project() {
            if (this.error) return [];
            return this.$store.getters["jiraUse/project/asArray"] || [];
        },
        settings() {
            const { host, username } = this.$store.getters["boardAlive/byId"](this.$view.boardId).data.jira || {};
            return { host, username };
        },
        boardJiraData() {
            const { projects } = this.$store.getters["boardAlive/byId"](this.$view.boardId).data.jira || {};
            return projects || [];
        },
        jiraTeams() { return this.$store.getters["jiraUse/team/teams"] || []; },
        teamLoading() { return this.$store.getters["jiraUse/team/loading"]; },
        teamError() { return this.$store.getters["jiraUse/team/error"]; },
        teamMappingDirty() { return !isEqual(this.teamMapping, this.savedTeamMapping); },
        boardTeamMapping() {
            return this.$store.getters["boardAlive/byId"](this.$view.boardId).data.jira?.teamMapping || [];
        },
        availableBoards() {
            return this.$store.getters["boardAlive/asArray"] || [];
        },

        // Test
        testDetails() {
            return this.teamMapping
                .filter((r) => r.vwTeamId)
                .map((r) => ({
                    jiraTeamId: r.jiraTeamId,
                    jiraTeamName: r.jiraTeamName,
                    vwTeamId: r.vwTeamId,
                    found: this.testBoardTeamIds.includes(String(r.vwTeamId)),
                }));
        },
        testErrors() { return this.testDetails.filter((r) => !r.found); },
        testHasErrors() { return this.testDone && this.testErrors.length > 0; },
    },

    watch: {
        jira: {
            deep: true,
            handler() { this.$refs["jira"].validate((v) => (this.validate = v)); },
        },
        project(p) { this.updateBoardJiraProject(p); },
        boardTeamMapping: {
            immediate: false,
            handler(val) {
                if (val && !isEqual(val, this.savedTeamMapping)) {
                    this.savedTeamMapping = JSON.parse(JSON.stringify(val));
                    this.teamMapping = JSON.parse(JSON.stringify(val));
                }
            },
        },
        jiraTeams(teams) {
            this.teamMapping = this.teamMapping.map((row) => {
                if (row.jiraTeamId) {
                    const found = teams.find((t) => t.id === row.jiraTeamId);
                    if (found) row.jiraTeamName = found.name;
                }
                return row;
            });
        },
    },

    methods: {
        // ── Jira form ────────────────────────────────────────────────
        onSubmit() {
            if (this.validate) {
                this.$store.dispatch("boardAlive/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data: {
                        jiraApiToken: this.jira.jiraApiToken,
                        jira: { username: this.jira.username, host: this.jira.host.replace(/\/$/, "") },
                    },
                    reply: true,
                });
            }
        },
        updateBoardJiraProject(project) {
            const data = { jira: {} };
            data.jira["projects"] = project.map((item) => ({ ...item, activatedProject: this.key.includes(item.key) }));
            if (this.isConnected) {
                this.$store.dispatch("boardAlive/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data, reply: true,
                });
            }
        },
        resetForm() {
            this.jira = { host: "", username: "", jiraApiToken: "" };
            this.$store.dispatch("boardAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: { jira: null },
                reply: true,
            });
            this.key = [];
            this.teamMapping = [];
            this.savedTeamMapping = [];
            this.vwTeams = [];
            this.contextBoardId = null;
            this.$store.commit("jiraUse/project/reset");
            this.$store.commit("jiraUse/team/reset");
            this.resetTestResult();
        },
        doRefresh() { this.$store.dispatch("jiraUse/project/get", this.$view); },

        // ── Mapping ──────────────────────────────────────────────────
        initTeamMapping() {
            const saved = this.boardTeamMapping;
            this.savedTeamMapping = JSON.parse(JSON.stringify(saved));
            this.teamMapping = JSON.parse(JSON.stringify(saved));
        },
        loadJiraTeams() {
            this.$store.dispatch("jiraUse/team/get", { worldId: this.$view.worldId, boardId: this.$view.boardId });
        },
        addTeamRow() {
            this.teamMapping.push({ jiraTeamId: "", jiraTeamName: "", vwTeamId: "" });
        },
        removeTeamRow(idx) {
            this.teamMapping.splice(idx, 1);
            this.resetTestResult();
        },
        onJiraTeamSelect(teamId, idx) {
            const found = this.jiraTeams.find((t) => t.id === teamId);
            if (found) this.$set(this.teamMapping[idx], "jiraTeamName", found.name);
        },
        saveTeamMapping() {
            const mapping = this.teamMapping
                .filter((r) => (r.jiraTeamId || r.jiraTeamName) && r.vwTeamId)
                .map((r) => ({
                    jiraTeamId: r.jiraTeamId || "",
                    jiraTeamName: r.jiraTeamName || "",
                    vwTeamId: r.vwTeamId,
                }));
            this.$store.dispatch("boardAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: { jira: { teamMapping: mapping } },
                reply: true,
            });
            this.savedTeamMapping = JSON.parse(JSON.stringify(mapping));
            this.teamMapping = JSON.parse(JSON.stringify(mapping));
            this.$message({ type: "success", message: "Mapping équipes sauvegardé" });
        },

        // ── Board contexte VW ────────────────────────────────────────
        async onContextBoardChange(boardId) {
            this.resetTestResult();
            this.vwTeams = [];
            if (!boardId) return;
            this.vwTeamsLoading = true;
            try {
                const base = location.hostname === "localhost" ? "http://localhost:8080" : "http://87.106.255.115:8080";
                const res = await fetch(`${base}/api/jira-team-check?worldId=${this.$view.worldId}&boardId=${boardId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // Construire la liste { id, name } depuis les teamIds trouvés dans les objets
                this.vwTeams = (data.teamIds || []).map((id) => ({ id, name: id }));
            } catch (e) {
                this.$message({ type: "warning", message: `Impossible de charger les équipes du board : ${e.message}` });
            } finally {
                this.vwTeamsLoading = false;
            }
        },

        // ── Test de cohérence ────────────────────────────────────────
        resetTestResult() {
            this.testDone = false;
            this.testBoardTeamIds = [];
            this.testObjectCount = 0;
        },
        async runTest() {
            if (!this.contextBoardId) return;
            this.testLoading = true;
            this.resetTestResult();
            try {
                const base = location.hostname === "localhost" ? "http://localhost:8080" : "http://87.106.255.115:8080";
                const res = await fetch(`${base}/api/jira-team-check?worldId=${this.$view.worldId}&boardId=${this.contextBoardId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                this.testBoardTeamIds = data.teamIds || [];
                this.testObjectCount = data.objectCount || 0;
                this.testDone = true;
            } catch (e) {
                this.$message({ type: "error", message: `Erreur test : ${e.message}` });
            } finally {
                this.testLoading = false;
            }
        },
        isTeamOk(row) {
            if (!this.testDone || !row.vwTeamId) return false;
            return this.testBoardTeamIds.includes(String(row.vwTeamId));
        },
        testRowClass(row) {
            if (!this.testDone || !row.vwTeamId) return "";
            return this.isTeamOk(row) ? "test-ok" : "test-err";
        },
    },

    beforeDestroy() {
        if (this.boardJiraData && !isEqual(
            this.boardJiraData.filter((i) => i.activatedProject).map((i) => i.key),
            this.key
        )) {
            this.updateBoardJiraProject(this.boardJiraData);
        }
    },
};
</script>

<style scoped>
.jts { margin-top: 20px; border-top: 1px solid #e4e7ed; padding-top: 14px; }
.jts-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.jts-title { font-size: 13px; font-weight: 600; color: #303133; }
.jts-title i { margin-right: 5px; }
.jts-label { font-size: 12px; color: #606266; white-space: nowrap; margin-right: 8px; }
.jts-desc { font-size: 12px; color: #909399; margin: 6px 0 10px; }
.jts-board-selector { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.jts-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.jts-arrow { color: #909399; font-size: 14px; flex-shrink: 0; }
.jts-test-icon { font-size: 16px; flex-shrink: 0; }
.jts-actions { display: flex; gap: 8px; margin-top: 10px; }
.test-ok >>> .el-input__inner { border-color: #67c23a !important; }
.test-err >>> .el-input__inner { border-color: #f56c6c !important; }

.jts-test-section { margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e4e7ed; }
.jts-test-detail { margin-top: 8px; border: 1px solid #ebeef5; border-radius: 4px; padding: 8px 10px; background: #fafafa; }
.jts-test-row { display: flex; align-items: center; gap: 6px; padding: 4px 0; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
.jts-test-row:last-child { border-bottom: none; }
.jts-test-row.ok i { color: #67c23a; }
.jts-test-row.err i { color: #f56c6c; }
.jts-jira-name { flex: 1; color: #606266; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jts-badge { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 8px; flex-shrink: 0; }
.jts-badge.ok { background: #f0f9eb; color: #67c23a; }
.jts-badge.err { background: #fef0f0; color: #f56c6c; }
.jts-found-teams { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.jts-found-label { font-size: 11px; color: #909399; margin-right: 4px; }
.jts-found-id { background: #ecf5ff; color: #409eff; padding: 1px 6px; border-radius: 4px; font-size: 11px; }
</style>