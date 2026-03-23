<template>
    <el-tooltip
        placement="right"
        :content="$t('left_menu.library.access_libraries')"
    >
        <el-button
            size="small"
            class="btn-library vw-link-filter vw-link-color"
            :class="{ 'btn-library-selected': libraryIsShown }"
            @click="onOpenLibrary"
        >
            <slot />
        </el-button>
    </el-tooltip>
</template>

<script>
import app from "../../conf/app.js";
import LibrariesOfUniverse from "../../views/libraries-of-universe.vue";
export default {
    name: "BtnLibrary",
    inject: ["$view"],
    computed: {
        libraryIsShown() {
            return !!this.$store.getters[`app/librariesOfUniverse/activeTab`];
        },
    },
    methods: {
        onOpenLibrary() {
            this.$modal.show(
                LibrariesOfUniverse,
                {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                },
                app.modal.parameters_library_of_universe
            );
        },
    },
};
</script>
<style>
#pattern-board-aside .btn-library {
    margin: 0 0 10px 0 !important;
    padding: 3px !important;
    border-color: transparent !important;
}
#pattern-board-aside .btn-library:hover,
#pattern-board-aside .btn-library:focus {
    background: unset !important;
}
#pattern-board-aside .btn-library-selected,
#pattern-board-aside .btn-library-selected:hover,
#pattern-board-aside .btn-library-selected:focus {
    background: var(--style-color-main) !important;
}
.btn-library-selected > * {
    filter: brightness(1000);
}
</style>
