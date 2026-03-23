<!--
    This mixin synchronizes multiple moves or resizes on a layer.
    Ce mixin synchronise les déplacements ou redimensionnements multiples sur une couche.
-->
<script>
const START = 1; // dragstart or resizestart
const PROCESS = 2; // dragging or resizing
const STOP = 3; // dragstop or resizestop

const DRAG = 1; // dragstart or dragging or dragstop
const RESIZE = 2; // resizestart or resizing or resizestop

import app from "../../conf/app.js";
import merge from "lodash.merge";
import { hasBeenRecentlyExecuted } from "../../utils/frequency-limit";
import Position from "../../utils/position";
export default {
    name: "BoardLayerMultipleDrag",

    inject: ["$view"],

    data() {
        return {
            boardLayerMultipleDrag_selection: {},
            boardLayerMultipleDrag_initialPosition: {},
            boardLayerMultipleDrag_updatedZPosition: {},
            boardLayerMultipleDrag_previousXYWHPosition: {},
        };
    },

    methods: {
        boardLayerMultipleDrag_dragstart(evt) {
            this.boardLayerMultipleDrag_main({
                evt,
                step: START,
                action: DRAG,
            });
        },
        boardLayerMultipleDrag_dragging(evt) {
            this.boardLayerMultipleDrag_main({
                evt,
                step: PROCESS,
                action: DRAG,
            });
        },
        boardLayerMultipleDrag_dragstop(evt) {
            this.boardLayerMultipleDrag_main({ evt, step: STOP, action: DRAG });
        },
        boardLayerMultipleDrag_resizestart(evt) {
            this.boardLayerMultipleDrag_main({
                evt,
                step: START,
                action: RESIZE,
            });
        },
        boardLayerMultipleDrag_resizing(evt) {
            this.boardLayerMultipleDrag_main({
                evt,
                step: PROCESS,
                action: RESIZE,
            });
        },
        boardLayerMultipleDrag_resizestop(evt) {
            this.boardLayerMultipleDrag_main({
                evt,
                step: STOP,
                action: RESIZE,
            });
        },

        boardLayerMultipleDrag_main({ evt, step, action }) {
            const positions = {};

            if (step === START) {
                const initialPosition = evt.initialPosition || evt;
                this.boardLayerMultipleDrag_previousXYWHPosition =
                    initialPosition;
                this.boardLayerMultipleDrag_initialPosition =
                    Position.addCenter(initialPosition);

                // Filter actionnable position of all VDR node & format them
                const boardPositionsFromStore = this.$refs[
                    "board-position"
                ].map((boardPosition) => {
                    const positionFromStore = this.$store.getters[
                        `positionAlive/byId`
                    ](boardPosition.$vnode.key);
                    return {
                        $vdr: boardPosition,
                        _id: boardPosition.$vnode.key,
                        positionId: boardPosition.$vnode.key,
                        top: positionFromStore.data.top,
                        left: positionFromStore.data.left,
                        height: positionFromStore.data.height,
                        width: positionFromStore.data.width,
                        zIndex: positionFromStore.data.zIndex,
                    };
                });

                // Filter VDR with initial selection
                const okForSelection = boardPositionsFromStore.filter(
                    (x) =>
                        x.$vdr.isActive &&
                        x.$vdr?.[
                            action === RESIZE ? "isResizable" : "isDraggable"
                        ]
                );
                const koForSelection = boardPositionsFromStore.filter(
                    (x) =>
                        !(
                            x.$vdr.isActive &&
                            x.$vdr?.[
                                action === RESIZE
                                    ? "isResizable"
                                    : "isDraggable"
                            ]
                        )
                );

                // Propagate selection for zIndex & drag
                for (
                    let k = 0;
                    k <
                    boardPositionsFromStore.length *
                        boardPositionsFromStore.length;
                    k++
                ) {
                    let positionAdded = false;

                    for (let ok of okForSelection) {
                        for (let koId in koForSelection) {
                            if (
                                this.$store.getters[`positionAlive/match`](
                                    koForSelection[koId],
                                    ok
                                ) &&
                                Position.isHigher(koForSelection[koId], ok)
                            ) {
                                okForSelection.push(koForSelection[koId]);
                                koForSelection.splice(koId, 1);
                                positionAdded = true;
                            }
                        }
                    }

                    if (!positionAdded) break;
                }
                const propagatedSelection = {
                    selected: okForSelection,
                    notSelected: koForSelection,
                };

                // Not propagated selection for resize
                const initalSelection = {
                    selected: boardPositionsFromStore.filter(
                        (x) => x.$vdr.isActive
                    ), // || x.positionId === evt.id ),
                    notSelected: boardPositionsFromStore.filter(
                        (x) => !x.$vdr.isActive
                    ), // && x.positionId !== evt.id ),
                };

                // In case of drag, use the propagated selection
                if (action === DRAG) {
                    this.boardLayerMultipleDrag_selection = propagatedSelection;
                }
                // In case of resize, dont propagate selection
                if (action === RESIZE) {
                    this.boardLayerMultipleDrag_selection = initalSelection;
                }

                // Add positions of other layers to the notSelected list (necessary to snap front objets on back ones)
                const positionIds = [
                    ...this.boardLayerMultipleDrag_selection.selected,
                    ...this.boardLayerMultipleDrag_selection.notSelected,
                ].map((position) => position.positionId);
                for (let position of this.$store.getters[
                    `positionAlive/asArray`
                ]) {
                    if (!positionIds.includes(position.positionId)) {
                        this.boardLayerMultipleDrag_selection.notSelected.push({
                            positiondId: position.positionId,
                            left: position?.data?.left,
                            top: position?.data?.top,
                            width: position?.data?.width,
                            height: position?.data?.height,
                        });
                    }
                }

                // Set propagated selection on front
                updateZ({
                    positions,
                    zIndexMax: this.$store.getters[`positionAlive/zIndexMax`],
                    selection: propagatedSelection,
                });
                this.boardLayerMultipleDrag_updatedZPosition = positions;
            }

            // Movement itself, compute new values for top, left, width height
            if (
                step === STOP ||
                (step === PROCESS &&
                    Position.originAreDifferent(
                        evt,
                        this.boardLayerMultipleDrag_previousXYWHPosition
                    ) &&
                    !hasBeenRecentlyExecuted(`${evt.hash}-xywh`, 100 /* ms */))
            ) {
                this.boardLayerMultipleDrag_previousXYWHPosition = evt;

                const boardParameters = this.$store.getters[`boardAlive/byId`](
                    this.$view.boardId
                ).data;
                updateXYWH({
                    positions,
                    currentPosition: evt,
                    initialPosition:
                        this.boardLayerMultipleDrag_initialPosition,
                    selection: this.boardLayerMultipleDrag_selection,
                    snapOptions: {
                        snapRadius: boardParameters.snapRadius,
                        snapBorder: boardParameters.snapBorder,
                        snapVerticalAxis: boardParameters.snapVerticalAxis,
                        snapHorizontalAxis: boardParameters.snapHorizontalAxis,
                    },
                });
            }

            // Round positions' properties
            if (step === STOP) {
                for (let positionId in positions) {
                    for (let property of ["top", "left", "width", "height"]) {
                        if (positions?.[positionId]?.data?.[property]) {
                            positions[positionId].data[property] = Math.round(
                                positions[positionId].data[property]
                            );
                        }
                    }
                    positions[positionId].data.zIndex =
                        this.boardLayerMultipleDrag_updatedZPosition[
                            positionId
                        ].data.zIndex;
                }
            }

            // Dispatch data to the store if changes occured
            if (Object.keys(positions).length) {
                this.$store.dispatch(`positionAlive/update`, {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data: formatPositionForStore(positions).map((item) => {
                        const boardSize = app.board.size;
                        const { left, top, width, height, zIndex } = item.data;
                        return {
                            positionId: item.positionId,
                            data: {
                                left:
                                    left <= 0
                                        ? 0
                                        : left + width >= boardSize.width
                                        ? boardSize.width - width
                                        : left,
                                top:
                                    top <= 0
                                        ? 0
                                        : top + height >= boardSize.height
                                        ? boardSize.height - height
                                        : top,
                                width,
                                height,
                                zIndex,
                            },
                        };
                    }),
                    isBackground:
                        this.$store.getters[
                            `app/objectsInBoard/activeLayerIsBackground`
                        ],
                    reply: step === STOP,
                    undoId: evt.hash,
                });
            }

            if (step === STOP) {
                this.boardLayerMultipleDrag_selection = {};
                this.boardLayerMultipleDrag_initialPosition = {};
                this.boardLayerMultipleDrag_updatedZPosition = {};
                this.boardLayerMultipleDrag_previousXYWHPosition = {};
            }
        },
    },
};

// Update z-index of board-position, set selection on forelayer
// TODO: move to toolbar, then emit an event to call
function updateZ({ positions, zIndexMax, selection }) {
    // Sort by z-index ascending
    selection.selected.sort((a, b) => {
        return a.zIndex - b.zIndex;
    });

    // Move items to forelayer and build event to be sent
    if (!positions) positions = {};
    for (let index = 0; index < selection.selected.length; index++) {
        const ok = selection.selected[index];
        const zIndex = zIndexMax + index + 1;
        ok.$vdr.boardPositionDragResize_setPosition({ zIndex });
        positions[ok.positionId] = merge(positions[ok.positionId], {
            data: {
                zIndex,
            },
        });
    }
    return positions;
}

// Move or resize all selected objects together
function updateXYWH({
    positions,
    currentPosition,
    initialPosition,
    selection,
    snapOptions,
}) {
    const isResizing = "stick" in currentPosition;

    // Is there, first, a snap to take into consideration ?
    let snap = Position.neighbours(
        currentPosition,
        selection.notSelected,
        snapOptions
    );

    // Apply snap
    if (isResizing) {
        if (currentPosition.stick[1] == "l") {
            currentPosition.left -= snap.left;
            currentPosition.width += snap.left;
        } /*if( currentPosition.stick[1] == 'r' )*/ else {
            currentPosition.width -= snap.left;
        }

        if (currentPosition.stick[0] == "t") {
            currentPosition.top -= snap.top;
            currentPosition.height += snap.top;
        } /*if( currentPosition.stick[0] == 'b')*/ else {
            currentPosition.height -= snap.top;
        }
    } else {
        currentPosition.left -= snap.left;
        currentPosition.top -= snap.top;
    }

    // New center of the dragged note
    Position.addCenter(currentPosition);

    // Horizontal and vertical scales
    let resizeScale = {
        width: currentPosition.width / initialPosition.width,
        height: currentPosition.height / initialPosition.height,
    };

    // Apply drag & resize to every nodes
    if (!positions) positions = {};
    selection.selected.forEach((boardPosition) => {
        let position = {};

        // boardPosition is the one that is dragged
        // following general is theorically appropriate for this one too,
        // but real computation results in decimal approximation
        if (currentPosition.id === boardPosition.positionId) {
            position = currentPosition;
        }

        // boardPosition isnt the one that is dragged
        else {
            // Size after resize
            let w = boardPosition.width * resizeScale.width;
            let h = boardPosition.height * resizeScale.height;

            // Absolute position of corner left top before drag & resize
            let x = boardPosition.left;
            let y = boardPosition.top;

            // Absolute position of center of current boardPosition before drag & resize
            x += boardPosition.width / 2;
            y += boardPosition.height / 2;

            // Position of center of current boardPosition relative to the center of caller before drag & resize
            x -= initialPosition.center.left;
            y -= initialPosition.center.top;

            // Position of center of current node relative to the center of caller after drag & resize
            x *= resizeScale.width;
            y *= resizeScale.height;

            // Absolute position of center of current boardPosition
            x += currentPosition.center.left;
            y += currentPosition.center.top;

            // Absolute position of corner left top after drag & resize
            x -= w / 2;
            y -= h / 2;

            position = {
                left: x,
                top: y,
                width: w,
                height: h,
            };
        }

        // Add this position to the list
        positions[boardPosition.positionId] = merge(
            positions[boardPosition.positionId] || {},
            {
                positionId: boardPosition.positionId,
                data: position,
            }
        );

        // Set position
        if (currentPosition.id === boardPosition.positionId) {
            boardPosition.$vdr.boardPositionDragResize_setPosition(
                position,
                isResizing
            ); // Dragged component must be manually moved
        }
    });
    return positions;
}
// Clean and format positions before dispatch to the store
function formatPositionForStore(positions) {
    const ALLOWED_PROPERTIES = ["top", "left", "width", "height", "zIndex"];
    const out = [];
    for (let positionId in positions) {
        const formattedPosition = { positionId, data: {} };
        for (let property in positions[positionId].data) {
            if (ALLOWED_PROPERTIES.includes(property)) {
                formattedPosition.data[property] =
                    positions[positionId].data[property];
            }
        }
        out.push(formattedPosition);
    }
    return out;
}
</script>
