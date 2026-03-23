<template>
    <div>
        <el-dialog :visible="showWizard" width="720px" @close="onCloseWizard">
            <h2 class="wizard-title">Assistant d'import & optimisation</h2>

            <el-steps
                :active="activeStep"
                align-center
                class="custom-steps mb-4"
            >
                <el-step title="Étape 1" description="Choisir 2 tableaux" />
                <el-step title="Étape 2" description="Optimisation" />
                <el-step title="Étape 3" description="Positionnement" />
            </el-steps>

            <!-- ÉTAPE 1 -->
            <div v-if="activeStep === 0" class="step-card">
                <!-- Sélections (non fonctionnelles, juste pour l'affichage) -->
                <div class="grid-2">
                    <el-form label-position="top">
                        <el-form-item label="Tableau Contexte">
                            <el-select placeholder="Choisir un tableau..." />
                        </el-form-item>
                    </el-form>

                    <el-form label-position="top">
                        <el-form-item label="Tableau Réponse">
                            <el-select placeholder="Choisir un tableau..." />
                        </el-form-item>
                    </el-form>
                </div>

                <!-- BOUTON EXPORT -->
                <div class="actions-row mt-2">
                    <el-button
                        class="btn-Export"
                        @click="fakeExport"
                        :disabled="isStep1Done"
                    >
                        Exporter les données
                    </el-button>

                    <el-tag v-if="isStep1Done" type="success"
                        >Étape validée ✓</el-tag
                    >
                </div>

                <!-- MESSAGE VERT -->
                <el-alert
                    v-if="isStep1Done"
                    type="success"
                    show-icon
                    title="Données exportées ✓"
                    class="mt-2"
                />

                <!-- FOOTER -->
                <div class="footer-inline mt-3">
                    <span />
                    <el-button
                        class="btn-next"
                        :disabled="!isStep1Done"
                        @click="nextStep"
                    >
                        Étape suivante →
                    </el-button>
                </div>
            </div>

            <!-- ÉTAPE 2 (vide pour le moment) -->
            <div v-if="activeStep === 1" class="step-card">
                <el-alert
                    type="info"
                    title="Ici il y aura l’optimisation."
                    show-icon
                />
                <div class="footer-inline mt-3">
                    <el-button class="btn-prev" @click="prevStep"
                        >← Précédent</el-button
                    >
                </div>
            </div>
        </el-dialog>

        <!-- BOUTON OUVERTURE -->
        <el-button type="primary" @click="showWizard = true"
            >Ouvrir Wizard</el-button
        >
    </div>
</template>

<script>
export default {
    name: "BtnKonatus",

    data() {
        return {
            showWizard: false,
            activeStep: 0,
            isStep1Done: false,
        };
    },

    methods: {
        onCloseWizard() {
            this.activeStep = 0;
            this.isStep1Done = false;
        },

        nextStep() {
            if (this.activeStep === 0 && this.isStep1Done) this.activeStep = 1;
        },
        prevStep() {
            if (this.activeStep > 0) this.activeStep--;
        },

        // ⭐ BOUTON EXPORT SANS TRAITEMENT
        fakeExport() {
            this.isStep1Done = true; // affiche message + active étape suivante
            this.$message.success("Données exportées ✓");
        },
    },
};
</script>

<style scoped>
.wizard-title {
    font-size: 22px;
    margin-bottom: 20px;
}
.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.actions-row {
    display: flex;
    align-items: center;
    gap: 12px;
}
.footer-inline {
    display: flex;
    justify-content: space-between;
}
.btn-next {
    background: #34495e;
    color: white;
}
.btn-prev {
    background: #bdc3c7;
    color: #2c3e50;
}
</style>
