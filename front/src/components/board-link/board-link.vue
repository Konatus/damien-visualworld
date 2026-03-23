<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        class="board-link"
        v-if="link"
        :width="wrapperSize.width"
        :height="wrapperSize.height"
        :style="{
            zIndex: zIndexMax,
            cursor: hasUpdateGrant && !isJiraLinkModel ? 'pointer' : 'unset',
        }"
    >
        <link-view
            :linkId="link.linkId"
            :linkModelData="isBeingCreated ? this.link.data : undefined"
            :isSelectable="
                isActiveLayer &&
                isSelectable &&
                !isJiraLinkModel &&
                hasUpdateGrant
            "
            :isSelected="isSelected"
            :objectAndPosition="objectAndPosition"
            @click="onLinkClick"
        />
    </svg>
</template>
<script>
import app from "../../conf/app";
import LinkView from "../link-view/link-view.vue";
export default {
    name: "BoardLink",

    components: {
        LinkView,
    },

    props: {
        link: Object,
        isBeingCreated: Boolean,
        isSelectable: Boolean,
        isSelected: Boolean,
    },
    inject: ["$view"],

    data() {
        return {
            refreshTitle: 0,
        };
    },

    computed: {
        hasUpdateGrant() {
            return this.$store.getters[`connectionMe/isGrantedForAll`](
                ["link-alive/update", "object/update"],
                this.$view
            );
        },
        isActiveLayer() {
            return (
                this.$store.getters[`app/objectsInBoard/activeLayer`] ===
                this.$parent.$vnode.key
            );
        },
        isJiraLinkModel() {
            return !!Object.values(app.jiraLinkModel).includes(
                this.link.linkModelId
            );
        },

        // ObjectLink & position to be linked
        objectAndPosition() {
            const out = [];
            this.link.objects.forEach((object, index) => {
                // Pointer position provided by board-layer-link-create
                if (object.position) {
                    out.push({ index, object, position: object.position });
                }

                // General case: must look for position from the objectId
                else {
                    const positions = this.$store.getters[
                        `positionAlive/byObjectId`
                    ](object.objectId);
                    for (let position of positions) {
                        out.push({ index, object, position });
                    }
                }
            });
            return out;
        },

        // Style...
        wrapperSize() {
            // Size copied from board, necessary for png export
            return app.board.size;
        },
        zIndexMax() {
            // z-index of the link is the one of the higher position, so link may be hidden if its targetted object may also be hidden
            return Math.max(
                ...this.objectAndPosition.map(
                    ({ position }) => position.data.zIndex
                )
            );
        },
    },

    methods: {
        onLinkClick(evt) {
            if (this.hasUpdateGrant && !this.isJiraLinkModel) {
                this.$emit("boardLink_clicked", {
                    id: this.link.linkId,
                    originalEvent: evt,
                });
            }
        },
    },
};
</script>
<style scoped>
.board-link {
    position: absolute;
    overflow: visible;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>
