<template>
    <div id="link-toolbar-label" class="board-toolbar-button">
        <el-input
            size="mini"
            v-model="label"
            @mousemove.native.stop
            @keydown.native.stop
        />
    </div>
</template>
<script>
export default {
    name: "LinkToolbarLabel",
    inject: ["$view"],
    computed: {
        selectedLinks() {
            return this.$store.getters[
                `app/objectsInBoard/selectedLinkIds`
            ].map((linkId) => this.$store.getters[`linkAlive/byId`](linkId));
        },
        label: {
            get() {
                const titles = this.selectedLinks.map((link) =>
                    this.$store.getters[`linkAlive/titleById`](link.linkId)
                );
                const sameTitles = titles.every((title) => title == titles[0]);
                return sameTitles ? titles[0] : false;
            },
            set(value) {
                this.selectedLinks.forEach((link) => {
                    this.$store.dispatch("linkAlive/update", {
                        worldId: this.$view.worldId,
                        boardId: this.$view.boardId,
                        linkId: link.linkId,
                        data: {
                            ...link.data,
                            title: value,
                        },
                        linkModelId: link.linkModelId,
                        reply: false,
                    });
                });
            },
        },
    },
};
</script>
<style>
#link-toolbar-label * {
    max-width: 150px;
}
</style>
