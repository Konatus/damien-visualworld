<template>
    <pattern-home>
        <template #side-start>
            <world-list />
        </template>
        <template #side-end>
            <btn-connection-me />
        </template>
        <template #alert>
            <span v-show-granted:demo>alert</span>
        </template>
        <template #default>
            <board-list />
        </template>
        <template #foot-end>
            <btn-info />
        </template>
    </pattern-home>
</template>
<script>
import BoardList from "../components/board-list/board-list";
import BtnConnectionMe from "../components/btn-connection-me/btn-connection-me";
import BtnInfo from "../components/btn-info/btn-info";
import PatternHome from "../components/pattern-home/pattern-home";
import WorldList from "../components/world-list/world-list";
export default {
    name: "WorldsOfUniverse",

    components: {
        BoardList,
        BtnConnectionMe,
        BtnInfo,
        PatternHome,
        WorldList,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: {
                name: this.$options.name,
            },
        };
    },
};
</script>
