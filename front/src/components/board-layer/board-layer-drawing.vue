<!--
    This mixin allows the creation of drawings.
    Ce mixin permet la création de dessins.
-->
<script>
const MINIMAL_MOVE = 2 * 2; // px², avoid a slow Math.sqrt at distance computation
import Vue from "vue";
import app from "../../conf/app";
import { hasBeenRecentlyExecuted } from "../../utils/frequency-limit";
import jsonDeepCopy from "../../utils/json-deep-copy";
import { match, eventToLayer } from "../../utils/position";
export default {
    name: "BoardLayerDrawing",
    data() {
        return {
            boardLayerDrawing_isInitialized: false, // True if a position been created or an existing has been loaded, false before
            boardLayerDrawing_position: null, // That created or updated position... (asynchronously received if created, that's why the previous boolean is necessary, otherwise a position should be created more than once)
            boardLayerDrawing_paths: [], // SVG's path of current drawing
            boardLayerDrawing_idInPaths: {}, // Mapping current moves identifiers > index in paths
            boardLayerDrawing_previous: {}, // Allows comparison between current and previous move event... and, if equal, ignore the new one
            boardLayerDrawing_inProgress: false, // Is a drawing move in progress... if no, ignore move events
        };
    },
    watch: {
        // Save the created position when received
        "$store.state.positionAlive.newlyCreatedItemsByMe": {
            deep: true,
            handler(value) {
                if (this.boardLayerDrawing_position) {
                    return;
                }
                const positions = value.filter(
                    (position) =>
                        this.positionIds.includes(position.positionId) && // current layer
                        position.componentId ===
                            app.visualWorldComponent.VW_svg_model // SVG component
                );
                this.boardLayerDrawing_position = positions[0];
            },
        },

        // Reset data at drawing mode exit
        modeIsDrawing(value) {
            // modeIsDrawing is directly computed by board-layer
            if (!value) {
                this.boardLayerDrawing_doUpdate({ reply: true });
                this.boardLayerDrawing_paths = [];
                this.boardLayerDrawing_position = null;
                this.boardLayerDrawing_isInitialized = false;
            }
        },
    },
    methods: {
        // Pointer events: start, move & stop
        boardLayerDrawing_onStart(evt) {
            this.boardLayerDrawing_inProgress = true;

            const positions = this.boardLayerDrawing_formatEvent(evt);
            const position = positions[0];

            if (!this.boardLayerDrawing_isInitialized) {
                // Look for the existing drawing at event position
                const existingToBeCompleted = this.$store.getters[
                    `positionAlive/byPosition`
                ]({
                    ...position,
                    isBackground:
                        this.$store.getters[
                            `app/objectsInBoard/activeLayerIsBackground`
                        ],
                }).filter(
                    (position) =>
                        position.componentId ===
                        app.visualWorldComponent.VW_svg_model
                );
                if (existingToBeCompleted?.[0]) {
                    this.boardLayerDrawing_position = existingToBeCompleted[0];

                    // Convert relative paths from object to absolute one & load them into current component
                    const object = this.$store.getters[`object/byId`](
                        this.boardLayerDrawing_position.objectId
                    );
                    const paths = jsonDeepCopy(object.data.paths);
                    for (let path of paths) {
                        for (let position of path.positions) {
                            position.left =
                                position.left *
                                    this.boardLayerDrawing_position.data.width +
                                this.boardLayerDrawing_position.data.left;
                            position.top =
                                position.top *
                                    this.boardLayerDrawing_position.data
                                        .height +
                                this.boardLayerDrawing_position.data.top;
                        }
                    }
                    this.boardLayerDrawing_paths = paths;
                }
            }

            if (this.$store.getters[`app/objectsInBoard/drawingEraser`]) {
                this.boardLayerDrawing_onMove(evt); // Erase start hasnt any special needs, it's like a move
            } else {
                // At the start a new path, let's add a path to the draw and initiate it with event position
                this.boardLayerDrawing_idInPaths[position.key] =
                    this.boardLayerDrawing_paths.length;
                this.boardLayerDrawing_paths.push({
                    minLeft: position.left,
                    maxLeft: position.left,
                    minTop: position.top,
                    maxTop: position.top,
                    positions: [position],
                    fill: "none",
                    stroke: this.$store.getters[
                        `app/objectsInBoard/drawingColor`
                    ],
                    strokeWidth:
                        this.$store.getters[`app/objectsInBoard/drawingWidth`],
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                });

                // Create a position or update the already existing one
                if (!this.boardLayerDrawing_isInitialized) {
                    if (!this.boardLayerDrawing_position) {
                        this.boardLayerDrawing_doCreate();
                    } else {
                        this.boardLayerDrawing_doUpdate({ reply: false });
                    }
                    this.boardLayerDrawing_isInitialized = true;
                }
            }
        },
        boardLayerDrawing_onMove(evt) {
            if (this.boardLayerDrawing_inProgress === false) {
                return;
            }
            const positions = this.boardLayerDrawing_formatEvent(
                evt,
                MINIMAL_MOVE
            );

            if (this.$store.getters[`app/objectsInBoard/drawingEraser`]) {
                let eraseDone = false;

                const cleanNegativeSizes = ({ left, top, width, height }) => ({
                    left: width > 0 ? left : left + width,
                    width: width > 0 ? width : -width,
                    top: height > 0 ? top : top + height,
                    height: height > 0 ? height : -height,
                });

                // Remove the positions that match current move
                for (
                    let pathIdx = 0;
                    pathIdx < this.boardLayerDrawing_paths.length;
                    pathIdx++
                ) {
                    const points =
                        this.boardLayerDrawing_paths[pathIdx].positions;
                    for (
                        let pointIdx = 1;
                        pointIdx < points.length;
                        pointIdx++
                    ) {
                        if (!points[pointIdx].erased) {
                            const delta = cleanNegativeSizes({
                                left: points[pointIdx].left,
                                top: points[pointIdx].top,
                                width:
                                    points[pointIdx - 1].left -
                                    points[pointIdx].left,
                                height:
                                    points[pointIdx - 1].top -
                                    points[pointIdx].top,
                            });
                            for (const position of positions) {
                                if (
                                    match(delta, cleanNegativeSizes(position))
                                ) {
                                    eraseDone = true;
                                    Vue.set(
                                        this.boardLayerDrawing_paths[pathIdx]
                                            .positions[pointIdx],
                                        "erased",
                                        true
                                    );
                                    if (points[pointIdx - 1].erased) {
                                        this.boardLayerDrawing_paths[
                                            pathIdx
                                        ].positions.slice(pathIdx, 1);
                                    } else if (points[pointIdx + 1]?.erased) {
                                        this.boardLayerDrawing_paths[
                                            pathIdx
                                        ].positions.slice(pathIdx + 1, 1);
                                    }
                                }
                            }
                        }
                    }
                }
                if (eraseDone) {
                    this.boardLayerDrawing_doUpdate({ reply: false });
                }
            } else {
                // Push the positions of move event to paths
                for (const position of positions) {
                    const path =
                        this.boardLayerDrawing_paths[
                            this.boardLayerDrawing_idInPaths[position.key]
                        ];
                    if (path) {
                        path.positions.push(position);
                    }
                }
                // this.boardLayerDrawing_doUpdate({ reply: false })
            }
        },
        boardLayerDrawing_onStop(evt) {
            this.boardLayerDrawing_inProgress = false;
            if (this.$store.getters[`app/objectsInBoard/drawingEraser`]) {
                /* bothing to do on move stop, if eraser is enabled */
            } else {
                // Delete drawing path data when the move ends
                const positions = this.boardLayerDrawing_formatEvent(evt);
                for (const position of positions) {
                    delete this.boardLayerDrawing_previous[position.key];
                    delete this.boardLayerDrawing_idInPaths[position.key];
                }
            }
            this.boardLayerDrawing_doUpdate({ reply: false });
        },

        // Util that manage position events of onStart, onMove & onStop
        boardLayerDrawing_formatEvent(evt, minMove = -1) {
            const res = [];

            // Convert screen event position to its equivalent on layer
            const positions = eventToLayer(
                evt,
                this.$store.getters[`panzoom/panzoom`]
            ).reverse(); // Reverse because coalesced events are descending sorted

            // Let's forget positions that are very near of their predecessor
            for (
                let positionId = 0;
                positionId < positions.length;
                positionId++
            ) {
                const current = positions[positionId];
                const previous = this.boardLayerDrawing_previous[
                    current.key
                ] || { left: -minMove, top: -minMove };

                const squaredDistance =
                    Math.pow(current.left - previous.left, 2) +
                    Math.pow(current.top - previous.top, 2);
                if (squaredDistance > minMove) {
                    this.boardLayerDrawing_previous[current.key] = current;
                    res.push({
                        key: current.key,
                        left: current.left,
                        top: current.top,
                        width: previous.left - current.left,
                        height: previous.top - current.top,
                    });
                }
            }
            return res;
        },

        // Store dispatch events
        boardLayerDrawing_doCreate() {
            if (
                !this.$store.getters[`connectionMe/isGrantedForOne`](
                    [
                        "position-alive/create-front",
                        "position-alive/create-back",
                    ],
                    this.$view
                )
            ) {
                return;
            }
            const { paths, top, left, width, height } =
                this.boardLayerDrawing_getRelativePaths();
            this.$store.dispatch(`positionAlive/create`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: [
                    {
                        componentId: app.visualWorldComponent.VW_svg_model,
                        object: {
                            data: {
                                paths,
                            },
                        },
                        data: {
                            top,
                            left,
                            width,
                            height,
                            zIndex:
                                1 +
                                this.$store.getters[`positionAlive/zIndexMax`],
                        },
                    },
                ],
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },
        boardLayerDrawing_doUpdate({ reply }) {
            if (!this.boardLayerDrawing_position) {
                return;
            }
            const recent = hasBeenRecentlyExecuted(
                `board-layer-drawing`,
                1000 /* ms */
            );
            if (!reply && recent) {
                return;
            }

            const { paths, top, left, width, height } =
                this.boardLayerDrawing_getRelativePaths();
            this.$store.dispatch(`positionAlive/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: [
                    {
                        positionId: this.boardLayerDrawing_position.positionId,
                        data: {
                            top,
                            left,
                            width,
                            height,
                        },
                    },
                ],
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
                reply,
            });
            this.$store.dispatch("object/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                payload: [
                    {
                        objectId: this.boardLayerDrawing_position.objectId,
                        data: { paths },
                    },
                ],
                reply,
            });
        },

        // Util that convert absolute screen positions in paths into relatives
        boardLayerDrawing_getRelativePaths() {
            const paths = jsonDeepCopy(this.boardLayerDrawing_paths);
            const minLeft = Math.min(
                ...paths.map(
                    (path) =>
                        Math.min(...path.positions.map((pos) => pos.left)) -
                        path.strokeWidth / 2
                )
            );
            const maxLeft = Math.max(
                ...paths.map(
                    (path) =>
                        Math.max(...path.positions.map((pos) => pos.left)) +
                        path.strokeWidth
                )
            );
            const minTop = Math.min(
                ...paths.map(
                    (path) =>
                        Math.min(...path.positions.map((pos) => pos.top)) -
                        path.strokeWidth / 2
                )
            );
            const maxTop = Math.max(
                ...paths.map(
                    (path) =>
                        Math.max(...path.positions.map((pos) => pos.top)) +
                        path.strokeWidth
                )
            );
            const width = maxLeft - minLeft;
            const height = maxTop - minTop;

            for (let path of paths) {
                for (let position of path.positions) {
                    position.left = (position.left - minLeft) / width;
                    position.top = (position.top - minTop) / height;
                }
            }
            return {
                paths,
                width,
                height,
                top: minTop,
                left: minLeft,
            };
        },
    },
};
</script>
