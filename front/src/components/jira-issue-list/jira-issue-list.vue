<template>
    <div id="jira-issue-list">
        <div v-if="jiraAlert.length">
            <el-alert
                class="jira-issue-list-alert"
                v-for="error of jiraAlert"
                :key="error.message"
                :title="error.title"
                :description="error.message"
                :closable="false"
                :type="error.type"
                effect="dark"
            >
            </el-alert>
        </div>
        <el-form style="display: flex" @submit.prevent.native>
            <el-form-item style="flex: 1">
                <el-input
                    :placeholder="$t('jira.jql_format_placeholder')"
                    v-model="jqlWrap"
                />
            </el-form-item>

            <el-form-item>
                <el-button
                    id="jql-button"
                    type="success"
                    @click="onSubmit($event)"
                    >JQL</el-button
                >
            </el-form-item>
        </el-form>
        <el-table
            ref="multipleTable"
            :data="issue"
            style="width: 100%"
            height="calc(100vh - 280px)"
            :row-class-name="tableRowClassName"
            @selection-change="handleSelectionChange"
        >
            <el-table-column
                type="selection"
                width="55"
                :selectable="doSelectIssue"
            />
            <el-table-column label="id" property="id" width="80" />
            <el-table-column label="key" property="key" width="100" />
            <el-table-column
                property="issuetype.label"
                label="issuetype"
                width="90"
            />
            <el-table-column
                property="status.label"
                label="Status"
                width="90"
            />
            <el-table-column label="Date" width="120">
                <template slot-scope="scope">{{ scope.row.created }}</template>
            </el-table-column>
            <el-table-column
                property="priority.label"
                label="Priority"
                width="90"
            />
            <el-table-column
                property="storyPoint"
                label="StoryPoint"
                width="90"
            />
            <el-table-column
                property="summary"
                label="Summary"
                show-overflow-tooltip
            />
        </el-table>

        <!-- Barre de progression de l'import -->
        <div v-if="importing" style="margin: 10px 0">
            <el-progress
                :percentage="Math.round((currentStep / totalSteps) * 100)"
                :status="importPhase === 'error' ? 'exception' : 'success'"
                :stroke-width="20"
            ></el-progress>
        </div>

        <div id="issue-pagination">
            <el-pagination
                @current-change="currentChange"
                background
                :page-size="50"
                layout="prev, pager, next"
                :total="totalIssue"
            >
            </el-pagination>
            <div>
                <el-button
                    type="success"
                    @click="doCreateObject"
                    :loading="importing"
                    :disabled="importing || positioning"
                >
                    <span v-if="!importing">Importer</span>
                    <span v-else>{{ importStatus }}</span>
                </el-button>
                <el-button
                    @click="doClearSelection"
                    :disabled="importing || positioning"
                >
                    Effacer la sélection
                </el-button>
                <el-button
                    type="primary"
                    @click="doAutoPosition"
                    :loading="positioning"
                    :disabled="positioning || importing"
                    icon="el-icon-sort"
                >
                    <span v-if="!positioning">Organiser automatiquement</span>
                    <span v-else
                        >Organisation en cours...
                        {{ positioningPercent }}%</span
                    >
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
import app from "../../conf/app";
export default {
    name: "JiraIssueList",
    props: {
        worldId: String,
        boardId: String,
    },
    inject: ["$view"],
    data() {
        return {
            jqlWrap: "",
            startAt: 0,
            page: 1,
            issueList: [],
            multipleSelection: [],
            importing: false,
            importedCount: 0,
            importStatus: "",
            importPhase: "objects", // 'objects', 'parent-links', 'dependency-links', 'done'
            totalSteps: 0,
            currentStep: 0,
            positioning: false,
            positioningPercent: 0,
            positioningInterval: null,
        };
    },

    created() {
        const key = this.projects
            .filter((item) => item.activatedProject)
            .map((item) => item.key);
        // Only set JQL if there are activated projects
        if (key.length > 0) {
            this.jqlWrap = `project in (${key.join(",")})`;
            this.onSubmit();
        } else {
            // Default JQL: show all projects the user has access to
            this.jqlWrap = "order by created DESC";
        }
    },
    beforeDestroy() {
        // Nettoyer l'interval de polling si le composant est détruit
        if (this.positioningInterval) {
            clearInterval(this.positioningInterval);
        }
    },
    computed: {
        error() {
            return this.$store.getters["jiraUse/issue/asError"];
        },

        jiraAlert() {
            const alert = [];
            if (!this.error) {
                return alert;
            } else if (this.error["message"]) {
                alert.push({
                    title: this.$t("jira.api_error"),
                    message: this.error["message"],
                    type: "error",
                });
            } else if (this.error["errorMessages"]) {
                alert.push(
                    ...this.error["errorMessages"].map((message) => ({
                        message,
                        type: "error",
                    }))
                );
            } else if (this.error["warningMessages"]) {
                alert.push(
                    ...this.error["warningMessages"].map((message) => ({
                        message,
                        type: "warning",
                    }))
                );
            }
            return alert;
        },

        objectJiraKey() {
            const object = this.$store.getters["object/asArray"] || [];
            return object
                .filter(
                    (x) =>
                        x.data.jiraIssueBoardId == this.boardId &&
                        x.data.jira_key
                )
                .map((x) => x.data.jira_key);
        },

        jiraIssueLink() {
            const jira = this.$store.getters["boardAlive/byId"](this.boardId)
                .data.jira;
            return jira && jira.host + "/browse/";
        },
        issue() {
            const issue = this.$store.getters["jiraUse/issue/asArray"] || [];

            console.log("[JIRA ISSUE LIST] Computing issues:", {
                issueCount: issue.length,
                firstIssue: issue[0]
                    ? {
                          hasKey: !!issue[0].key,
                          key: issue[0].key,
                          hasFields: !!issue[0].fields,
                          hasCreated: !!issue[0].fields?.created,
                          allKeys: Object.keys(issue[0]),
                      }
                    : null,
            });

            return !this.error
                ? issue.map((item, index) => {
                      if (!item.key) {
                          console.error(
                              `[JIRA ISSUE LIST] Item ${index} missing key:`,
                              item
                          );
                      }
                      if (!item.fields?.created) {
                          console.error(
                              `[JIRA ISSUE LIST] Item ${index} missing fields.created:`,
                              item
                          );
                      }

                      const projectData = this.projects
                          .filter(
                              (project) =>
                                  project.key === item.key?.split("-")[0]
                          )
                          .map((item) => {
                              console.log(
                                  "[JIRA SYNC] Project customFieldKey:",
                                  item.customFieldKey
                              );
                              return {
                                  projectId: item.id,
                                  storyPoint: item.customFieldKey.storyPoint,
                                  epicName: item.customFieldKey.epicName,
                                  // Utiliser customfield_10001 directement si team n'est pas dans customFieldKey
                                  teamFieldKey:
                                      item.customFieldKey.team ||
                                      "customfield_10001",
                              };
                          })[0];

                      const { projectId, storyPoint, epicName, teamFieldKey } =
                          projectData || {};

                      const issuelinks = item.fields?.issuelinks || [];

                      // Extraire tous les liens (outward et inward)
                      const allLinks = [];
                      issuelinks.forEach((link) => {
                          if (link.outwardIssue) {
                              allLinks.push({
                                  type: link.type?.name || "N/A",
                                  direction: "outward",
                                  linkedIssueKey: link.outwardIssue.key,
                              });
                          }
                          if (link.inwardIssue) {
                              allLinks.push({
                                  type: link.type?.name || "N/A",
                                  direction: "inward",
                                  linkedIssueKey: link.inwardIssue.key,
                              });
                          }
                      });

                      // Récupérer le team depuis Jira
                      const jiraTeam = item.fields?.[teamFieldKey];
                      const jiraTeamName =
                          jiraTeam?.name?.toLowerCase() || null;

                      console.log(
                          "[JIRA SYNC] Team extraction for",
                          item.key,
                          ":",
                          {
                              teamFieldKey: teamFieldKey,
                              jiraTeam: jiraTeam,
                              jiraTeamName: jiraTeamName,
                          }
                      );

                      // Convertir timeoriginalestimate (en secondes) en jours
                      const timeOriginalEstimateSeconds =
                          item.fields?.timeoriginalestimate || 0;
                      const timeOriginalEstimateDays =
                          timeOriginalEstimateSeconds > 0
                              ? timeOriginalEstimateSeconds / (8 * 3600) // 8 heures par jour
                              : 0;

                      return {
                          projectId,
                          id: item.id,
                          key: item.key,
                          created: item.fields?.created?.split("T")[0] || "N/A",
                          issuetype: {
                              value: item.fields?.issuetype?.id || "",
                              label: item.fields?.issuetype?.name || "N/A",
                          },
                          priority: {
                              value: item.fields?.priority?.id || "",
                              label: item.fields?.priority?.name || "N/A",
                          },
                          status: {
                              value: item.fields?.status?.id || "",
                              label: item.fields?.status?.name || "N/A",
                          },
                          summary: item.fields?.summary || "",
                          storyPoint: item.fields?.[storyPoint],
                          epicName: item.fields?.[epicName],
                          description: item.fields?.description,
                          dueDate: item.fields?.duedate || null,
                          teamName: jiraTeamName,
                          timeOriginalEstimate: timeOriginalEstimateDays,
                          parentKey:
                              item.fields?.parent && item.fields.parent.key,
                          issuelinks: allLinks,
                      };
                  })
                : [];
        },
        projects() {
            const { projects } =
                this.$store.getters["boardAlive/byId"](this.boardId).data
                    .jira || {};
            return projects || [];
        },
        maxResults() {
            const issue = this.$store.getters["jiraUse/issue/asArray"] || [];
            const [maxResults] = issue.map((item) => item.maxResults);
            return maxResults;
        },
        totalIssue() {
            const issue = this.$store.getters["jiraUse/issue/asArray"] || [];
            const [total] = issue.map((item) => item.total);
            return total;
        },

        jql: {
            get() {
                return this.jqlWrap;
            },
            set(jql) {
                this.jqlWrap = jql;
            },
        },
    },

    methods: {
        // Mapper les noms de teams Jira vers les IDs VisualWorld
        mapJiraTeamToVWId(jiraTeamName) {
            const teamMapping = {
                "team a": "1",
                "team B": "2",
                "team c": "3",
                "team d": "4",
                "team e": "5",
                "team f": "6",
            };

            return teamMapping[jiraTeamName] || "2"; // Default: team 5
        },

        doSelectIssue(row) {
            if (this.objectJiraKey.includes(row.key)) return 0;
            else return 1;
        },
        tableRowClassName({ row }) {
            if (this.objectJiraKey.includes(row.key)) {
                return "disabled-row";
            }
        },
        currentChange(value) {
            this.page = value;
            this.onSubmit();
        },
        onSubmit() {
            this.$store.dispatch("jiraUse/issue/get", {
                boardId: this.boardId,
                worldId: this.worldId,
                jql: {
                    jql: this.jqlWrap,
                    startAt:
                        this.startAt + ((this.page - 1) * this.maxResults || 0),
                },
            });
        },
        doCreateObject() {
            if (
                !this.$store.getters[`connectionMe/isGrantedForOne`](
                    [
                        "position-alive/create-front",
                        "position-alive/create-back",
                    ],
                    this.$view
                )
            ) {
                return;
            }

            // Activer le mode import avec tracking complet
            this.importing = true;
            this.importedCount = 0;
            this.importPhase = "objects";
            this.totalSteps = this.multipleSelection.length * 3; // objets + liens parents + liens dépendances
            this.currentStep = 0;
            this.updateImportStatus();
            // Dimensions des composants K
            const K_FEATURE_WIDTH = 220;
            const K_FEATURE_HEIGHT = 300;
            const K_WORK_ITEM_WIDTH = 310;
            const K_WORK_ITEM_HEIGHT = 300;

            // Utiliser une largeur moyenne pour le calcul du scale
            const AVG_WIDTH = (K_FEATURE_WIDTH + K_WORK_ITEM_WIDTH) / 2;
            const scale =
                app.board.size.width / 2 -
                (AVG_WIDTH * this.multipleSelection.length) / 2;

            // Stocker les infos Jira temporairement pour créer les liens
            const jiraMetadata = [];

            const totalItems = this.multipleSelection.length;
            const data = this.multipleSelection.map((item, i) => {
                // Mise à jour du compteur pour chaque item traité
                this.importedCount = i + 1;
                this.currentStep = i + 1;
                this.updateImportStatus();
                // Déterminer le componentId en fonction du type d'issue Jira
                const issueTypeName = item.issuetype.label.toLowerCase();

                // LOGIQUE SIMPLE : Epic = K-Feature, tout le reste = K-Work Item
                const isEpic =
                    issueTypeName === "epic" || issueTypeName.includes("epic");
                const componentId = isEpic
                    ? "681bccf2fe6d770bea41690d" // K - Feature
                    : "681bd1c4fe6d77d26c416b9a"; // K - Work Item

                // Dimensions en fonction du type
                const objectWidth = isEpic
                    ? K_FEATURE_WIDTH
                    : K_WORK_ITEM_WIDTH;
                const objectHeight = isEpic
                    ? K_FEATURE_HEIGHT
                    : K_WORK_ITEM_HEIGHT;

                console.log("[JIRA SYNC] Creating object:", {
                    type: issueTypeName,
                    issueTypeLabel: item.issuetype.label,
                    isEpic: isEpic,
                    componentId: componentId,
                    componentName: isEpic ? "K - Feature" : "K - Work Item",
                    summary: item.summary,
                    key: item.key,
                    parentKey: item.parentKey,
                });

                // Stocker les métadonnées Jira pour créer les liens plus tard
                jiraMetadata.push({
                    jira_key: item.key,
                    jira_id: item.id,
                    jira_parent_key: item.parentKey,
                    jira_issuelinks: item.issuelinks || [],
                });

                let objectData = {};

                if (isEpic) {
                    // K - Feature pour les Epics
                    // Mapper la priorité Jira vers les valeurs K-Feature (1=Highest, 2=High, 3=Medium, 4=Low, 5=Lowest)
                    const priorityMap = {
                        1: "1", // Highest
                        2: "2", // High
                        3: "3", // Medium
                        4: "4", // Low
                        5: "5", // Lowest
                    };
                    const mappedPriority =
                        priorityMap[item.priority.value] || "4"; // Default: Low

                    // Convertir la date Jira (YYYY-MM-DD) en format ISO pour K-Feature
                    let dueDate = null;
                    if (item.dueDate) {
                        try {
                            dueDate = new Date(item.dueDate).toISOString();
                        } catch (e) {
                            console.warn(
                                "[JIRA SYNC] Invalid due date:",
                                item.dueDate
                            );
                        }
                    }

                    objectData = {
                        name: `${item.summary || "Sans titre"} (${item.key})`,
                        priority: mappedPriority,
                        due_date: dueDate,
                    };
                } else {
                    // K - Work Item pour TOUT LE RESTE (Task, Story, Bug, Subtask, etc.)

                    // Convertir la date Jira en format ISO pour start_date_test
                    let startDate = null;
                    if (item.dueDate) {
                        try {
                            startDate = new Date(item.dueDate).toISOString();
                        } catch (e) {
                            console.warn(
                                "[JIRA SYNC] Invalid due date:",
                                item.dueDate
                            );
                        }
                    }

                    // Calculer FTE = Load ÷ Duration
                    const load = item.storyPoint || 0;
                    const duration = item.timeOriginalEstimate || 0;
                    const fte = duration > 0 && load > 0 ? load / duration : 1;

                    // Mapper le team Jira vers l'ID VisualWorld
                    const teamId = this.mapJiraTeamToVWId(item.teamName);

                    console.log(
                        "[JIRA SYNC] Work Item data for",
                        item.key,
                        ":",
                        {
                            load: load,
                            duration: duration,
                            fte: fte,
                            jiraTeamName: item.teamName,
                            mappedTeamId: teamId,
                        }
                    );

                    objectData = {
                        name: `${item.summary || "Sans titre"} (${item.key})`,
                        job: teamId, // job = team
                        load: load,
                        fte: fte,
                        phase: "2", // 2 = développement
                        bvalue: 0,
                        team: teamId,
                        due_iteration: null,
                        iteration: null,
                        start_date_test: startDate,
                    };
                }

                console.log("[JIRA SYNC] Object data prepared:", {
                    issueTypeName,
                    componentId,
                    isEpic,
                    hasName: !!objectData.name,
                    objectDataKeys: Object.keys(objectData),
                });

                return {
                    componentId: componentId,
                    object: {
                        data: objectData,
                        protect: {}, // Protection vide = tous les champs sont modifiables
                    },
                    data: {
                        width: objectWidth,
                        height: objectHeight,
                        top: 100,
                        left: scale + AVG_WIDTH * i,
                        zIndex:
                            this.$store.getters[`positionAlive/zIndexMax`] + i,
                    },
                };
            });

            // Créer les objets
            console.log(
                "[JIRA SYNC] About to dispatch positionAlive/create with",
                data.length,
                "objects"
            );
            console.log("[JIRA SYNC] Metadata prepared:", jiraMetadata);

            this.$store
                .dispatch(`positionAlive/create`, {
                    worldId: this.worldId,
                    boardId: this.boardId,
                    data,
                    isBackground:
                        this.$store.getters[
                            `app/objectsInBoard/activeLayerIsBackground`
                        ],
                })
                .then((result) => {
                    console.log(
                        "[JIRA SYNC] ✅ Objects created successfully, result:",
                        result
                    );
                    console.log(
                        "[JIRA SYNC] Metadata for links:",
                        jiraMetadata
                    );

                    // Phase 1 terminée : objets créés
                    this.importPhase = "waiting";
                    this.importStatus = "Attente du chargement des objets...";

                    // Attendre que les objets soient créés et ajoutés au store, puis créer les liens
                    setTimeout(() => {
                        console.log(
                            "[JIRA SYNC] ⏰ Starting link creation after delay..."
                        );

                        // Phase 2 : Création des liens parents
                        this.importPhase = "parent-links";
                        this.createParentLinks(jiraMetadata, result);

                        // Phase 3 : Création des liens de dépendances (après les liens parents)
                        setTimeout(() => {
                            this.importPhase = "dependency-links";
                            this.createDependencyLinks(jiraMetadata, result);

                            // Phase 4 : Terminé - Attendre 22 secondes pour être sûr que tout est bien créé
                            setTimeout(() => {
                                this.importing = false;
                                this.importPhase = "done";

                                this.$message({
                                    type: "success",
                                    message: `✅ Import terminé : ${totalItems} items + tous les liens créés !`,
                                    duration: 3000,
                                });
                            }, 22000); // 22 secondes pour laisser le temps à tous les liens d'être créés
                        }, 1500);
                    }, 5000); // 5 secondes pour le chargement des objets dans le store
                })
                .catch((error) => {
                    console.error(
                        "[JIRA SYNC] ❌ Error creating objects:",
                        error
                    );
                    this.importing = false;
                    this.importPhase = "error";
                    this.$message({
                        type: "error",
                        message: `Erreur lors de l'import: ${error.message}`,
                        duration: 5000,
                    });
                });
        },
        createParentLinks(jiraMetadata, createdPositions) {
            console.log("[JIRA SYNC] Creating parent links with metadata:", {
                metadataCount: jiraMetadata.length,
            });

            // Construire un map des jira_key vers objectId depuis TOUS les objets du board
            const jiraKeyToObjectId = {};
            const allObjects = this.$store.getters["object/asArray"] || [];

            console.log(
                "[JIRA SYNC] Total objects in store:",
                allObjects.length
            );

            allObjects.forEach((obj) => {
                const objName = obj.data?.name;
                if (objName) {
                    // Extraire la clé Jira du nom au format "Nom (JIRA-KEY)"
                    const match = objName.match(/\(([A-Z]+-\d+)\)$/);
                    if (match) {
                        const jiraKey = match[1];
                        jiraKeyToObjectId[jiraKey] = obj._id;
                        console.log(
                            "[JIRA SYNC] Found object:",
                            jiraKey,
                            "→",
                            obj._id
                        );
                    }
                }
            });

            console.log(
                "[JIRA SYNC] Final jiraKeyToObjectId map:",
                jiraKeyToObjectId
            );

            // Compteurs pour les statistiques
            let parentLinksCreated = 0;
            let parentLinksSkipped = 0;

            // Créer les liens pour les items qui ont un parent
            jiraMetadata.forEach((metadata, index) => {
                // Mise à jour de la progression
                this.currentStep = this.multipleSelection.length + index + 1;
                this.updateImportStatus();

                const childKey = metadata.jira_key;
                const parentKey = metadata.jira_parent_key;

                if (!parentKey) {
                    return; // Pas de parent, on passe
                }

                if (!jiraKeyToObjectId[childKey]) {
                    console.warn(
                        "[JIRA SYNC] Child object not found for parent link:",
                        childKey
                    );
                    parentLinksSkipped++;
                    return;
                }

                if (!jiraKeyToObjectId[parentKey]) {
                    console.warn(
                        "[JIRA SYNC] Parent object not found for link:",
                        parentKey,
                        "(child:",
                        childKey,
                        ")"
                    );
                    parentLinksSkipped++;
                    return;
                }

                const childObjectId = jiraKeyToObjectId[childKey];
                const parentObjectId = jiraKeyToObjectId[parentKey];

                console.log("[JIRA SYNC] ✅ Creating parent link:", {
                    child: childKey,
                    parent: parentKey,
                    childObjectId,
                    parentObjectId,
                });

                // Créer le lien parent (flèche du parent vers l'enfant)
                this.$store.dispatch("linkAlive/create", {
                    worldId: this.worldId,
                    boardId: this.boardId,
                    data: {
                        color: "rgba(152, 152, 162, 1)",
                        curve: 0,
                        dash: 0,
                        size: 2,
                        title: "Parent",
                    },
                    object: [
                        {
                            objectId: parentObjectId,
                            data: {
                                arrowhead: 1, // Flèche du côté du parent
                                type: "none",
                            },
                        },
                        {
                            objectId: childObjectId,
                            data: {
                                arrowhead: 0, // Pas de flèche du côté de l'enfant
                                type: "none",
                            },
                        },
                    ],
                    linkModelId: "56575f706172656e74303030", // Parent link model ID
                });

                parentLinksCreated++;
            });

            console.log(
                `[JIRA SYNC] 📊 Parent links summary: ${parentLinksCreated} created, ${parentLinksSkipped} skipped`
            );
        },
        createDependencyLinks(jiraMetadata, createdPositions) {
            console.log("[JIRA SYNC] Creating dependency links");

            // Construire un map des jira_key vers objectId depuis TOUS les objets du board
            const jiraKeyToObjectId = {};
            const allObjects = this.$store.getters["object/asArray"] || [];

            allObjects.forEach((obj) => {
                const objName = obj.data?.name;
                if (objName) {
                    // Extraire la clé Jira du nom au format "Nom (JIRA-KEY)"
                    const match = objName.match(/\(([A-Z]+-\d+)\)$/);
                    if (match) {
                        const jiraKey = match[1];
                        jiraKeyToObjectId[jiraKey] = obj._id;
                    }
                }
            });

            console.log("[JIRA SYNC] Dependency links map:", jiraKeyToObjectId);

            // Compteurs et tracking des liens créés
            let dependencyLinksCreated = 0;
            let dependencyLinksSkipped = 0;
            const createdLinks = new Set(); // Pour éviter les doublons

            // Créer les liens de dépendance
            jiraMetadata.forEach((metadata, index) => {
                // Mise à jour de la progression pour les liens de dépendances
                this.currentStep =
                    this.multipleSelection.length * 2 + index + 1;
                this.updateImportStatus();

                const sourceKey = metadata.jira_key;
                const sourceObjectId = jiraKeyToObjectId[sourceKey];

                if (!sourceObjectId) {
                    console.warn(
                        "[JIRA SYNC] Source object not found:",
                        sourceKey
                    );
                    return;
                }

                // Parcourir tous les liens de cet item
                (metadata.jira_issuelinks || []).forEach((link) => {
                    const targetKey = link.linkedIssueKey;
                    const targetObjectId = jiraKeyToObjectId[targetKey];

                    if (!targetObjectId) {
                        console.warn(
                            "[JIRA SYNC] Target not found for dependency link:",
                            targetKey,
                            "(from:",
                            sourceKey,
                            ")"
                        );
                        dependencyLinksSkipped++;
                        return;
                    }

                    // Créer une clé unique pour éviter les doublons (lien bidirectionnel)
                    const linkKey = [sourceObjectId, targetObjectId]
                        .sort()
                        .join("-");
                    if (createdLinks.has(linkKey)) {
                        console.log(
                            "[JIRA SYNC] ⏭️  Skipping duplicate link:",
                            sourceKey,
                            "↔",
                            targetKey
                        );
                        dependencyLinksSkipped++;
                        return;
                    }

                    console.log("[JIRA SYNC] ✅ Creating dependency link:", {
                        type: link.type,
                        direction: link.direction,
                        from: sourceKey,
                        to: targetKey,
                    });

                    createdLinks.add(linkKey);

                    // Déterminer la couleur et le style selon le type de lien
                    let linkColor = "rgba(255, 149, 0, 1)"; // Orange par défaut
                    let linkDash = 0; // Ligne continue par défaut

                    if (link.type.toLowerCase().includes("block")) {
                        linkColor = "rgba(226, 1, 1, 1)"; // Rouge pour les blocages
                        linkDash = 1; // Ligne pointillée
                    } else if (link.type.toLowerCase().includes("relate")) {
                        linkColor = "rgba(152, 152, 162, 1)"; // Gris pour les relations
                    }

                    // Créer le lien de dépendance
                    // Pour "blocks": source bloque target, donc flèche de source vers target
                    // Pour "is blocked by": target bloque source, donc flèche de target vers source
                    const isOutward = link.direction === "outward";

                    this.$store.dispatch("linkAlive/create", {
                        worldId: this.worldId,
                        boardId: this.boardId,
                        data: {
                            color: linkColor,
                            curve: 0,
                            dash: linkDash,
                            size: 2,
                            title: link.type,
                        },
                        object: [
                            {
                                objectId: sourceObjectId,
                                data: {
                                    arrowhead: isOutward ? 1 : 0,
                                    type: "none",
                                },
                            },
                            {
                                objectId: targetObjectId,
                                data: {
                                    arrowhead: isOutward ? 0 : 1,
                                    type: "none",
                                },
                            },
                        ],
                        linkModelId: "56575f6c696e6b5f64656661756c74", // Default link model ID
                    });

                    dependencyLinksCreated++;
                });
            });

            console.log(
                `[JIRA SYNC] 📊 Dependency links summary: ${dependencyLinksCreated} created, ${dependencyLinksSkipped} skipped`
            );
        },
        async doAutoPosition() {
            try {
                // Lancer l'organisation automatique
                this.positioning = true;
                this.positioningPercent = 0;

                console.log(
                    "[JIRA AUTO POSITION] 🚀 Lancement de l'organisation automatique Jira..."
                );

                const response = await fetch("/api/jira/execute-positioning", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || "Échec du lancement");
                }

                this.$message({
                    type: "info",
                    message: "🎯 Organisation Jira lancée...",
                    duration: 2000,
                });

                // Polling pour suivre la progression
                this.positioningInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch(
                            "/api/jira/positioning-status"
                        );
                        const status = await statusResponse.json();

                        this.positioningPercent = status.percent || 0;

                        console.log("[AUTO POSITION] 📊 Status:", status);

                        if (status.done) {
                            clearInterval(this.positioningInterval);
                            this.positioning = false;

                            if (status.success) {
                                this.$message({
                                    type: "success",
                                    message:
                                        "✅ Organisation automatique terminée avec succès !",
                                    duration: 3000,
                                });

                                // Recharger la board pour voir les changements
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1500);
                            } else {
                                this.$message({
                                    type: "error",
                                    message:
                                        "❌ Erreur lors de l'organisation automatique",
                                    duration: 5000,
                                });
                            }
                        }
                    } catch (statusError) {
                        console.error(
                            "[AUTO POSITION] Erreur lors de la vérification du status:",
                            statusError
                        );
                    }
                }, 2000); // Vérifier toutes les 2 secondes
            } catch (error) {
                console.error("[AUTO POSITION] ❌ Erreur:", error);
                this.positioning = false;
                this.$message({
                    type: "error",
                    message: `Erreur: ${error.message}`,
                    duration: 5000,
                });
            }
        },
        updateImportStatus() {
            const percent = Math.round(
                (this.currentStep / this.totalSteps) * 100
            );

            switch (this.importPhase) {
                case "objects":
                    this.importStatus = `Création des objets... ${this.importedCount}/${this.multipleSelection.length} (${percent}%)`;
                    break;
                case "waiting":
                    this.importStatus = `Chargement des objets... (${percent}%)`;
                    break;
                case "parent-links":
                    this.importStatus = `Création des liens parents... (${percent}%)`;
                    break;
                case "dependency-links":
                    this.importStatus = `Création des liens de dépendances... (${percent}%)`;
                    break;
                case "done":
                    this.importStatus = `Import terminé ! ✅`;
                    break;
                case "error":
                    this.importStatus = `Erreur lors de l'import ❌`;
                    break;
                default:
                    this.importStatus = `Import en cours... (${percent}%)`;
            }
        },
        doClearSelection() {
            this.$refs.multipleTable.clearSelection();
        },
        handleSelectionChange(value) {
            this.multipleSelection = value;
        },
    },
};
</script>

<style scoped>
#jira-issue-list {
    padding: 10px;
}
#jira-issue-list >>> .disabled-row {
    opacity: 0.5;
}
.jira-issue-list-alert {
    margin: 10px 0;
}
#jql-button {
    height: 40px;
    margin-left: 10px;
}
#issue-pagination {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
}
</style>
