<!--
    This mixin regulates and transforms VDR move events, before transmitting them for synchronization of multiple movements.
    Ce mixin régule et transforme les événements de mouvement VDR, avant de les transmettre pour synchronisation des mouvements multiples.
-->
<script>
const MIN_SIZE_TO_RESIZE = 30;
const FALLBACK_TOLERANCE = 10;

const START = 1; // dragstart or resizestart
const PROCESS = 2; // dragging or resizing
const STOP = 3; // dragstop or resizestop
const START_OR_PROCESS = 4; // dragstart or resizestart or dragging or resizing

const DRAG = 1; // dragstart or dragging or dragstop
const RESIZE = 2; // resizestart or resizing or resizestop

const EVENT_NAME = {
    // TODO: remove and emit a single type of event?
    [DRAG]: {
        [START]: "boardPositionDragResize_dragstart",
        [PROCESS]: "boardPositionDragResize_dragging",
        [STOP]: "boardPositionDragResize_dragstop",
    },
    [RESIZE]: {
        [START]: "boardPositionDragResize_resizestart",
        [PROCESS]: "boardPositionDragResize_resizing",
        [STOP]: "boardPositionDragResize_resizestop",
    },
};

import { distance } from "../../utils/position";
import jsonDeepCopy from "../../utils/json-deep-copy";
export default {
    name: "BoardPositionDragResize",

    computed: {
        vdr() {
            return this.$children[0];
        },
        boardPositionDragResize_hasDragGrant() {
            const socketName = this.$store.getters[
                `app/objectsInBoard/activeLayerIsForeground`
            ]
                ? "position-alive/update-front"
                : "position-alive/update-back";
            return this.$store.getters[`connectionMe/isGrantedFor`](
                [socketName],
                this.$view
            );
        },
        boardPositionDragResize_hasResizeGrant() {
            const socketName = this.$store.getters[
                `app/objectsInBoard/activeLayerIsForeground`
            ]
                ? "position-alive/resize-front"
                : "position-alive/resize-back";
            return this.$store.getters[`connectionMe/isGrantedFor`](
                [socketName],
                this.$view
            );
        },
        boardPositionDragResize_isTooSmallToResize() {
            const maxSize =
                this.position.width > this.position.height
                    ? this.position.width
                    : this.position.height;
            const scale = this.$store.getters[`panzoom/scale`];
            const maxScaledSize = maxSize * scale;
            return maxScaledSize < MIN_SIZE_TO_RESIZE;
        },
        boardPositionDragResize_isBeingMoveOrResizedBySomeoneElse() {
            try {
                return this.$store.getters[`positionAlive/byId`](
                    this.$vnode.key
                )?.private?.updating;
            } catch {
                return false;
            }
        },
    },

    data() {
        return {
            boardPositionDragResize_initialPosition: null,
            boardPositionDragResize_reachedFallback: false,
        };
    },

    methods: {
        // Listen to VDR events
        boardPositionDragResize_onDragging(evt) {
            this.boardPositionDragResize_onEvent({
                evt,
                action: DRAG,
                step: START_OR_PROCESS,
            });
        },
        boardPositionDragResize_onDragstop(evt) {
            this.boardPositionDragResize_onEvent({
                evt,
                action: DRAG,
                step: STOP,
            });
        },
        boardPositionDragResize_onResizing(evt) {
            this.boardPositionDragResize_onEvent({
                evt,
                action: RESIZE,
                step: START_OR_PROCESS,
            });
        },
        boardPositionDragResize_onResizestop(evt) {
            this.boardPositionDragResize_onEvent({
                evt,
                action: RESIZE,
                step: STOP,
            });
        },
        boardPositionDragResize_onEvent({ evt, action, step }) {
            if (!this.boardPositionDragResize_hasDragGrant) {
                return;
            }
            if (step === START_OR_PROCESS) {
                // 1. Drag has just started
                if (!this.boardPositionDragResize_initialPosition) {
                    this.boardPositionDragResize_initialPosition = jsonDeepCopy(
                        this.position
                    );
                    this.boardPositionDragResize_hash = `_${Date.now()}`;
                }
                // 3. Drag has already reached the fallback distance
                else if (this.boardPositionDragResize_reachedFallback) {
                    this.boardPositionDragResize_emit({
                        evt,
                        action,
                        step: PROCESS,
                    });
                }
                // 2. Drag has just reached the fallback distance
                else if (
                    distance(
                        this.boardPositionDragResize_initialPosition,
                        evt
                    ) >= FALLBACK_TOLERANCE
                ) {
                    evt.initialPosition =
                        this.boardPositionDragResize_initialPosition;
                    this.boardPositionDragResize_emit({
                        evt,
                        action,
                        step: START,
                    });
                    this.boardPositionDragResize_reachedFallback = true;
                }
            } else if (step === STOP) {
                // 4. Drag has just stopped
                if (this.boardPositionDragResize_reachedFallback) {
                    this.boardPositionDragResize_emit({
                        evt,
                        action,
                        step: STOP,
                    });
                    this.boardPositionDragResize_reachedFallback = false;
                }
                this.boardPositionDragResize_initialPosition = null;
                this.boardPositionDragResize_hash = null;
            }
        },

        // Add id, type, step and action then emit event
        boardPositionDragResize_emit({ evt, step, action }) {
            this.$emit(
                EVENT_NAME[action][step],
                Object.assign(
                    {
                        id: this.$vnode.key,
                        type: "cursor",
                        step,
                        action,
                    },
                    evt,
                    {
                        hash: this.boardPositionDragResize_hash,
                    }
                )
            );
        },

        // Util: move current component
        boardPositionDragResize_setPosition(position, isResize) {
            this.vdr.limits = isResize
                ? this.vdr.calcResizeLimitation()
                : this.vdr.calcDragLimitation();

            if (position.top !== undefined) {
                this.vdr.rawTop = position.top;
                if (position.height !== undefined) {
                    this.vdr.rawBottom =
                        this.vdr.parentHeight - position.top - position.height;
                }
            }
            if (position.left !== undefined) {
                this.vdr.rawLeft = position.left;
                if (position.width !== undefined) {
                    this.vdr.rawRight =
                        this.vdr.parentWidth - position.left - position.width;
                }
            }
            if (position.zIndex) {
                this.vdr.zIndex = position.zIndex;
            }
        },
    },
};
</script>
