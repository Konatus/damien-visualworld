<template>
    <el-menu-item
        class="board-toolbar-button"
        @click="onDelete"
        v-show-granted:forOne="[
            'position-alive/remove-front',
            'position-alive/remove-back',
            $view,
        ]"
    >
        <img src="../../assets/icons/delete.svg" :alt="$t('icon.three_dots')" />
    </el-menu-item>
</template>
<script>
export default {
    name: "ObjectToolbarDeletion",
    inject: ["$view"],
    watch: {
        "$store.state.app.objectsInBoard.event"(event) {
            if (event.name === "objectToolbarDeletion") {
                this.onDelete();
            }
        },
    },
    methods: {
        onDelete() {
            // Button is deactivated but this function may also be called by pressing the delete key
            if (
                !this.$store.getters[`connectionMe/isGrantedForOne`](
                    [
                        "position-alive/remove-front",
                        "position-alive/remove-back",
                    ],
                    this.$view
                )
            ) {
                return;
            }

            const positionToDelete =
                this.$store.getters[`app/objectsInBoard/selectedPositionIds`];
            if (positionToDelete.length) {
                this.$store.dispatch(`positionAlive/delete`, {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data: positionToDelete.map((positionId) => ({
                        positionId,
                    })),
                    isBackground:
                        this.$store.getters[
                            `app/objectsInBoard/activeLayerIsBackground`
                        ],
                });
            }

            // TODO: remove links of these objets (previously `this.updateLinkedObject(this.selectedPositions)` ) ?
            this.$store.commit(`app/objectsInBoard/event`, "resetSelection");
            this.$store.commit(`app/objectsInBoard/selectedPositionIds`, []);
        },
    },
};
</script>
