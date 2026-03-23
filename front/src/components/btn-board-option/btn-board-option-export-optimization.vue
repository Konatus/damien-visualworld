<script>
const CELL_MAX_LENGTH = 32765;
import mapValues from "lodash.mapvalues";

export default {
    name: "BtnBoardOptionExportOptimization",
    inject: ["$view"],
    data() {
        return {
            btnBoardOptionExportOptimization_XLSX: null,
            btnBoardOptionExportOptimization_isProcessing: false,
            btnBoardOptionExportOptimization_isRecalculating: false,
        };
    },
    computed: {
        btnBoardOptionExportOptimization_boardIo() {
            const items =
                this.$store.getters["boardIoGet/byId"](this.$view.boardId) ||
                {};
            return items.format === "optimization" ? items : undefined;
        },
    },
    watch: {
        btnBoardOptionExportOptimization_boardIo() {
            this.btnBoardOptionExportOptimization_ready();
        },
        btnBoardOptionExportOptimization_XLSX() {
            this.btnBoardOptionExportOptimization_ready();
        },
    },
    methods: {
        // Ask for the full data & async load of the XLSX library
        async btnBoardOptionExportOptimization_do() {
            console.log("🔵 Export pour optimisation déclenché");
            if (this.btnBoardOptionExportOptimization_isProcessing) {
                console.log("⏸️ Déjà en cours de traitement, annulation");
                return; // Éviter les doubles clics
            }
            // Ne pas mettre isProcessing à true ici - on attendra la réception des données

            this.$store.dispatch("boardIoGet/get", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                format: "optimization",
            });
            if (!this.btnBoardOptionExportOptimization_XLSX) {
                this.btnBoardOptionExportOptimization_XLSX = await import(
                    "xlsx"
                );
            }
        },

        // The full data have been received,
        async btnBoardOptionExportOptimization_ready() {
            console.log("🔍 btnBoardOptionExportOptimization_ready appelé");
            console.log(
                "  - btnBoardOptionExportOptimization_boardIo:",
                !!this.btnBoardOptionExportOptimization_boardIo
            );
            console.log(
                "  - btnBoardOptionExportOptimization_XLSX:",
                !!this.btnBoardOptionExportOptimization_XLSX
            );
            console.log(
                "  - isProcessing:",
                this.btnBoardOptionExportOptimization_isProcessing
            );

            // Si pas de données mais qu'on attend encore, ne rien faire
            if (!this.btnBoardOptionExportOptimization_boardIo) {
                console.log("⏳ En attente des données...");
                return;
            }

            // Si pas de librairie XLSX, ne rien faire
            if (!this.btnBoardOptionExportOptimization_XLSX) {
                console.log("⏳ En attente de la librairie XLSX...");
                return;
            }

            // Si on est déjà en train de traiter, ne rien faire
            if (this.btnBoardOptionExportOptimization_isProcessing) {
                console.log("⏸️ Déjà en cours de traitement, arrêt");
                return;
            }

            // Marquer qu'on commence le traitement
            this.btnBoardOptionExportOptimization_isProcessing = true;
            console.log("✅ Démarrage du traitement");

            try {
                // Set objects and links to the xlsx-export-library's format
                const { objects, links } =
                    this.btnBoardOptionExportOptimization_boardIo.data.VW;

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
                            [this.$t("xlsx_export.headings.height")]:
                                Math.round(item.position.data.height),
                            [this.$t("xlsx_export.headings.zIndex")]:
                                Math.round(item.position.data.zIndex),
                            [this.$t("xlsx_export.headings.rotation")]:
                                Math.round(item.position.data.rotation) || 0,
                            [this.$t("xlsx_export.headings.layer")]: this.$t(
                                `xlsx_export.placeholders.` +
                                    (item.position.protect.isBackground
                                        ? "background"
                                        : "foreground")
                            ),
                            [this.$t(
                                "xlsx_export.headings.styleBackgroundColor"
                            )]: item.object?.protect?.styleBackgroundColor,
                            [this.$t("xlsx_export.headings.styleOutlineColor")]:
                                item.object?.protect?.styleOutlineColor,
                            [this.$t("xlsx_export.headings.styleColor")]:
                                item.object?.protect?.styleColor,
                        },
                        mapValues(item.object.data, (property) => {
                            if (!property) {
                                return "null";
                            }
                            if (property?.[0]?.fileName) {
                                return property?.[0]?.fileName;
                            }
                            if (property.length > CELL_MAX_LENGTH) {
                                return property.slice(0, CELL_MAX_LENGTH);
                            }
                            return property;
                        })
                    )
                );

                const formattedLinks = links.map((item) => ({
                    [this.$t("xlsx_export.headings.linkOrigin")]:
                        2 +
                        objects.findIndex(
                            (object) =>
                                object.objectId &&
                                object.objectId ==
                                    item.objects[item.objects[0].data.arrowhead]
                                        .objectId
                        ),
                    [this.$t("xlsx_export.headings.linkEnd")]:
                        2 +
                        objects.findIndex(
                            (object) =>
                                object.objectId &&
                                object.objectId ==
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

                // Récupérer les capacités des équipes depuis l'API
                console.log("📊 Récupération des capacités des équipes...");
                let capacityData = [];
                try {
                    const baseUrl =
                        location.hostname === "localhost"
                            ? "http://localhost:8080"
                            : "http://213.165.95.153:8080";
                    const capacityUrl = `${baseUrl}/api/get-team-capacity`;
                    console.log("🔗 URL appelée:", capacityUrl);

                    const capacityResponse = await fetch(capacityUrl);
                    console.log(
                        "📥 Réponse:",
                        capacityResponse.status,
                        capacityResponse.statusText
                    );

                    if (capacityResponse.ok) {
                        const capacityResult = await capacityResponse.json();
                        console.log(
                            "📦 Données brutes reçues:",
                            JSON.stringify(capacityResult)
                        );

                        // Utiliser les données journalières si disponibles, sinon utiliser les équipes
                        if (
                            capacityResult.daily &&
                            capacityResult.daily.length > 0
                        ) {
                            capacityData = capacityResult.daily.map((item) => ({
                                date: item.date,
                                team_id: item.team_id,
                                total_capacity: item.total_capacity,
                                max_load: item.max_load,
                            }));
                            console.log(
                                "✅ Données journalières formatées:",
                                capacityData.length,
                                "lignes"
                            );
                        } else {
                            capacityData = capacityResult.teams.map((team) => ({
                                "ID Team": team.idteam,
                                "Nom Équipe": team.team_name,
                                Libellé: team.team_libelle,
                                "Capacité Totale": team.total_capacity,
                                "Nombre de Ressources": team.resource_count,
                            }));
                            console.log(
                                "✅ Capacités formatées:",
                                capacityData.length,
                                "équipes"
                            );
                        }
                        console.log(
                            "📋 Exemple de donnée:",
                            JSON.stringify(capacityData[0])
                        );
                    } else {
                        const errorText = await capacityResponse.text();
                        console.warn(
                            "⚠️ Impossible de récupérer les capacités. Status:",
                            capacityResponse.status
                        );
                        console.warn("⚠️ Erreur:", errorText);
                    }
                } catch (error) {
                    console.error(
                        "❌ Erreur lors de la récupération des capacités:",
                        error
                    );
                    console.error("❌ Stack:", error.stack);
                }

                // Create the Workbook
                const XLSX = this.btnBoardOptionExportOptimization_XLSX;
                let wb = XLSX.utils.book_new();
                wb.Props = {
                    Title: `Tableau "${this.$store.getters[
                        "boardAlive/nameById"
                    ](this.$view.boardId)}"`,
                    Author: this.$store.getters[`connectionMe/email`],
                    Application: this.$t("app_name"),
                };
                XLSX.utils.book_append_sheet(
                    wb,
                    XLSX.utils.json_to_sheet(formattedObjects),
                    this.$t("xlsx_export.sheets.objects")
                );
                XLSX.utils.book_append_sheet(
                    wb,
                    XLSX.utils.json_to_sheet(formattedLinks),
                    this.$t("xlsx_export.sheets.links")
                );

                // Ajouter la feuille "capacite" (toujours l'ajouter pour debug)
                console.log(
                    "📊 Données capacité à ajouter:",
                    capacityData.length,
                    "lignes"
                );
                if (capacityData.length > 0) {
                    XLSX.utils.book_append_sheet(
                        wb,
                        XLSX.utils.json_to_sheet(capacityData),
                        "capacite"
                    );
                    console.log(
                        '✅ Feuille "capacite" ajoutée avec',
                        capacityData.length,
                        "équipes"
                    );
                } else {
                    // Ajouter une feuille vide si pas de données pour debug
                    XLSX.utils.book_append_sheet(
                        wb,
                        XLSX.utils.json_to_sheet([
                            { message: "Aucune donnée disponible" },
                        ]),
                        "capacite"
                    );
                    console.log('⚠️ Feuille "capacite" ajoutée mais vide');
                }

                // Générer le buffer et envoyer au backend
                console.log("📦 Génération du buffer Excel...");
                const buffer = XLSX.write(wb, { type: "array" });
                console.log(
                    "✅ Buffer généré, taille:",
                    buffer.length,
                    "bytes"
                );

                console.log("📤 Envoi au backend...");
                const baseUrl =
                    location.hostname === "localhost"
                        ? "http://localhost:8080"
                        : "http://213.165.95.153:8080";
                const apiUrl = `${baseUrl}/api/save-input-data-optimization`;
                console.log("URL de l'API:", apiUrl);
                const response = await fetch(apiUrl, {
                    method: "POST",
                    body: buffer,
                    headers: {
                        "Content-Type":
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                });

                console.log(
                    "📥 Réponse du backend:",
                    response.status,
                    response.statusText
                );

                if (response.ok) {
                    const result = await response.json();
                    console.log("✅ Succès:", result);
                    this.$message.success(
                        "Fichier sauvegardé pour optimisation avec succès"
                    );
                } else {
                    const error = await response.text();
                    console.error("❌ Erreur:", error);
                    this.$message.error("Erreur lors de la sauvegarde");
                }
            } catch (error) {
                console.error(
                    "Erreur lors de l'export pour optimisation:",
                    error
                );
                this.$message.error(
                    "Erreur lors de l'export pour optimisation"
                );
            } finally {
                this.btnBoardOptionExportOptimization_isProcessing = false;
            }
        },

        // Recalculer les itérations
        async btnBoardOptionExportOptimization_recalculateIterations() {
            console.log("🔄 Recalcul des itérations déclenché");

            if (this.btnBoardOptionExportOptimization_isRecalculating) {
                console.log("⏸️ Recalcul déjà en cours, annulation");
                return;
            }

            this.btnBoardOptionExportOptimization_isRecalculating = true;

            try {
                const baseUrl =
                    location.hostname === "localhost"
                        ? "http://localhost:8080"
                        : "http://213.165.95.153:8080";
                const apiUrl = `${baseUrl}/api/recalculate-iterations`;

                console.log("🔗 URL de recalcul:", apiUrl);
                this.$message.info("Recalcul des itérations en cours...");

                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                console.log(
                    "📥 Réponse du recalcul:",
                    response.status,
                    response.statusText
                );

                if (response.ok) {
                    const result = await response.json();
                    console.log("✅ Recalcul réussi:", result);

                    const { summary } = result;
                    this.$message.success(
                        `Recalcul terminé avec succès ! ` +
                            `${summary.filesSuccess}/${summary.filesProcessed} fichiers traités, ` +
                            `${summary.totalLinesUpdated}/${summary.totalLinesProcessed} lignes mises à jour.`
                    );
                } else {
                    const error = await response.json();
                    console.error("❌ Erreur de recalcul:", error);
                    this.$message.error(
                        `Erreur lors du recalcul: ${
                            error.error || "Erreur inconnue"
                        }`
                    );
                }
            } catch (error) {
                console.error(
                    "❌ Erreur lors du recalcul des itérations:",
                    error
                );
                this.$message.error("Erreur lors du recalcul des itérations");
            } finally {
                this.btnBoardOptionExportOptimization_isRecalculating = false;
            }
        },

        // Vérifier le statut du calculateur
        async btnBoardOptionExportOptimization_checkCalculatorStatus() {
            try {
                const baseUrl =
                    location.hostname === "localhost"
                        ? "http://localhost:8080"
                        : "http://213.165.95.153:8080";
                const apiUrl = `${baseUrl}/api/recalculate-iterations/status`;

                const response = await fetch(apiUrl);

                if (response.ok) {
                    const result = await response.json();
                    console.log("📊 Statut du calculateur:", result);

                    const availableFiles = result.files.filter((f) => f.exists);
                    this.$message.info(
                        `Calculateur disponible. Date: ${result.currentDate}, ` +
                            `Durée d'itération: ${result.iterationDuration} jours. ` +
                            `${availableFiles.length} fichier(s) trouvé(s).`
                    );
                } else {
                    this.$message.warning(
                        "Impossible de vérifier le statut du calculateur"
                    );
                }
            } catch (error) {
                console.error(
                    "❌ Erreur lors de la vérification du statut:",
                    error
                );
                this.$message.error("Erreur lors de la vérification du statut");
            }
        },
    },
};
</script>

<template>
    <div class="btn-board-option-export-optimization">
        <!-- Bouton d'export existant -->
        <button
            @click="btnBoardOptionExportOptimization_do"
            :disabled="btnBoardOptionExportOptimization_isProcessing"
            class="btn btn-primary"
            title="Exporter les données pour optimisation"
        >
            <i
                class="fas fa-download"
                v-if="!btnBoardOptionExportOptimization_isProcessing"
            ></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{
                btnBoardOptionExportOptimization_isProcessing
                    ? "Export en cours..."
                    : "Exporter pour optimisation"
            }}
        </button>

        <!-- Nouveau bouton de recalcul des itérations -->
        <button
            @click="btnBoardOptionExportOptimization_recalculateIterations"
            :disabled="btnBoardOptionExportOptimization_isRecalculating"
            class="btn btn-success ml-2"
            title="Recalculer les itérations avec la date 01-01-2025 et durée 14 jours"
        >
            <i
                class="fas fa-calculator"
                v-if="!btnBoardOptionExportOptimization_isRecalculating"
            ></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{
                btnBoardOptionExportOptimization_isRecalculating
                    ? "Recalcul en cours..."
                    : "Recalculer itérations"
            }}
        </button>

        <!-- Bouton de vérification du statut -->
        <button
            @click="btnBoardOptionExportOptimization_checkCalculatorStatus"
            class="btn btn-info ml-2"
            title="Vérifier le statut du calculateur d'itérations"
        >
            <i class="fas fa-info-circle"></i>
            Statut calculateur
        </button>
    </div>
</template>

<style scoped>
.btn-board-option-export-optimization {
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background-color: #1e7e34;
}

.btn-info {
    background-color: #17a2b8;
    color: white;
}

.btn-info:hover:not(:disabled) {
    background-color: #117a8b;
}

.ml-2 {
    margin-left: 8px;
}

.fas {
    margin-right: 6px;
}
</style>
