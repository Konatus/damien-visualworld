<!--
    This component represents a layer of a board.
    Ce composant représente un calque d'un tableau.
-->
<template>
    <div
        class="board-layer"
        @mousedown="onDown"
        @mousemove="onMove"
        @mouseup="onUp"
        @touchstart="onDown"
        @touchmove="onMove"
        @touchend="onUp"
        @touchcancel="onUp"
        @drop.prevent="boardLayerUpload_onDrop"
        @dragover.prevent
    >
        <selection-by-drag
            v-if="!modeIsLink"
            @selectionByDrag_clicked="boardLayerSelect_reset"
            @selectionByDrag_dragged="boardLayerSelect_setPositionByArea"
        />
        <selection-view
            :isUserSelection="true"
            :positionIds="selectedPositionIds"
        />

        <board-link
            v-for="link of links"
            :key="link.linkId"
            :link="link"
            :isSelected="boardLayerSelect_getLink[link.linkId]"
            :isSelectable="true"
            @boardLink_clicked="boardLayerSelect_setLink"
        />

        <board-position
            ref="board-position"
            v-for="positionId of positionIds"
            :key="positionId"
            :class="{ linked: linkedPositionIds.includes(positionId) }"
            :isActive="boardLayerSelect_getPosition[positionId]"
            @boardPositionSelect_clicked="boardLayerSelect_setPosition"
            @boardPositionDragResize_dragstart="
                boardLayerMultipleDrag_dragstart
            "
            @boardPositionDragResize_dragging="boardLayerMultipleDrag_dragging"
            @boardPositionDragResize_dragstop="boardLayerMultipleDrag_dragstop"
            @boardPositionDragResize_resizestart="
                boardLayerMultipleDrag_resizestart
            "
            @boardPositionDragResize_resizing="boardLayerMultipleDrag_resizing"
            @boardPositionDragResize_resizestop="
                boardLayerMultipleDrag_resizestop
            "
        />
        <selection-view
            v-for="(data, email, index) in {
                ...boardLayerEdition_delayed,
                ...boardLayerMoves_delayedMoves,
            }"
            :key="email"
            :email="email"
            :edition="data.edition"
            :isUserSelection="false"
            :positionIds="data.positions"
            :index="index"
        />

        <drawing-view
            :class="{ 'no-pointer-events': !boardLayerDrawing_paths.length }"
            v-if="modeIsDrawing"
            :paths="boardLayerDrawing_paths"
            :absolute="true"
        />

        <board-link
            id="board-layer-link-create"
            :link="boardLayerLinkCreate_ghostLink"
            :isBeingCreated="true"
            v-if="boardLayerLinkCreate_ghostLink"
        />
    </div>
</template>

<script>
import BoardLayerDrawing from "./board-layer-drawing.vue";
import BoardLayerJiraLink from "./board-layer-jira-link.vue";
import BoardLayerKeyBoardMove from "./board-layer-keyboard-move";
import BoardLayerLinkCreate from "./board-layer-link-create";
import BoardLayerMoves from "./board-layer-moves";
import BoardLayerMultipleDrag from "./board-layer-multiple-drag";
import BoardLayerSelect from "./board-layer-select";
import BoardLayerUpload from "./board-layer-upload";
import ComponentDockCreateObject from "../component-dock/component-dock-create-object";

import SelectionByDrag from "../selection-by-drag/selection-by-drag";
import SelectionView from "../selection-view/selection-view";
import BoardPosition from "../board-position/board-position";
import BoardLink from "../board-link/board-link";
import DrawingView from "../drawing-view/drawing-view.vue";

import html from "../../utils/html";
export default {
    name: "BoardLayer",

    mixins: [
        BoardLayerDrawing,
        BoardLayerJiraLink,
        BoardLayerKeyBoardMove,
        BoardLayerLinkCreate,
        BoardLayerMoves,
        BoardLayerMultipleDrag,
        BoardLayerSelect,
        BoardLayerUpload,
        ComponentDockCreateObject,
    ],

    components: {
        SelectionByDrag,
        SelectionView,
        BoardPosition,
        BoardLink,
        DrawingView,
    },

    props: {
        isBackground: Boolean,
    },
    inject: ["$view"],
    data() {
        return {
            preventObjectDelete: false,
        };
    },
    watch: {
        // These data must be saved in store to be shared with toolbar
        selectedLinkIds() {
            this.$store.commit(
                `app/objectsInBoard/selectedLinkIds`,
                this.selectedLinkIds
            );
        },
        selectedPositionIds() {
            this.$store.commit(
                `app/objectsInBoard/selectedPositionIds`,
                this.selectedPositionIds
            );
        },
        dragInProgress() {
            this.$store.commit(
                `app/objectsInBoard/dragInProgress`,
                this.dragInProgress
            );
        },
    },

    computed: {
        fieldData() {
            return this.$store.getters[`app/objectsInBoard/fieldEditedByUser`];
        },

        boardLayerEdition_delayed() {
            const user = {};
            for (const field in this.fieldData) {
                const data = this.fieldData[field];
                user[data.user] = {
                    positions: [data.positionId],
                    edition: true,
                };
            }
            return user;
        },

        // Hidden models
        hiddenItems() {
            return (
                this.$store.getters["boardAlive/hiddenItems"](
                    this.$view.boardId
                ) || []
            );
        },
        positionsOfAllLayers() {
            const hiddenComponents = this.hiddenItems?.components || [];
            return (
                this.$store.getters[`positionAlive/asArray`].filter(
                    (position) =>
                        !hiddenComponents.includes(position?.componentId)
                ) || []
            );
        },

        // Positions of the layer
        positions() {
            return this.positionsOfAllLayers.filter(
                (position) =>
                    position?.protect?.isBackground == this.isBackground
            );
        },
        positionIds() {
            return this.positions
                .map((positions) => positions.positionId)
                .filter(
                    (positionId) =>
                        positionId !==
                        this.boardLayerDrawing_position?.positionId
                );
        },

        // Links
        links() {
            const activeLayer =
                this.$store.getters[`app/objectsInBoard/activeLayer`];
            const hiddenLinkModels = this.hiddenItems?.linkModels || [];
            return this.$store.getters[`linkAlive/displayable`]
                .filter((link) => !hiddenLinkModels.includes(link?.linkModelId))
                .filter((link) => {
                    const objectIds = link.objects.map(
                        (object) => object.objectId
                    );
                    const positionsOfAllLayers =
                        this.positionsOfAllLayers.filter((position) => {
                            return objectIds.includes(position.objectId);
                        });
                    if (positionsOfAllLayers.length < 2) {
                        return false;
                    }
                    const positions = positionsOfAllLayers.filter(
                        (position) =>
                            position.protect.isBackground === this.isBackground
                    );
                    return (
                        positions.length >= 2 ||
                        (positions.length == 1 &&
                            this.$vnode.key === activeLayer)
                    );
                });
        },
        linkedPositionIds() {
            const linkedObjects = {};
            for (let link of this.links) {
                for (let object of link.objects) {
                    linkedObjects[object.objectId] = object.objectId;
                }
            }
            const linkedPositions = {};
            for (let objectId in linkedObjects) {
                const positions = this.positions.filter((position) => {
                    return position.objectId === objectId;
                });
                for (let position of positions) {
                    linkedPositions[position.positionId] = position.positionId;
                }
            }
            return Object.values(linkedPositions);
        },

        // Current mode
        modeIsLink() {
            return this.$store.getters[`app/objectsInBoard/modeIsLink`];
        },
        modeIsDrawing() {
            return this.$store.getters[`app/objectsInBoard/modeIsDrawing`];
        },

        // Ids of selected positions & components
        selectedPositionIds() {
            return Object.keys(this.boardLayerSelect_getPosition);
        },
        selectedLinkIds() {
            return Object.keys(this.boardLayerSelect_getLink);
        },

        // Drag in progress by current user
        dragInProgress() {
            return !!Object.keys(this.boardLayerMultipleDrag_selection).length;
        },
        hasGrant() {
            // TODO: is the same check always relevant? is a black list a good idea?
            return this.$store.getters[`connectionMe/isGrantedFor`](
                ["position-alive/create-front"],
                this.$view
            );
        },
    },

    mounted() {
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    },

    destroyed() {
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
    },

    methods: {
        onDown(evt) {
            if (this.modeIsDrawing) {
                evt.preventDefault();
                evt.stopPropagation();
                this.boardLayerDrawing_onStart(evt);
            } else if (this.modeIsLink) {
                this.boardLayerSelect_doCancelCreateLink(evt);
            }
        },
        onMove(evt) {
            this.boardLayerUpload_onMove(evt);
            if (this.modeIsDrawing) {
                evt.preventDefault();
                evt.stopPropagation();
                this.boardLayerDrawing_onMove(evt);
            } else if (this.modeIsLink) {
                this.boardLayerLinkCreate_onMove(evt);
            }
        },
        onUp(evt) {
            if (this.modeIsDrawing) {
                evt.preventDefault();
                evt.stopPropagation();
                this.boardLayerDrawing_onStop(evt);
            }
        },

        // Actions associated with keyboard
        onKeyDown(evt) {
            // Exit if target is an interactable node
            if (
                html.interactable(evt.target || evt.srcElement) ||
                this.preventObjectDelete
            ) {
                this.preventObjectDelete = true;
                return;
            }

            // Ctrl+A to select all objects in board layer
            if (
                (evt.ctrlKey || evt.metaKey) &&
                evt.keyCode === 65 &&
                this.boardLayerSelect_activeLayer === this.$attrs.id
            ) {
                evt.preventDefault();
                this.positionIds.forEach((positionId) => {
                    this.$set(
                        this.boardLayerSelect_getPosition,
                        positionId,
                        true
                    );
                });
            }
            // Exit if no position is selected, it's the case of the inactive layer
            if (
                !this.selectedPositionIds.length &&
                !this.selectedLinkIds.length
            ) {
                return;
            }

            switch (evt.keyCode) {
                // Delete position or link
                case 8:
                    this.$store.commit(
                        `app/objectsInBoard/event`,
                        this.selectedPositionIds.length
                            ? "objectToolbarDeletion"
                            : "linkToolbarDeletion"
                    );
                    break; // backspace
                case 46:
                    this.$store.commit(
                        `app/objectsInBoard/event`,
                        this.selectedPositionIds.length
                            ? "objectToolbarDeletion"
                            : "linkToolbarDeletion"
                    );
                    break; // delete

                case 27:
                    this.boardLayerSelect_reset();
                    break; // Escape key

                // Move position
                case 37:
                    this.boardLayerKeyboardMove_do({ dx: -1, dy: 0 });
                    break; // left  arrow
                case 38:
                    this.boardLayerKeyboardMove_do({ dx: 0, dy: -1 });
                    break; // up    arrow
                case 39:
                    this.boardLayerKeyboardMove_do({ dx: 1, dy: 0 });
                    break; // right arrow
                case 40:
                    this.boardLayerKeyboardMove_do({ dx: 0, dy: 1 });
                    break; // down  arrow
            }
        },
        onKeyUp(evt) {
            this.preventObjectDelete = false;
            // Exit if target is an interactable node
            if (html.interactable(evt.target || evt.srcElement)) {
                return;
            }

            // Exit if focus in a object-view
            if (document.body.classList.value === "v--modal-block-scroll") {
                return;
            }
            // Exit if no position or link is selected, it's the case of the inactive layer
            if (!this.selectedPositionIds.length) {
                return;
            }

            switch (evt.keyCode) {
                // Move position
                case 37:
                    this.boardLayerKeyboardMove_stop({ dx: -1, dy: 0 });
                    break; // left  arrow
                case 38:
                    this.boardLayerKeyboardMove_stop({ dx: 0, dy: -1 });
                    break; // up    arrow
                case 39:
                    this.boardLayerKeyboardMove_stop({ dx: 1, dy: 0 });
                    break; // right arrow
                case 40:
                    this.boardLayerKeyboardMove_stop({ dx: 0, dy: 1 });
                    break; // down  arrow
            }
        },
    },
};
</script>

<style scoped>
* {
    --field-border-width: 1px;
}

.vdr >>> .el-input__inner,
.vdr >>> .el-textarea__inner {
    border: none;
}

.vdr.inactive >>> .el-form-item__content,
.vdr.inactive >>> button,
.vdr.inactive >>> input,
.vdr.inactive >>> a/* ,
.vdr.active.dragging >>> button,
.vdr.active.dragging >>> input,
.vdr.active.dragging >>> a */ {
    pointer-events: none;
    border: var(--field-border-width) solid transparent;
    box-sizing: border-box;
}

.vdr.active >>> .not-static-fit.el-form-item__content {
    border: var(--field-border-width) solid var(--style-color-grey);
    cursor: text;
    border-radius: var(--style-border-radius);
    box-sizing: border-box;
}

.vdr.active >>> .el-form-item__content_disabled {
    background: none !important;
    border: none !important;
}

.vdr.active >>> .el-form-item__content:focus {
    border-color: var(--style-color-lightblue);
}

.vdr.inactive >>> .el-input__inner,
.vdr.inactive >>> .el-textarea__inner,
.vdr.active >>> .el-input__inner,
.vdr.active >>> .el-textarea__inner {
    background: none;
    border: none !important;
    border-radius: calc(var(--style-border-radius) - var(--field-border-width));
}

.vdr.active >>> .el-input__inner:focus {
    background: var(--style-color-white) !important;
    border: var(--field-border-width) solid var(--style-color-lightblue);
    box-shadow: var(--shadow-inset-focus);
}

.vdr.active >>> .el-input__inner,
.vdr.active >>> .el-textarea__inner {
    background: rgba(255, 255, 255, 0.4);
}

.vdr.active >>> .el-input__inner:focus,
.vdr.active >>> .el-textarea__inner:focus,
.vdr.active >>> .el-form-item__content.focused {
    background: var(--style-color-white) !important;
    color: initial;
    border: var(--field-border-width) solid var(--style-color-lightblue);
    box-shadow: var(--shadow-inset-focus);
}

.vdr >>> input:disabled.el-input__inner,
.vdr >>> textarea:disabled.el-textarea__inner {
    cursor: move;
    background: none;
    color: #6d7385ed;
}

.no-pointer-events {
    pointer-events: none;
}
</style>
