<template>
    <color-picker class="board-toolbar-button" mode="link" v-model="color" />
</template>
<script>
import ColorPicker from "../color-picker/color-picker.vue";
export default {
    name: "LinkToolbarColor",
    inject: ["$view"],
    components: {
        ColorPicker,
    },
    computed: {
        selectedLinks() {
            return this.$store.getters[
                `app/objectsInBoard/selectedLinkIds`
            ].map((linkId) => this.$store.getters[`linkAlive/byId`](linkId));
        },
        color: {
            get() {
                const values = this.selectedLinks.map(
                    (link) => link.data.color
                );
                const sameValue = values.every((value) => value == values[0]);
                return sameValue ? values[0] : false;
            },
            set(color) {
                this.$store.getters[`app/objectsInBoard/selectedLinkIds`].map(
                    (linkId) => {
                        this.$store.dispatch("linkAlive/update", {
                            worldId: this.$view.worldId,
                            boardId: this.$view.boardId,
                            linkId,
                            data: {
                                color,
                            },
                            reply: false,
                        });
                    }
                );
            },
        },
    },
};
</script>
