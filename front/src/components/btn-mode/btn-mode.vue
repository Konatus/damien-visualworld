<!--
    This component allows the choice of the use-case of the board: normal, resizing or link.
    Ce composant permet le choix du mode d'utilisation du tableau : normal, redimensionnement ou lien.
-->
<template>
    <div class="vw-flex-col">
        <el-tooltip placement="right" :content="$t('left_menu.mode.normal')">
            <el-button
                class="btn-mode-button vw-link-filter"
                :class="{ 'btn-mode-button-selected': modeIsNormal }"
                @click="setModeNormal"
            >
                <img
                    src="../../assets/icons/mode/normal.svg"
                    :alt="$t('left_menu.mode.normal')"
                />
            </el-button>
        </el-tooltip>
        <el-tooltip placement="right" :content="$t('left_menu.mode.select')">
            <el-button
                class="btn-mode-button vw-link-filter"
                :class="{ 'btn-mode-button-selected': modeIsSelect }"
                @click="setModeSelect"
            >
                <img
                    src="../../assets/icons/mode/select.svg"
                    :alt="$t('left_menu.mode.select')"
                />
            </el-button>
        </el-tooltip>
        <el-tooltip
            v-if-granted:forOne="[
                'position-alive/create-front',
                'position-alive/create-back',
                $view,
            ]"
            placement="right"
            :content="$t('left_menu.mode.draw')"
            :value="displayTooltipDrawing"
        >
            <el-button
                class="btn-mode-button vw-link-filter"
                :class="{ 'btn-mode-button-selected': modeIsDrawing }"
                @mouseenter.native="onMouseEnterDrawing"
                @mouseleave.native="onMouseLeaveDrawing"
                @click="setModeDrawing"
            >
                <img
                    src="../../assets/icons/mode/draw.svg"
                    :alt="$t('left_menu.mode.draw')"
                />
            </el-button>
        </el-tooltip>
        <el-tooltip
            v-if-granted:forOne="[
                'position-alive/create-front',
                'position-alive/create-back',
                $view,
            ]"
            placement="right"
            :content="$t('left_menu.mode.link')"
        >
            <el-button
                class="btn-mode-button vw-link-filter"
                :class="{ 'btn-mode-button-selected': modeIsLink }"
                @click="setModeLink"
            >
                <img
                    src="../../assets/icons/mode/link.svg"
                    :alt="$t('left_menu.mode.link')"
                />
            </el-button>
        </el-tooltip>
    </div>
</template>
<script>
import BtnModeShift from "./btn-mode-shift.vue";
export default {
    name: "BtnMode",
    mixins: [BtnModeShift],
    data() {
        return {
            displayTooltipDrawing: false,
        };
    },
    computed: {
        modeIsNormal() {
            return this.$store.getters[`app/objectsInBoard/modeIsNormal`];
        },
        modeIsSelect() {
            return this.$store.getters[`app/objectsInBoard/modeIsSelect`];
        },
        modeIsLink() {
            return this.$store.getters[`app/objectsInBoard/modeIsLink`];
        },
        modeIsDrawing() {
            return this.$store.getters[`app/objectsInBoard/modeIsDrawing`];
        },
    },
    methods: {
        setModeNormal() {
            this.$store.commit(`app/objectsInBoard/setModeNormal`);
        },
        setModeSelect() {
            this.$store.commit(`app/objectsInBoard/setModeSelect`);
        },
        setModeLink() {
            this.$store.commit(`app/objectsInBoard/setModeLink`);
        },
        setModeDrawing() {
            this.displayTooltipDrawing = false;
            this.$store.commit(`app/objectsInBoard/setModeDrawing`);
        },
        onMouseEnterDrawing() {
            this.displayTooltipDrawing = true;
        },
        onMouseLeaveDrawing() {
            this.displayTooltipDrawing = false;
        },
    },
};
</script>
<style>
.btn-mode-button {
    margin: 0 !important;
    margin-top: 10px !important;
    padding: 3px !important;
    border-color: transparent !important;
}
.btn-mode-button:hover,
.btn-mode-button:focus {
    background: unset !important;
}
.btn-mode-button-selected,
.btn-mode-button-selected:hover,
.btn-mode-button-selected:focus {
    background: var(--style-color-main) !important;
}
.btn-mode-button-selected > * {
    filter: brightness(1000);
}
</style>
