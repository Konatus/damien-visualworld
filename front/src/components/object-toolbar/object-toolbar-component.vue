<template>
    <div class="vw-flex-row vw-flex-center object-toolbar-component">
        <el-button
            class="board-toolbar-button object-toolbar-component-button"
            size="small"
            v-if="grantedForComponentUpdate && componentId && isEditable"
            @click="onEdit"
        >
            <img
                src="../../assets/icons/toolbar/component-edit-toolbar.svg"
                :alt="$t('toolbar.edit_component')"
            />
        </el-button>
        <el-button
            class="board-toolbar-button object-toolbar-component-button"
            size="small"
            :disabled="true"
            v-else-if="component"
        >
            <img src="../../assets/vw-small-rgb.svg" :alt="$t('icon.VW')" />
        </el-button>
        <component-picker
            class="object-toolbar-component-picker"
            size="small"
            :disabled="
                !grantedForTransmutation ||
                !areAllTransmutable ||
                !grantedForUpdateObject
            "
            v-model="componentId"
        />
    </div>
</template>
<script>
import app from "../../conf/app.js";
import ComponentEdit from "../../views/component-edit.vue";
import ComponentPicker from "../component-picker/component-picker.vue";
export default {
    name: "ObjectToolbarComponent",
    components: {
        ComponentPicker,
    },
    inject: ["$view"],
    computed: {
        grantedForComponentUpdate() {
            return this.$store.getters[`connectionMe/isGrantedFor`](
                ["component-alive/update"],
                this.$view
            );
        },
        grantedForTransmutation() {
            return this.$store.getters[`connectionMe/isGrantedFor`](
                ["position-alive/transmute"],
                this.$view
            );
        },
        grantedForUpdateObject() {
            return this.$store.getters[`connectionMe/isGrantedFor`](
                ["object/update"],
                this.$view
            );
        },
        selectedPositions() {
            return this.$store.getters[
                `app/objectsInBoard/selectedPositionIds`
            ].map((positionId) =>
                this.$store.getters[`positionAlive/byId`](positionId)
            );
        },
        areAllTransmutable() {
            const componentIds = this.selectedPositions.map(
                (position) => position.componentId
            );
            const components = componentIds.map((componentId) =>
                this.$store.getters[`componentAlive/byId`](componentId)
            );
            const isDefaultModel = components.map(
                (component) => component?.data?.noObjectTransmutation
            );
            return isDefaultModel.every((x) => !x);
        },
        componentId: {
            get() {
                const componentIds = this.selectedPositions.map(
                    (position) => position.componentId
                );
                const sameComponentIds = componentIds.every(
                    (componentId) => componentId == componentIds[0]
                );
                return sameComponentIds ? componentIds[0] : undefined;
            },
            set(componentId) {
                this.$store.dispatch("positionAlive/transmute", {
                    worldId: this.$route.params.worldId,
                    boardId: this.$route.params.boardId,
                    data: this.selectedPositions.map(({ objectId }) => ({
                        objectId,
                        componentId,
                    })),
                });
            },
        },
        component() {
            if (this.componentId) {
                return this.$store.getters[`componentAlive/byId`](
                    this.componentId
                );
            } else {
                return null;
            }
        },
        isEditable() {
            if (this.componentId) {
                return !this.component?.data?.defaultModel;
            } else {
                return false;
            }
        },
    },
    methods: {
        onEdit() {
            this.$modal.show(
                ComponentEdit,
                {
                    worldId: this.$view.worldId,
                    componentId: this.componentId,
                    title: this.$t("component_edit.update", {
                        componentName: this.component.data.name,
                    }),
                    displayCancel: true,
                    submitCallback: ({ componentId, data }) => {
                        this.$store.dispatch(`componentAlive/update`, {
                            worldId: this.$view.worldId,
                            componentId,
                            data,
                            reply: true,
                        });
                    },
                },
                app.modal.parameters_component_edit
            );
        },
    },
};
</script>
<style>
.object-toolbar-component {
    border-radius: var(--style-border-radius);
}
.object-toolbar-component,
.object-toolbar-component * {
    background: #f5f7fa !important;
}
.object-toolbar-component .el-button,
.object-toolbar-component .el-input__inner {
    border: none;
}
.object-toolbar-component-button {
    width: 32px;
    height: 32px;
    border-right: 1px solid var(--style-color-grey);
}
.object-toolbar-component-picker input {
    height: 32px;
}
</style>
