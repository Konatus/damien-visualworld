<template>
    <el-menu-item
        class="board-toolbar-button"
        @click="onDelete"
        v-show-granted:forAll="[
            'position-alive/remove-front',
            'position-alive/remove-back',
            'link-alive/remove',
            $view,
        ]"
    >
        <img src="../../assets/icons/delete.svg" :alt="$t('icon.delete')" />
    </el-menu-item>
</template>
<script>
export default {
    name: "LinkToolbarDeletion",
    inject: ["$view"],
    watch: {
        "$store.state.app.objectsInBoard.event"(event) {
            if (event.name === "linkToolbarDeletion") {
                this.onDelete();
            }
        },
    },
    methods: {
        onDelete() {
            // Button is deactivated but this function may also be called by pressing the delete key
            if (
                !this.$store.getters[`connectionMe/isGrantedForAll`](
                    [
                        "position-alive/remove-front",
                        "position-alive/remove-back",
                        "link-alive/remove",
                    ],
                    this.$view
                )
            ) {
                return;
            }
            this.$store.dispatch("linkAlive/delete", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                document: this.$store.getters[
                    `app/objectsInBoard/selectedLinkIds`
                ].map((linkId) => ({ linkId })),
            });
            this.$store.commit(`app/objectsInBoard/event`, "resetSelection");
            this.$store.commit(`app/objectsInBoard/selectedLinkIds`, []);
        },
    },
};
</script>
