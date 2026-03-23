<!--
    This component represents a position allowing to place an object on a board.
    Ce component représente une position permettant de placer un objet sur un board.
-->
<template>
    <vue-drag-resize
        :id="$vnode.key /* used to retrive drawing-view during docx export */"
        :class="{
            'mode-normal': isDraggable && boardPositionDragResize_hasDragGrant,
            'mode-link': isLinkable,
            'no-pointer-events':
                boardPositionDragResize_isBeingMoveOrResizedBySomeoneElse,
        }"
        :parentW="boardSize.width"
        :parentH="boardSize.height"
        :isActive="isActive && boardPosition_hasUpdateGrant"
        @clicked="boardPositionSelect_onClicked"
        @mousedown.native="onClick"
        @touchstart.native="onClick"
        :x="position.left"
        :y="position.top"
        :z="position.zIndex"
        :isDraggable="isDraggable && boardPositionDragResize_hasDragGrant"
        @dragging="boardPositionDragResize_onDragging"
        @dragstop="boardPositionDragResize_onDragstop"
        :w="position.width"
        :h="position.height"
        :isResizable="
            isResizable &&
            boardPositionDragResize_hasResizeGrant &&
            !boardPositionDragResize_isTooSmallToResize
        "
        @resizing="boardPositionDragResize_onResizing"
        @resizestop="boardPositionDragResize_onResizestop"
        :snapToGrid="grid.gridEnabled"
        :gridX="grid.gridX"
        :gridY="grid.gridY"
    >
        <object-view
            v-if="isMounted"
            class="object-view"
            :key="objectId"
            :style="rotationStyle"
            :componentId="componentId"
            :positionId="$vnode.key"
        />
    </vue-drag-resize>
</template>
<script>
import app from "../../conf/app";
import html from "../../utils/html";

import BoardPositionDragResize from "./board-position-drag-resize";
import BoardPositionSelect from "./board-position-select";

import ObjectView from "../object-view/object-view";
import VueDragResize from "../../lib/vue-drag-resize";

export default {
    name: "BoardPosition",

    mixins: [BoardPositionDragResize, BoardPositionSelect],

    components: {
        VueDragResize,
        ObjectView,
    },

    props: {
        isActive: Boolean,
    },
    inject: ["$view"],

    data() {
        return {
            isMounted: false,
        };
    },
    created() {
        // Update linked objects
        const linkIds = this.$store.getters["linkAlive/asArray"]
            .filter((link) => {
                return link.objects.some(
                    (object) => object.objectId === this.objectId
                );
            })
            .map((link) => link.linkId);

        if (linkIds.length) {
            for (let linkId of linkIds) {
                this.$store.dispatch("linkAlive/read", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    linkId,
                });
            }
        }
    },
    mounted() {
        this.isMounted = true;
    },

    computed: {
        boardPosition_hasUpdateGrant() {
            return this.boardPositionDragResize_hasDragGrant;
        },

        boardSize() {
            return app.board.size;
        },
        position() {
            try {
                return this.$store.getters[`positionAlive/byId`](
                    this.$vnode.key
                ).data;
            } catch {
                return {};
            }
        },
        grid() {
            const board = this.$store.getters["boardAlive/byId"](
                this.$view.boardId
            );
            return {
                gridEnabled: board?.data?.gridEnabled,
                gridX: board?.data?.gridX,
                gridY: board?.data?.gridY,
            };
        },

        objectId() {
            try {
                return this.$store.getters[`positionAlive/byId`](
                    this.$vnode.key
                ).objectId;
            } catch {
                return undefined;
            }
        },
        componentId() {
            try {
                return this.$store.getters[`positionAlive/byId`](
                    this.$vnode.key
                ).componentId;
            } catch {
                return undefined;
            }
        },

        isDraggable() {
            return (
                this.$store.getters[`app/objectsInBoard/modeIsNormal`] ||
                this.$store.getters[`app/objectsInBoard/modeIsSelect`]
            );
        },
        isResizable() {
            return (
                this.$store.getters[`app/objectsInBoard/modeIsNormal`] ||
                this.$store.getters[`app/objectsInBoard/modeIsSelect`]
            );
        },
        isLinkable() {
            return this.$store.getters[`app/objectsInBoard/modeIsLink`];
        },

        rotationStyle() {
            return (
                {
                    90: {
                        height: `${this.position.width}px`,
                        width: `${this.position.height}px`,
                        transform: "rotate(90deg) translateY(-100%)",
                        transformOrigin: "top left",
                    },
                    180: {
                        transform: "rotate(180deg)",
                    },
                    270: {
                        height: `${this.position.width}px`,
                        width: `${this.position.height}px`,
                        transform: "rotate(270deg) translateX(-100%)",
                        transformOrigin: "top left",
                    },
                }[this.position.rotation] ?? {}
            );
        },
    },

    methods: {
        // Simple click event
        onClick: function (evt) {
            // On click outside input, textarea, unfocus input, textarea
            if (!html.interactable(evt.target || evt.srcElement)) {
                document.getElementById("panzoom").focus();
            }

            // Close any drawer
            this.$store.commit("app/objectsInBoard/setDrawerNone");
        },
    },
};
</script>
<style scoped>
/* object render */
.object-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.no-pointer-events {
    pointer-events: none;
}

/* drag */
.vdr.mode-normal {
    cursor: move;
}

/* link */
.vdr.mode-link {
    cursor: pointer;
}
.mode-link:hover >>> .object-view:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    outline-width: 4px;
    background: var(--color-link-alpha);
}

/* selection colorization */
.active:before {
    outline-width: 4px !important;
    outline-style: solid !important;
}
.active.mode-normal:before {
    pointer-events: none;
    outline-color: var(--color-select, #2196f3);
}
.active.mode-link:before {
    outline-color: var(--color-link);
}
</style>
