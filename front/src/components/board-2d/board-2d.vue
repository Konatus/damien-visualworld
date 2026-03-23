<!--
    This component represents a board.
    Ce composant représente un board.
-->
<template>
    <div>
        <el-empty
            id="board-2d-empty"
            v-if="!board2dCenterOnOpen_hasBeenDone"
            :description="$t(`loading`)"
        />
        <pan-zoom id="panzoom" ref="panzoom" :options="app.board.panZoom">
            <div
                id="board-2d"
                :class="{
                    panable:
                        board2dCenterOnOpen_hasBeenDone &&
                        (modeIsNormal || modeIsLink),
                    selectable: board2dCenterOnOpen_hasBeenDone && modeIsSelect,
                    'drawable-pencil':
                        board2dCenterOnOpen_hasBeenDone &&
                        modeIsDrawing &&
                        !drawingEraser,
                    'drawable-eraser':
                        board2dCenterOnOpen_hasBeenDone &&
                        modeIsDrawing &&
                        drawingEraser,
                }"
                :style="{
                    opacity: board2dCenterOnOpen_hasBeenDone ? 1 : 0,
                    width: `${app.board.size.width}px`,
                    height: `${app.board.size.height}px`,
                }"
                v-show-granted:for="['position-alive/list', $view]"
            >
                <grid-view
                    id="gridground"
                    v-if="grid.gridEnabled && grid.gridVisible"
                    :colSize="grid.gridX"
                    :rowSize="grid.gridY"
                />

                <board-layer
                    id="background"
                    key="background"
                    ref="boardLayerBackground"
                    :isBackground="true"
                    :class="{
                        'board-2d-inactive-layer': !activeLayerIsBackground,
                    }"
                />

                <board-layer
                    id="foreground"
                    key="foreground"
                    ref="boardLayerForeground"
                    :isBackground="false"
                    :class="{
                        'board-2d-inactive-layer': !activeLayerIsForeground,
                        'board-2d-transparent-layer': !activeLayerIsForeground,
                    }"
                />

                <board-toolbar :show="!dragInProgress && !selectInProgress" />
            </div>
        </pan-zoom>
    </div>
</template>

<script>
import app from "../../conf/app";

import Board2dCenterOnOpen from "./board-2d-center-on-open";

import PanZoom from "../../lib/pan-zoom";
import GridView from "../grid-view/grid-view";
import BoardLayer from "../board-layer/board-layer";
import BoardToolbar from "../board-toolbar/board-toolbar";

export default {
    name: "Board-2d",

    mixins: [Board2dCenterOnOpen],

    components: {
        PanZoom,
        GridView,
        BoardLayer,
        BoardToolbar,
    },

    inject: ["$view"],

    computed: {
        app() {
            return app;
        },

        grid() {
            const scale = this.$store.getters[`panzoom/scale`];
            const board = this.$store.getters[`boardAlive/byId`](
                this.$view.boardId
            );
            return {
                gridEnabled: board?.data?.gridEnabled,
                gridVisible:
                    scale * Math.min(board?.data?.gridX, board?.data?.gridY) >
                    5,
                gridX: board?.data?.gridX,
                gridY: board?.data?.gridY,
            };
        },

        // Is active layer the foreground or the background ?
        activeLayerIsBackground() {
            return this.$store.getters[
                `app/objectsInBoard/activeLayerIsBackground`
            ];
        },
        activeLayerIsForeground() {
            return this.$store.getters[
                `app/objectsInBoard/activeLayerIsForeground`
            ];
        },

        // Is any drag (or resize) or any selection by drag in progress inside any layer
        dragInProgress() {
            return this.$store.getters[`app/objectsInBoard/dragInProgress`];
        },
        selectInProgress() {
            return this.$store.getters[`app/objectsInBoard/selectInProgress`];
        },

        // What is the active mode?
        modeIsNormal() {
            return this.$store.getters[`app/objectsInBoard/modeIsNormal`];
        },
        modeIsSelect() {
            return this.$store.getters[`app/objectsInBoard/modeIsSelect`];
        },
        modeIsLink() {
            return this.$store.getters[`app/objectsInBoard/modeIsLink`];
        },
        modeIsDrawing() {
            return this.$store.getters[`app/objectsInBoard/modeIsDrawing`];
        },

        drawingEraser() {
            return this.$store.getters[`app/objectsInBoard/drawingEraser`];
        },
    },
    created() {
        this.$store.commit(`app/objectsInBoard/setModeNormal`);
        this.$store.commit(`app/objectsInBoard/selectedPositionIds`, []);
        this.$store.commit(`app/objectsInBoard/selectedLinkIds`, []);
        // Set Default link styles saved in localStorage
        const latestLinkModelsInWorld = window.localStorage.getItem(
            this.$view.worldId
        );
        if (
            JSON.parse(latestLinkModelsInWorld) &&
            JSON.parse(latestLinkModelsInWorld)[this.$view.boardId]
        ) {
            this.$store.commit(
                "latestLinkModel/set",
                JSON.parse(latestLinkModelsInWorld)[this.$view.boardId]
            );
        } else {
            this.$store.commit("latestLinkModel/reset");
        }
    },
};
</script>
<style>
/* Positions */
#board-2d-empty,
#panzoom,
#background,
#foreground {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: absolute;
}
#board-2d {
    position: relative;
    background: var(--layer-background);
}
#gridground {
    z-index: 1;
}
#background {
    z-index: 2;
}
#foreground {
    z-index: 3;
}

/* Design */
#board-2d-empty .el-empty__description p {
    color: var(--style-color-lightgrey);
}
#board-2d {
    border: 2px solid var(--style-color-lightgrey);
    box-shadow: 0 10px 40px 0 rgba(23, 30, 54, 0.2);
    border-radius: 40px;
}
#foreground .component {
    box-shadow: 0px 0px 8px rgb(0 0 0 / 50%);
}
#foreground > .linked > .component,
#foreground .component:hover {
    box-shadow: 0px 0px 8px rgb(0 0 0 / 50%) !important; /* important: so not overwritable by component-edit's custom CSS */
}

/* Inactive layer */
.board-2d-inactive-layer {
    pointer-events: none;
}
.board-2d-transparent-layer {
    opacity: 0.3;
}

/* Cursor management (depending on mode) */
#board-2d.panable {
    cursor: grab;
}
#board-2d.panable:active {
    cursor: grabbing;
}
#board-2d.selectable {
    cursor: crosshair;
}
#board-2d.drawable-pencil {
    cursor: url("../../assets/icons/cursor/pencil.svg") 2 16, pointer;
}
#board-2d.drawable-eraser {
    cursor: url("../../assets/icons/cursor/eraser.svg") 7 17, pointer;
}
</style>
