<template>
    <el-menu-item
        class="board-toolbar-button"
        v-if="
            $store.getters[`app/objectsInBoard/selectedPositionIds`].length ===
                1 && isEditable
        "
        @click="onEdit"
        v-if-granted:for="['object/update', $view]"
    >
        <img
            src="../../assets/icons/toolbar/edit.svg"
            :alt="$t('toolbar.edit')"
        />
    </el-menu-item>
</template>
<script>
import app from "../../conf/app.js";
import ObjectData from "../object-data/object-data.vue";
export default {
    name: "ObjectToolbarData",
    inject: ["$view"],
    computed: {
        isEditable() {
            const { componentId } = this.$store.getters[`positionAlive/byId`](
                this.$store.getters[`app/objectsInBoard/selectedPositionIds`][0]
            );
            const component =
                this.$store.getters[`componentAlive/byId`](componentId);
            return !component.data.noObjectEdition;
        },
    },
    methods: {
        onEdit() {
            const selectedPosition = this.$store.getters[`positionAlive/byId`](
                this.$store.getters[`app/objectsInBoard/selectedPositionIds`][0]
            );
            this.$modal.show(
                ObjectData,
                {
                    isNew: false,
                    componentId: selectedPosition.componentId,
                    objectId: selectedPosition.objectId,
                    positionId: selectedPosition.positionId,
                    position: {
                        width: selectedPosition.data.width,
                        height: selectedPosition.data.height,
                    },
                    submitCallback: () => {},
                    displayCancel: true,
                },
                app.modal.parameters_object_data
            );
        },
    },
};
</script>
