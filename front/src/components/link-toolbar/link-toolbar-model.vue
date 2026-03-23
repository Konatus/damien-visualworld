<template>
    <div class="vw-flex-row vw-flex-center link-toolbar-model">
        <el-button
            class="board-toolbar-button link-toolbar-model-button"
            size="small"
            v-if="grantedForModelUpdate && isEditable"
            @click="onEdit"
        >
            <img
                src="../../assets/icons/toolbar/component-edit-toolbar.svg"
                :alt="$t('toolbar.edit_component')"
            />
        </el-button>
        <el-button
            class="board-toolbar-button link-toolbar-model-button"
            size="small"
            :disabled="true"
            v-else-if="model"
        >
            <img src="../../assets/vw-small-rgb.svg" :alt="$t('icon.VW')" />
        </el-button>
        <el-select
            popper-class="vw-link-color"
            size="small"
            filterable
            v-model="modelId"
            :disabled="!grantedFoLinkUpdate"
        >
            <el-option
                v-for="model of modelList"
                :key="model.linkModelId"
                :value="model.linkModelId"
                :label="model.data.name"
            >
            </el-option>
        </el-select>
    </div>
</template>
<script>
import app from "../../conf/app.js";
import LinkModelEdit from "../../views/link-model-edit.vue";
export default {
    name: "LinkToolbarModel",
    inject: ["$view"],
    computed: {
        grantedForModelUpdate() {
            return this.$store.getters[`connectionMe/isGrantedFor`](
                ["link-model-alive/update"],
                this.$view
            );
        },
        grantedFoLinkUpdate() {
            return this.$store.getters[`connectionMe/isGrantedFor`](
                ["link-alive/update"],
                this.$view
            );
        },
        selectedLinks() {
            return this.$store.getters[
                `app/objectsInBoard/selectedLinkIds`
            ].map((linkId) => this.$store.getters[`linkAlive/byId`](linkId));
        },
        modelId: {
            get() {
                const modelIds = this.selectedLinks.map(
                    (link) => link.linkModelId
                );
                const sameModelIds = modelIds.every(
                    (modelId) => modelId == modelIds[0]
                );
                return sameModelIds ? modelIds[0] || "null" : false;
            },
            set(linkModelId) {
                this.$store.getters[`app/objectsInBoard/selectedLinkIds`].map(
                    (linkId) => {
                        this.$store.dispatch("linkAlive/update", {
                            worldId: this.$view.worldId,
                            boardId: this.$view.boardId,
                            linkId,
                            linkModelId,
                            reply: true,
                        });
                    }
                );
            },
        },
        model() {
            if (this.modelId === false) {
                return null;
            } else {
                return this.$store.getters[`linkModelAlive/byId`](this.modelId);
            }
        },
        isEditable() {
            if (this.modelId === false) {
                return false;
            } else {
                return !this.model?.data?.defaultModel;
            }
        },
        modelList() {
            return this.$store.getters["linkModelAlive/asArray"].filter(
                (item) => {
                    return !Object.values(app.jiraLinkModel).includes(
                        item.linkModelId
                    );
                }
            );
        },
    },
    methods: {
        onEdit() {
            this.$modal.show(
                LinkModelEdit,
                {
                    worldId: this.$view.worldId,
                    updateLink: true,
                    link: this.model,
                    titleForm: this.$t("link_model_edit.update", {
                        linkModelName: this.model?.data?.name,
                    }),
                    submitCallback: ({ data }) => {
                        this.$store.dispatch(`linkModelAlive/update`, {
                            worldId: this.$view.worldId,
                            linkModelId: this.modelId,
                            data,
                        });
                    },
                    displayCancel: true,
                },
                app.modal.parameters_link_model_edit
            );
        },
    },
};
</script>
<style>
.link-toolbar-model {
    border-radius: var(--style-border-radius);
}
.link-toolbar-model,
.link-toolbar-model * {
    background: #f5f7fa !important;
}
.link-toolbar-model .el-button,
.link-toolbar-model .el-input__inner {
    border: none;
}
.link-toolbar-model-button {
    width: 32px;
    height: 32px;
    border-right: 1px solid var(--style-color-grey) !important;
}
.link-toolbar-model-picker input {
    height: 32px;
}
</style>
