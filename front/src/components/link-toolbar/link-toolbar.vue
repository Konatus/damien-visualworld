<!--
        This component represents the toolbar that may act on links.
        Ce composant représente la barre d'outils qui peut agir sur des liens.
-->
<template>
    <el-menu
        id="link-toolbar"
        class="vw-flex-row vw-flex-center"
        mode="horizontal"
    >
        <link-toolbar-model />
        <div
            class="vw-flex-row vw-flex-center"
            v-if-granted:for="['link-alive/update', $view]"
        >
            <link-toolbar-label />
            <el-divider direction="vertical" />
            <template v-if="areAllDefaultLinks">
                <link-toolbar-property property="size" />
                <link-toolbar-property property="dash" />
                <link-toolbar-property property="curve" />
                <link-toolbar-color />
                <el-divider direction="vertical" />
                <link-toolbar-property property="anchor-start" />
                <link-toolbar-invert />
                <link-toolbar-property property="anchor-end" />
            </template>
            <template v-else>
                <link-toolbar-invert />
            </template>
        </div>
        <el-divider direction="vertical" />
        <template v-if-granted:for="['link-alive/remove', $view]">
            <link-toolbar-deletion />
        </template>
    </el-menu>
</template>
<script>
import app from "../../conf/app.js";
import LinkToolbarColor from "./link-toolbar-color.vue";
import LinkToolbarDeletion from "./link-toolbar-deletion.vue";
import LinkToolbarInvert from "./link-toolbar-invert.vue";
import LinkToolbarLabel from "./link-toolbar-label.vue";
import LinkToolbarModel from "./link-toolbar-model.vue";
import LinkToolbarProperty from "./link-toolbar-property.vue";
export default {
    name: "LinkToolbar",
    components: {
        LinkToolbarColor,
        LinkToolbarDeletion,
        LinkToolbarInvert,
        LinkToolbarLabel,
        LinkToolbarModel,
        LinkToolbarProperty,
    },
    inject: ["$view"],
    computed: {
        areAllDefaultLinks() {
            const linkIds =
                this.$store.getters[`app/objectsInBoard/selectedLinkIds`];
            const modelIds = linkIds.map(
                (linkId) =>
                    this.$store.getters[`linkAlive/byId`](linkId)?.linkModelId
            );
            return modelIds.every(
                (modelId) => modelId === app.visualWorldComponent.VW_default
            );
        },
    },
};
</script>
