<template>
    <el-button
        v-if="!hiddenItems.includes(modelId)"
        @click="doHide(modelId)"
        type="info"
        size="mini"
    >
        {{ $t("library.item_model_display_management.hide") }}
    </el-button>
    <el-button v-else @click="doDisplay(modelId)" type="info" size="mini">
        {{ $t("library.item_model_display_management.display") }}
    </el-button>
</template>

<script>
export default {
    name: "BtnModelDisplayManagement",

    inject: ["$view"],

    props: {
        model: String,
        modelId: String,
        hiddenItems: Array,
    },

    methods: {
        doHide(modelId) {
            const updatedHiddenItems = this.hiddenItems;
            updatedHiddenItems.push(modelId);
            this.doUpdate(updatedHiddenItems, this.model);
        },
        doDisplay(modelId) {
            const updatedHiddenItems = this.hiddenItems.filter(
                (item) => item != modelId
            );
            this.doUpdate(updatedHiddenItems, this.model);
        },
        doUpdate(updatedHiddenItems) {
            this.$store.dispatch("boardAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: {
                    [`hiddenItems.${this.model}`]: updatedHiddenItems,
                },
                reply: true,
            });
        },
    },
};
</script>
