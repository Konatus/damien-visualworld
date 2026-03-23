<script>
import app from "../../conf/app";
import Vue from "vue";
export default {
    name: "BoardLayerMoves",

    inject: ["$view"],

    data() {
        return {
            boardLayerMoves_liveMoves: {},
            boardLayerMoves_delayedMoves: {}, // Drag in progress - by other users - and moving position list
        };
    },

    watch: {
        // Filter positions to get live moves
        positions() {
            const moves = {};
            for (let position of this.positions) {
                const updating = position?.private?.updating;
                if (updating) {
                    if (!moves[updating]) {
                        moves[updating] = [];
                    }
                    moves[updating].push(position._id);
                }
            }
            this.boardLayerMoves_liveMoves = moves;
        },

        // Immediately show a new move
        // Delay the hide of a finished move
        boardLayerMoves_liveMoves() {
            for (const liveMoveUser in this.boardLayerMoves_liveMoves) {
                if (!(liveMoveUser in this.boardLayerMoves_delayedMoves)) {
                    this.boardLayerMoves_delayedMoves[liveMoveUser] = {
                        positions: this.boardLayerMoves_liveMoves[liveMoveUser],
                        edition: false,
                    };
                    window.setTimeout(() => {
                        Vue.delete(
                            this.boardLayerMoves_delayedMoves,
                            liveMoveUser
                        );
                    }, app.delayBeforeHide);
                }
            }
        },
    },
};
</script>
