<template>
    <div>
        <!-- Launcher button -->
        <el-tooltip content="Konatus" placement="right" :open-delay="500">
            <div
                id="btn-konatus"
                class="vw-card vw-link-color"
                :class="{ 'is-active': isPressed }"
                @mousedown="isPressed = true"
                @mouseup="isPressed = false"
                @mouseleave="isPressed = false"
                @click="showModal = true"
            >
                <img src="../../assets/konatus-ico.png" alt="Konatus" />
            </div>
        </el-tooltip>

        <!-- Success modal -->
        <el-dialog
            v-if="showResultModal"
            :visible="true"
            title="Optimization"
            width="480px"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal="true"
            :lock-scroll="true"
            @close="showResultModal = false"
        >
            <div style="padding: 8px 0; font-size: 14px">
                {{
                    resultError
                        ? resultError
                        : "Optimization started successfully."
                }}
            </div>
            <template #footer>
                <el-button
                    type="primary"
                    @click="onShowOptimization"
                    :disabled="!!resultError"
                >
                    Show optimization
                </el-button>
            </template>
        </el-dialog>

        <!-- Parameters modal -->
        <el-dialog
            v-if="showModal"
            :visible="true"
            title="Konatus settings"
            width="500px"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal="true"
            :lock-scroll="true"
            @close="closeModal"
        >
            <div class="konatus-modal-content">
                <div class="option-group">
                    <label class="option-label">Planning start date:</label>
                    <el-date-picker
                        v-model="selectedOptions.startDate"
                        type="date"
                        placeholder="Select a date"
                        format="dd/MM/yyyy"
                        value-format="yyyy-MM-dd"
                        style="width: 100%"
                    />
                </div>

                <div class="option-group">
                    <label class="option-label"
                        >Iteration duration (days):</label
                    >
                    <el-input-number
                        v-model="selectedOptions.iterationDuration"
                        :min="1"
                        :max="365"
                        placeholder="Number of days"
                        style="width: 100%"
                    />
                </div>

                <div class="option-group">
                    <label class="option-label">Number of phases:</label>
                    <el-input-number
                        v-model="selectedOptions.phaseCount"
                        :min="1"
                        :max="20"
                        placeholder="Number of phases"
                        style="width: 100%"
                    />
                </div>

                <div class="option-group">
                    <label class="option-label">Number of priorities:</label>
                    <el-input-number
                        v-model="selectedOptions.priorityCount"
                        :min="1"
                        :max="10"
                        placeholder="Number of priorities"
                        style="width: 100%"
                    />
                </div>
            </div>

            <template #footer>
                <el-button @click="closeModal">Cancel</el-button>
                <el-button
                    type="primary"
                    @click="applyOptions"
                    :disabled="!isFormValid || running"
                    :loading="running"
                >
                    Apply
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "BtnKonatus",

    data() {
        return {
            isPressed: false,
            showModal: false,
            running: false,

            // success modal
            showResultModal: false,
            resultError: null,

            selectedOptions: {
                startDate: new Date().toISOString().split("T")[0],
                iterationDuration: 14,
                phaseCount: 3,
                priorityCount: 5,
            },
        };
    },

    computed: {
        isFormValid() {
            return (
                this.selectedOptions.startDate &&
                Number(this.selectedOptions.iterationDuration) > 0 &&
                Number(this.selectedOptions.phaseCount) > 0 &&
                Number(this.selectedOptions.priorityCount) > 0
            );
        },
    },

    methods: {
        async applyOptions() {
            if (!this.isFormValid || this.running) return;
            this.running = true;
            this.resultError = null;

            // Ferme la modale des param�tres avant l'appel
            this.closeModal();

            try {
                // Base URL du backend : prend .env si pr�sent, sinon fallback IP:5050
                const API_BASE =
                    process.env.VUE_APP_BACKEND_URL ||
                    `http://${window.location.hostname}:5050`;

                // On envoie les options au backend (si tu veux les lire plus tard)
                const payload = {
                    start_date: this.selectedOptions.startDate,
                    iteration_days: Number(
                        this.selectedOptions.iterationDuration
                    ),
                    phases: Number(this.selectedOptions.phaseCount),
                    priorities: Number(this.selectedOptions.priorityCount),
                };

                const resp = await axios.post(
                    `${API_BASE}/run_optimization`,
                    payload,
                    {
                        headers: { "Content-Type": "application/json" },
                        timeout: 60000,
                    }
                );

                // Backend renvoie {status:"running"|"already_running"|...}
                if (resp.status === 200 && resp.data && resp.data.status) {
                    if (resp.data.status === "already_running") {
                        this.$message.warning(
                            "An optimization is already running."
                        );
                    } else {
                        this.$message.success("Optimization started.");
                    }
                    this.showResultModal = true;
                } else {
                    this.resultError = "Unexpected response from backend.";
                    this.showResultModal = true;
                }
            } catch (e) {
                console.error(e);
                this.resultError = `Connection error to the backend: ${
                    e?.message || e
                }`;
                this.$message.error(this.resultError);
                this.showResultModal = true;
            } finally {
                this.running = false;
            }
        },

        onShowOptimization() {
            // URL d�affichage des r�sultats : configurable par .env sinon fallback
            const url =
                process.env.VUE_APP_OPTIMIZATION_URL ||
                `http://${window.location.host}/world/68b70d885688a422d9513890/board/68b852ce6f93fb2e252fdc22`;

            if (url) window.open(url, "_blank");
            this.showResultModal = false;
        },

        closeModal() {
            this.showModal = false;
        },
    },
};
</script>

<style scoped>
/* Bouton flottant */
#btn-konatus {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}
#btn-konatus img {
    width: 24px;
    height: 24px;
    transition: filter 0.2s ease;
}
#btn-konatus.is-active {
    transform: scale(0.95);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
}
#btn-konatus:hover img {
    filter: brightness(0) saturate(100%) invert(46%) sepia(66%) saturate(2404%)
        hue-rotate(191deg) brightness(98%) contrast(107%);
}

/* Modale */
.konatus-modal-content {
    padding: 20px 0;
    position: relative;
    z-index: 9999;
}
.option-group {
    margin-bottom: 20px;
    position: relative;
    z-index: 9999;
}
.option-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #606266;
    font-size: 14px;
    position: relative;
    z-index: 9999;
}

.dialog-footer {
    text-align: right;
    position: relative;
    z-index: 9999;
}
.dialog-footer .el-button {
    margin-left: 10px;
    position: relative;
    z-index: 9999;
}

/* Force dialogs above */
:deep(.el-dialog) {
    z-index: 10000 !important;
}
:deep(.el-dialog__wrapper) {
    z-index: 10000 !important;
}
:deep(.el-dialog__body) {
    position: relative;
    z-index: 10000 !important;
}
:deep(.el-select),
:deep(.el-input-number),
:deep(.el-button) {
    position: relative;
    z-index: 10000 !important;
}

/* Responsive */
@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
    }
    .action-buttons .el-button {
        width: 100%;
        margin-bottom: 10px;
    }
}
</style>
