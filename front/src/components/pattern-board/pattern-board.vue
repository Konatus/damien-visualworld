<template>
    <section class="vw-flex-row">
        <aside
            id="pattern-board-aside"
            class="vw-flex-col"
            v-if="$slots['side-start'] || $slots['side-end']"
        >
            <div class="board-logo">
                <router-link :to="{ name: 'worldsOfUniverse' }">
                    <img
                        id="pattern-board-logo"
                        src="../../assets/vw-small-rgb.svg"
                        :alt="$t('icon.VW')"
                    />
                </router-link>
            </div>
            <div class="vw-flex-payload vw-flex-col vw-flex-center">
                <slot name="side-start" />
            </div>
            <div class="vw-flex-col vw-flex-center">
                <slot name="side-end" />
            </div>
        </aside>
        <div id="pattern-board-main" class="vw-flex-payload vw-flex-col">
            <div id="pattern-board-head" class="vw-flex-row">
                <div
                    id="pattern-board-head-start"
                    class="vw-flex-row vw-flex-center"
                >
                    <!-- id used by utils/toolbar-position.js -->
                    <slot name="head-start" />
                </div>
                <div class="vw-flex-row vw-flex-center">
                    <slot name="head-middle" />
                </div>
                <div
                    id="pattern-board-head-end"
                    class="vw-flex-row vw-flex-center"
                >
                    <!-- id used by utils/toolbar-position.js -->
                    <slot name="head-end" />
                </div>
            </div>
            <div class="vw-flex-payload vw-flex-row">
                <div
                    @mousedown.stop
                    @touchstart.stop
                    id="pattern-board-drawer"
                    class="vw-flex-col"
                    :class="{ 'drawer-open': drawerOpen }"
                >
                    <slot name="drawer" />
                </div>
                <div class="vw-flex-payload">
                    <slot name="default" />
                </div>
            </div>
            <div id="pattern-board-foot" class="vw-flex-row">
                <div class="vw-flex-row vw-flex-center">
                    <slot name="foot-start" />
                </div>
                <div class="vw-flex-row vw-flex-center">
                    <slot name="foot-end" />
                </div>
            </div>
        </div>
        <modals-container />
    </section>
</template>
<script>
export default {
    name: "PatternBoard",
    inject: ["$view"],
    computed: {
        drawerOpen() {
            return (
                !this.$store.getters["app/objectsInBoard/drawerIsNone"] ||
                this.$store.getters["app/objectsInBoard/modeIsDrawing"]
            );
        },
    },
};
</script>
<style>
/* Elements sizes & positions */
#pattern-board-aside {
    width: 60px;
    padding-bottom: 15px;
}
.board-logo {
    width: 28px;
    margin: auto;
    margin-top: 14px;
}
#pattern-board-head {
    max-height: 50px;
}
#pattern-board-foot {
    max-height: 36px;
}
#pattern-board-drawer {
    left: -320px;
    transition: 0.3s ease-in-out;
    position: absolute;
    top: 0;
    bottom: 0;
    max-width: 320px;
    overflow-y: auto;
    overflow-x: hidden;
}

#pattern-board-drawer nav {
    height: 100%;
}

/* Margins */
#pattern-board-head {
    margin: 8px 10px;
}
#pattern-board-head-start > *:first-child {
    margin-left: 0;
}
#pattern-board-head-end > *:last-child {
    margin-right: 0;
}
#pattern-board-drawer {
    margin: 0 10px;
}
#pattern-board-foot {
    margin: 16px 21px;
}

/* Head & foot are transparent & dont intercept events */
#pattern-board-head,
#pattern-board-foot {
    pointer-events: none;
    background: transparent;
}
#pattern-board-head > *,
#pattern-board-foot > * {
    pointer-events: all;
}

/* Colors */
#pattern-board-logo {
    filter: var(--style-filter-main);
}
#pattern-board-logo:hover {
    filter: none;
}
#pattern-board-main {
    background: #fafafa;
}
#pattern-board-aside,
#pattern-board-drawer {
    background: var(--style-color-white);
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 2px 8px rgba(0, 0, 0, 0.1);
}

/* Children behaviour */
#pattern-board-aside button {
    margin-top: 10px;
}
#pattern-board-drawer.drawer-open {
    left: 0px;
}
</style>
