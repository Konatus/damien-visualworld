<template>
    <el-tooltip
        placement="right"
        :content="
            $t(
                activeLayerIsForeground
                    ? 'left_menu.layer.foreground'
                    : 'left_menu.layer.background'
            )
        "
    >
        <el-button
            class="btn-layers vw-link-filter"
            :class="{ 'btn-layers-selected': !activeLayerIsForeground }"
            @click="onSwitchLayer"
        >
            <img
                src="../../assets/icons/background.svg"
                :alt="$t('icon.layer')"
            />
        </el-button>
    </el-tooltip>
</template>

<script>
export default {
    name: "BtnLayer",

    computed: {
        activeLayerIsForeground() {
            return this.$store.getters[
                `app/objectsInBoard/activeLayerIsForeground`
            ];
        },
    },

    methods: {
        onSwitchLayer() {
            if (this.activeLayerIsForeground) {
                this.$store.commit(
                    `app/objectsInBoard/activeLayerSetBackground`
                );
            } else {
                this.$store.commit(
                    `app/objectsInBoard/activeLayerSetForeground`
                );
            }
        },
    },
};
</script>
<style scoped>
.btn-layers {
    margin: 0 !important;
    padding: 3px !important;
    border-color: transparent !important;
}
.btn-layers:hover,
.btn-layers:focus {
    background: unset !important;
}
.btn-layers-selected,
.btn-layers-selected:hover,
.btn-layers-selected:focus {
    background: var(--style-color-main) !important;
}
.btn-layers-selected >>> * {
    filter: brightness(1000);
}
</style>
