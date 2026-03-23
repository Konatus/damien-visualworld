<template>
    <el-tooltip
        placement="right"
        trigger="hover"
        :content="$t('left_menu.dock.open_dock')"
        :value="
            displayTooltip &&
            !$store.getters['app/objectsInBoard/setDrawerComponent']
        "
    >
        <el-button
            class="btn-dock"
            :class="{
                'btn-dock-selected': drawerIsComponent,
                'vw-link-filter': displayTooltip,
            }"
            @mouseenter.native="onMouseEnter"
            @mouseleave.native="onMouseLeave"
            @mousedown.native.stop
            @touchstart.native.stop
            @click="onClick"
        >
            <img
                src="../../assets/icons/component-dock.svg"
                :alt="$t('icon.components')"
            />
        </el-button>
    </el-tooltip>
</template>
<script>
export default {
    name: "BtnDock",
    data() {
        return {
            displayTooltip: false,
        };
    },
    computed: {
        drawerIsComponent() {
            return this.$store.getters["app/objectsInBoard/drawerIsComponent"];
        },
    },
    methods: {
        onClick() {
            this.displayTooltip = false;
            if (this.drawerIsComponent) {
                this.$store.commit("app/objectsInBoard/setDrawerNone");
            } else {
                this.$store.commit("app/objectsInBoard/setDrawerComponent");
            }
        },
        onMouseEnter() {
            this.displayTooltip = true;
        },
        onMouseLeave() {
            this.displayTooltip = false;
        },
    },
};
</script>
<style>
.btn-dock {
    margin: 0 !important;
    padding: 3px !important;
    border-color: transparent !important;
}
.btn-dock:hover,
.btn-dock:focus {
    background: unset !important;
}
.btn-dock-selected,
.btn-dock-selected:hover,
.btn-dock-selected:focus {
    background: var(--style-color-main) !important;
}
.btn-dock-selected > * {
    filter: brightness(1000);
}
</style>
