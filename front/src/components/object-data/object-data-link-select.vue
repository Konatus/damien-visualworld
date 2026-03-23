<template>
    <div>
        <el-select
            class="object-data-link-select"
            popper-class="object-data-link-select-dropdown vw-link-color"
            filterable
            :disabled="jiraLinkModel"
            :value="linkModelId"
            @change="onChangeLinkModel"
        >
            <template slot="prefix">
                <link-icon
                    size="mini"
                    :key="linkModelId"
                    :linkModelId="linkModelId"
                />
            </template>

            <el-option
                :value="defaultLinkId"
                :label="$t('links.default_link')"
                class="default-link-option"
            >
                <link-icon key="null" size="mini" :linkModelId="null" />
                {{ $t("links.default_link") }}
            </el-option>

            <el-option
                v-for="model of linkModels"
                :key="model.linkModelId"
                :value="model.linkModelId"
                :label="model.data.name"
            >
                <link-icon
                    size="mini"
                    :key="model._id"
                    :linkModelId="model.linkModelId"
                />
                {{ model.data.name }}
            </el-option>
        </el-select>
        <el-input
            :disabled="jiraLinkModel"
            size="mini"
            class="edit-title"
            v-model="title"
            :placeholder="$t('links.title')"
        ></el-input>
    </div>
</template>

<script>
import LinkIcon from "../link-icon/link-icon.vue";
import app from "../../conf/app";
export default {
    name: "ObjectDataLinkSelect",

    components: {
        LinkIcon,
    },

    inject: ["$view"],

    props: {
        linkModelId: String,
        linkId: String,
    },

    computed: {
        link() {
            return this.$store.getters["linkAlive/byId"](this.linkId);
        },

        linkModels() {
            return this.$store.getters["linkModelAlive/asArray"].filter(
                (x) =>
                    ![
                        app.visualWorldComponent.VW_default,
                        ...Object.values(app.jiraLinkModel),
                    ].includes(x.linkModelId)
            );
        },
        jiraLinkModel() {
            return !!Object.values(app.jiraLinkModel).includes(
                this.linkModelId
            );
        },
        defaultLinkId() {
            return app.visualWorldComponent.VW_default;
        },

        title: {
            get() {
                return this.$store.getters[`linkAlive/titleById`](this.linkId);
            },
            set(title) {
                this.$store.dispatch("linkAlive/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    linkId: this.linkId,
                    data: { title },
                    reply: false,
                });
            },
        },
    },

    methods: {
        onChangeLinkModel(evt) {
            this.$emit("getLinkFromSelect", {
                linkModelIdChoice: evt,
                currentLinkId: this.linkId,
            });
        },
        saveTitle() {
            this.$store.dispatch("linkAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                linkId: this.linkId,
                data: this.link.data,
                linkModelId: this.linkModelId,
                reply: false,
            });
        },
    },
};
</script>

<style>
.object-data-link-select-dropdown .el-select-dropdown__item {
    height: 50px;
    display: flex;
    padding: 0px;
    padding-left: 13px;
    padding-top: 8px;
}

.object-data-link-select-dropdown .el-select-dropdown__item svg {
    margin-right: 5px;
    height: 35px !important;
    width: 35px;
    background: white !important;
}

.object-data-link-select-dropdown .default-link-option {
    border-bottom: 1px solid #dedee2;
}
</style>

<style scoped>
.object-data-link-select >>> svg {
    height: 35px !important;
    width: 35px;
    background: white !important;
}

.object-data-link-select {
    position: relative;
    width: 100%;
    border-radius: 0px;
    display: flex;
    background: #f1f1f4;
    height: var(--object-linked-bottom-height);
}

.object-data-link-select >>> .el-input__inner {
    border-radius: 0px 0px var(--style-border-radius) var(--style-border-radius);
    border: none;
    background: #f1f1f4;
    height: 50px;
}

.object-data-link-select.object-data-link-select
    >>> .el-input--prefix
    .el-input__inner {
    height: 30px;
}
.object-data-link-select.object-data-link-select.title >>> .el-select__caret {
    position: relative;
    top: 9px;
}

.object-data-link-select >>> .el-input--prefix .el-input__inner {
    padding-left: 65px;
    font-size: 12px;
    font-weight: 700;
}

.object-data-link-select >>> span.el-input__prefix {
    top: 7px;
    left: 15px;
    height: 35px;
}

.object-data-link-select >>> span.el-input__prefix svg {
    border: 1px solid #dedee2;
}
.object-data-link-select >>> .el-input__suffix-inner {
    top: -11px;
    position: relative;
}

.edit-title {
    position: absolute;
    bottom: 6px;
    width: 150px;
    left: 55px;
}
.edit-title >>> input {
    height: 12px;
    background: transparent;
    border: 0;
    padding: 10px;
    border-radius: var(--style-border-radius);
}
.edit-title >>> input:hover {
    box-shadow: var(--shadow-inset-hover);
    background: #ffffff85;
}
.edit-title >>> input:focus {
    background: var(--style-color-white);
    box-shadow: var(--shadow-inset-focus);
}
</style>
