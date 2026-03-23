<script>
const TIME_STEP = 100; /* ms */
const NOWHERE = -9871789; // chosen arbitrarily, must be far from the board so the move cannot cause a "snap" on the neighbors
import { hasBeenRecentlyExecuted } from "../../utils/frequency-limit";
export default {
    name: "BoardLayerKeyboardMove",

    data() {
        return {
            boardLayerKeyboardMove_eventTimestamp: 0,
            boardLayerKeyboardMove_selectionX: 0,
            boardLayerKeyboardMove_selectionY: 0,
            boardLayerKeyboardMove_boardX: 0,
            boardLayerKeyboardMove_boardY: 0,
        };
    },

    methods: {
        boardLayerKeyboardMove_speed() {
            const duration =
                (Date.now() - this.boardLayerKeyboardMove_eventTimestamp) /
                TIME_STEP;
            return Math.ceil(duration); //Math.ceil( Math.sqrt( duration ) )
        },
        boardLayerKeyboardMove_do({ dx, dy }) {
            // Simulate the start of a move...
            if (
                this.boardLayerKeyboardMove_selectionX === 0 &&
                this.boardLayerKeyboardMove_selectionY === 0
            ) {
                this.boardLayerKeyboardMove_eventTimestamp = Date.now();
                this.boardLayerMultipleDrag_dragstart({
                    width: 100,
                    height: 100,
                    left: NOWHERE,
                    top: NOWHERE,
                    hash: this.boardLayerKeyboardMove_eventTimestamp,
                });
            }

            // Frequency control must be done the and not inside board-layer-multiple-drag in order to synchronize moves of object and panzoom
            if (
                !hasBeenRecentlyExecuted(`boardLayerKeyboardMove_do`, TIME_STEP)
            ) {
                // TODO: move to a config flie

                // Compute the new position
                const speed = this.boardLayerKeyboardMove_speed();
                const scale = this.$store.getters[`panzoom/scale`];
                this.boardLayerKeyboardMove_selectionX += (dx * speed) / scale;
                this.boardLayerKeyboardMove_selectionY += (dy * speed) / scale;
                this.boardLayerKeyboardMove_boardX -= dx * speed;
                this.boardLayerKeyboardMove_boardY -= dy * speed;

                // Simulate a move in progress
                this.boardLayerMultipleDrag_dragging({
                    width: 100,
                    height: 100,
                    left: NOWHERE + this.boardLayerKeyboardMove_selectionX,
                    top: NOWHERE + this.boardLayerKeyboardMove_selectionY,
                    hash: this.boardLayerKeyboardMove_eventTimestamp,
                });

                // Board opposite move
                const panzoom = this.$store.getters[`panzoom/instance`];
                panzoom.moveBy(
                    this.boardLayerKeyboardMove_boardX,
                    this.boardLayerKeyboardMove_boardY
                );
                this.boardLayerKeyboardMove_boardX = 0;
                this.boardLayerKeyboardMove_boardY = 0;
            }
        },
        boardLayerKeyboardMove_stop() {
            // Simulate the end of a move
            this.boardLayerMultipleDrag_dragstop({
                width: 100,
                height: 100,
                left: NOWHERE + this.boardLayerKeyboardMove_selectionX,
                top: NOWHERE + this.boardLayerKeyboardMove_selectionY,
                hash: this.boardLayerKeyboardMove_eventTimestamp,
            });
            this.boardLayerKeyboardMove_selectionX = 0;
            this.boardLayerKeyboardMove_selectionY = 0;

            // Board opposite move
            const panzoom = this.$store.getters[`panzoom/instance`];
            panzoom.moveBy(
                this.boardLayerKeyboardMove_boardX,
                this.boardLayerKeyboardMove_boardY
            );
            this.boardLayerKeyboardMove_boardX = 0;
            this.boardLayerKeyboardMove_boardY = 0;
        },
    },
};
</script>
