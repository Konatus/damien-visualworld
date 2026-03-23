<!--
        This component represents the toolbar that may act on objects.
        Ce composant représente la barre d'outils qui peut agir sur des objets.
-->
<template>
    <el-menu
        id="object-toolbar"
        class="vw-flex-row vw-flex-center"
        mode="horizontal"
    >
        <object-toolbar-component />
        <template v-if-granted:for="['object/update', $view]">
            <object-toolbar-data />
        </template>
        <el-divider direction="vertical" />
        <template v-if-granted:for="['position-alive/duplicate', $view]">
            <object-toolbar-duplication />
        </template>
        <template
            v-if-granted:forOne="[
                'position-alive/update-front',
                'position-alive/update-back',
                $view,
            ]"
        >
            <object-toolbar-align />
        </template>
        <el-divider direction="vertical" />
        <template v-if-granted:for="['object/update', $view]">
            <object-toolbar-color />
        </template>
        <el-divider direction="vertical" />
        <template
            v-if-granted:forOne="[
                'position-alive/remove-front',
                'position-alive/remove-back',
                $view,
            ]"
        >
            <object-toolbar-deletion />
        </template>
        <el-divider direction="vertical" />
        <template
            v-if-granted:forOne="[
                'position-alive/update-front',
                'position-alive/update-back',
                'position-alive/unset-back',
                'position-alive/set-back',
                $view,
            ]"
        >
            <object-toolbar-more />
        </template>
        <el-divider direction="vertical" />
        <template v-show-granted:for="['jira-issue/create', $view]">
            <object-toolbar-jira-sync />
        </template>
    </el-menu>
</template>
<script>
import ObjectToolbarAlign from "./object-toolbar-align.vue";
import ObjectToolbarColor from "./object-toolbar-color.vue";
import ObjectToolbarComponent from "./object-toolbar-component.vue";
import ObjectToolbarData from "./object-toolbar-data.vue";
import ObjectToolbarDuplication from "./object-toolbar-duplication.vue";
import ObjectToolbarDeletion from "./object-toolbar-deletion.vue";
import ObjectToolbarMore from "./object-toolbar-more.vue";
import ObjectToolbarJiraSync from "./object-toolbar-jira-sync.vue";
export default {
    name: "ObjectToolbar",
    components: {
        ObjectToolbarAlign,
        ObjectToolbarColor,
        ObjectToolbarComponent,
        ObjectToolbarData,
        ObjectToolbarDuplication,
        ObjectToolbarDeletion,
        ObjectToolbarMore,
        ObjectToolbarJiraSync,
    },
    inject: ["$view"],
};
</script>
