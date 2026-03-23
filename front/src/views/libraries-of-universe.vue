<!--
    This component contains the modal for all types of template
    Ce component contient les différents types de catalogue
-->

<template>
    <div id="libraries-of-universe">
        <el-button
            @click="$emit('close')"
            size="mini"
            id="btn-close-libraries-of-universe"
            class="modal-btn-close vw-link-color"
            icon="el-icon-close"
            type="info"
        />
        <span id="libraries-of-universe-title">
            {{ $t("library.title") }}
        </span>
        <el-tabs tab-position="left" v-model="activeTab">
            <el-tab-pane :name="tab.component">
                <span slot="label">
                    <img
                        src="../assets/icons/component-library.svg"
                        :alt="$t('library.component.title')"
                    />
                    <span class="libraries-of-universe-label">
                        {{ $t("library.tabs.components") }}
                    </span>
                </span>
                <component-library />
            </el-tab-pane>

            <el-tab-pane :name="tab.link">
                <span slot="label">
                    <img
                        src="../assets/icons/link-library.svg"
                        :alt="$t('library.link.title')"
                    />
                    <span class="libraries-of-universe-label">
                        {{ $t("library.tabs.links") }}
                    </span>
                </span>
                <link-model-library />
            </el-tab-pane>

            <el-tab-pane :name="tab.template">
                <span slot="label">
                    <img
                        src="../assets/icons/template-library.svg"
                        :alt="$t('library.template.title')"
                    />
                    <span class="libraries-of-universe-label">
                        {{ $t("library.tabs.templates") }}
                    </span>
                </span>
                <template-library />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import TemplateLibrary from "../components/template-library/template-library";
import ComponentLibrary from "../components/component-library/component-library";
import LinkModelLibrary from "../components/link-model-library/link-model-library";

export default {
    name: "LibrariesOfUniverse",

    components: {
        ComponentLibrary,
        LinkModelLibrary,
        TemplateLibrary,
    },

    props: {
        worldId: String,
        boardId: String,
        libraryName: String,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: this.$view,
        };
    },

    beforeCreate() {
        this.$store.commit(`app/librariesOfUniverse/defaultActiveTab`);
    },
    beforeDestroy() {
        this.$store.commit(`app/librariesOfUniverse/noActiveTab`);
    },

    computed: {
        $view() {
            return {
                name: this.$options.name,
                worldId: this.worldId,
                boardId: this.boardId,
            };
        },
        tab() {
            return this.$store.getters[
                `app/librariesOfUniverse/activeTabOptions`
            ];
        },
        activeTab: {
            get() {
                return this.$store.getters[`app/librariesOfUniverse/activeTab`];
            },
            set(value) {
                this.$store.commit(`app/librariesOfUniverse/activeTab`, value);
            },
        },
    },
};
</script>

<style scoped>
#btn-close-libraries-of-universe {
    z-index: var(--max-z-index);
}

#libraries-of-universe >>> .el-tabs__header {
    position: absolute;
    left: 0;
    top: 0px;
    width: 20%;
    height: 100%;

    padding-top: 80px;

    border-bottom: 1px solid #dedee2;
    border-right: 4px solid #dedee2;
}

#libraries-of-universe-title {
    position: relative;
    left: 20px;
    top: 30px;
    color: var(--style-color-grey);
    font-weight: 700;
    font-size: 16px;
}

#libraries-of-universe >>> .el-tabs__item {
    font-size: 0.8em;
    font-weight: 600;
    text-align: left;
}

#libraries-of-universe >>> .el-tabs__item span {
    display: flex;
    align-items: center;
}

#libraries-of-universe >>> .el-tabs__item.is-active {
    background: rgba(241, 241, 244, 0.6);
    color: #000;
}

#libraries-of-universe >>> .el-tabs--left .el-tabs__nav-wrap.is-left::after {
    width: 0px;
}

#libraries-of-universe >>> .el-tabs--left .el-tabs__active-bar.is-left {
    width: 4px;
}

#libraries-of-universe >>> .el-tabs__content {
    height: 85vh;
    margin-left: 20%;
    padding: 30px;
}

#libraries-of-universe >>> .el-tabs__item img {
    width: 20px;
}

.libraries-of-universe-label {
    margin-left: 15px;
}
</style>
