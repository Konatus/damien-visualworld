<template>
    <div>
        <el-button
            @click="$emit('close')"
            :style="{ borderColor: 'darkgrey', zIndex: 1 }"
            size="mini"
            id="btn-close-world-edit"
            class="modal-btn-close"
            icon="el-icon-close"
            type="info"
        />

        <pattern-restoration class="app-wrapper" item="world" />
    </div>
</template>

<script>
// Components
import PatternRestoration from "../components/pattern-restoration/pattern-restoration";

// Vue integration
export default {
    name: "DeletedWorldsOfUniverse",

    components: {
        PatternRestoration,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: this.$view,
        };
    },

    computed: {
        $view() {
            return {
                name: this.$options.name,
                worldId: this.worldId,
            };
        },
    },
};
</script>
