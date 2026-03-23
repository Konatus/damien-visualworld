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

        <!-- Parameters modal -->
        <el-dialog
            v-if="showModal"
            :visible="true"
            title="Konatus settings"
            width="520px"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal="true"
            :lock-scroll="true"
            show-close
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

                <div class="option-group">
                    <label class="option-label">Number of teams:</label>
                    <el-input-number
                        v-model="selectedOptions.teamCount"
                        :min="1"
                        :max="50"
                        placeholder="Number of teams"
                        style="width: 100%"
                    />
                </div>

                <div class="option-group" style="margin-top: 20px">
                    <el-button
                        @click="checkDatabase"
                        :loading="checkingDatabase"
                        type="primary"
                        plain
                    >
                        Vérifier les données de la base
                    </el-button>
                </div>
            </div>

            <template #footer>
                <el-button
                    type="primary"
                    @click="applyOptions"
                    :disabled="!isFormValid"
                >
                    Apply
                </el-button>
            </template>
        </el-dialog>

        <!-- Progress / Success popup -->
        <el-dialog
            v-if="showProgressModal"
            :visible="true"
            width="520px"
            :close-on-click-modal="false"
            :append-to-body="true"
            :modal="true"
            :lock-scroll="true"
            show-close
            @close="closeProgressModal"
        >
            <!-- État: en cours -->
            <div v-if="progressState === 'progress'" class="progress-wrap">
                <div class="popup-title popup-title--warning">
                    Optimization in progress
                </div>
                <div class="popup-subtitle">
                    Please wait while we process your request.
                </div>

                <div class="circle-wrap">
                    <el-progress
                        type="circle"
                        :percentage="progressPercent"
                        :stroke-width="10"
                    />
                </div>

                <div class="countdown">~ {{ remainingTime }}s remaining</div>

                <div class="hint">
                    Do not close this window to avoid interrupting the
                    operation.
                </div>
            </div>

            <!-- État: succès -->
            <div v-else-if="progressState === 'done'" class="success-wrap">
                <div class="popup-title popup-title--success">
                    Optimization completed successfully
                </div>
                <div class="popup-subtitle">Please check the result.</div>
            </div>
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

            selectedOptions: {
                startDate: new Date().toISOString().split("T")[0],
                iterationDuration: 14,
                phaseCount: 3,
                priorityCount: 5,
                teamCount: 1,
            },

            validationResults: {},
            checkingDatabase: false,

            // Popup progress
            showProgressModal: false,
            progressState: "progress", // 'progress' | 'done'
            remainingTime: 0,
            countdownTotal: 0,
            timerInterval: null,
        };
    },

    computed: {
        isFormValid() {
            return (
                this.selectedOptions.startDate &&
                Number(this.selectedOptions.iterationDuration) > 0 &&
                Number(this.selectedOptions.phaseCount) > 0 &&
                Number(this.selectedOptions.priorityCount) > 0 &&
                Number(this.selectedOptions.teamCount) > 0
            );
        },
        progressPercent() {
            if (this.countdownTotal <= 0) return 0;
            const elapsed = this.countdownTotal - this.remainingTime;
            const pct = Math.round((elapsed / this.countdownTotal) * 100);
            return Math.min(100, Math.max(0, pct));
        },
    },

    methods: {
        applyOptions() {
            this.closeModal();
            const randomSeconds = Math.floor(Math.random() * 11) + 50; // 50–60
            this.countdownTotal = randomSeconds;
            this.remainingTime = randomSeconds;
            this.progressState = "progress";
            this.showProgressModal = true;

            if (this.timerInterval) clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => {
                this.remainingTime--;
                if (this.remainingTime <= 0) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                    this.progressState = "done";
                }
            }, 1000);
        },

        closeProgressModal() {
            this.showProgressModal = false;
        },

        closeModal() {
            this.showModal = false;
        },

        async checkDatabase() {
            if (this.checkingDatabase) return;
            this.checkingDatabase = true;
            this.validationResults = {};

            try {
                const API_BASE =
                    process.env.VUE_APP_API_URL || "http://localhost:8080";
                const params = {
                    expectedPhases: this.selectedOptions.phaseCount,
                    expectedPriorities: this.selectedOptions.priorityCount,
                    expectedTeams: this.selectedOptions.teamCount,
                };
                const response = await axios.get(
                    `${API_BASE}/api/check-database`,
                    { params }
                );
                if (response.data) {
                    this.validationResults = response.data;
                    this.$message.success(
                        "✅ Database check completed successfully"
                    );
                }
            } catch (error) {
                console.error("Check DB error:", error);
                this.$message.error("❌ Error while checking the database");
            } finally {
                this.checkingDatabase = false;
            }
        },
    },

    beforeUnmount() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    },
};
</script>

<style scoped>
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

/* ---- Settings dialog ---- */
.konatus-modal-content {
    padding: 20px 0;
}
.option-group {
    margin-bottom: 20px;
}
.option-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #606266;
    font-size: 14px;
}

/* ---- Progress/Success popup ---- */
.progress-wrap,
.success-wrap {
    display: grid;
    grid-template-rows: auto auto auto auto;
    gap: 12px;
    text-align: center;
    padding: 8px 6px 2px;
}

.popup-title {
    font-weight: 700;
    font-size: 18px;
    line-height: 1.3;
}
.popup-title--warning {
    color: #e6a23c;
}
.popup-title--success {
    color: #67c23a;
}

.popup-subtitle {
    color: #606266;
    font-size: 14px;
}

.circle-wrap {
    display: flex;
    justify-content: center;
    margin: 10px 0 0;
}

.countdown {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
}

.hint {
    color: #909399;
    font-size: 12px;
}
</style>
