<!--
    This component displays an icon representing a template of board.
    Ce component affiche une icône représentant un modèle de tableau.
-->
<template>
    <div>
        <div class="template-name" :title="name">
            {{ name }}
        </div>

        <img
            class="template-mini"
            :src="template.data.screenshot"
            :alt="$t('library.template.screenshot')"
        />
        <img
            class="template-preview"
            :src="template.data.screenshot"
            :alt="$t('library.template.screenshot')"
            :style="ghostStyle"
        />

        <slot />
    </div>
</template>
<script>
export default {
    name: "TemplateIcon",

    props: {
        boardId: String,
        scaleOfBoard: Number,
    },
    inject: ["$view"],

    data() {
        return {
            screenshotWidth: 0,
        };
    },

    created() {
        const img = new Image();
        img.onload = () => {
            this.screenshotWidth = img.naturalWidth;
        };
        img.src = this.template.data.screenshot;
    },

    computed: {
        // Definition of template, from the store
        template() {
            try {
                return this.$store.getters[`boardAlive/byId`](this.boardId);
            } catch (e) {
                return [];
            }
        },

        //
        scale() {
            try {
                return (
                    (this.scaleOfBoard * this.template.data.usedArea.width) /
                    this.screenshotWidth
                );
            } catch (e) {
                return 1;
            }
        },

        // Style of the ghost: shows the default size
        ghostStyle() {
            return {
                transform: `scale( ${this.scale} )`,
            };
        },

        // Name of the template
        name() {
            try {
                return this.$store.getters[`boardAlive/nameByyId`](
                    this.boardId
                );
            } catch (e) {
                return this.boardId;
            }
        },
    },
};
</script>
<style scoped>
.template-preview {
    box-sizing: border-box;
}
</style>
