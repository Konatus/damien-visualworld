<template>
    <el-menu-item class="board-toolbar-button" @click="onInvert">
        <img
            src="../../assets/icons/link/anchor-invert.svg"
            :alt="$t('links.invert')"
        />
    </el-menu-item>
</template>
<script>
export default {
    name: "LinkToolbarInvert",
    inject: ["$view"],
    methods: {
        onInvert() {
            this.$store.getters[`app/objectsInBoard/selectedLinkIds`].forEach(
                (linkId) => {
                    const { objects } =
                        this.$store.getters[`linkAlive/byId`](linkId);
                    this.$store.dispatch("linkAlive/update", {
                        worldId: this.$view.worldId,
                        boardId: this.$view.boardId,
                        linkId,
                        objects: [
                            {
                                _id: objects[0]._id,
                                data: objects[1].data,
                            },
                            {
                                _id: objects[1]._id,
                                data: objects[0].data,
                            },
                        ],
                        reply: true,
                    });
                }
            );
        },
    },
};
</script>
