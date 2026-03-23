<!--
    This mixin synchronizes positions selections on a layer.
    Ce mixin synchronise les sélections de positions et de liens sur une couche.
-->
<script>
import app from "../../conf/app";
import Position from "../../utils/position";
export default {
    name: "BoardLayerSelect",

    inject: ["$view"],

    data() {
        return {
            boardLayerSelect_getPosition: {},
            boardLayerSelect_getLink: {},
        };
    },

    // Reset select when active layer or mode change
    computed: {
        boardLayerSelect_activeLayer() {
            return this.$store.getters[`app/objectsInBoard/activeLayer`];
        },
        boardLayerSelect_mode() {
            return this.$store.getters[`app/objectsInBoard/mode`];
        },
    },
    watch: {
        "$store.state.app.objectsInBoard.event"(event) {
            if (event.name === "resetSelection") {
                this.boardLayerSelect_doResetPosition();
                this.boardLayerSelect_doResetLink();
            }
        },
        boardLayerSelect_activeLayer() {
            this.boardLayerSelect_doResetPosition();
            this.boardLayerSelect_doResetLink();
        },
        boardLayerSelect_mode() {
            if (this.$store.getters[`app/objectsInBoard/modeIsNormal`]) {
                // this.boardLayerSelect_doResetLink()
            } else if (this.$store.getters[`app/objectsInBoard/modeIsLink`]) {
                this.boardLayerSelect_doResetPosition();
            } else if (
                this.$store.getters[`app/objectsInBoard/modeIsDrawing`]
            ) {
                this.boardLayerSelect_doResetLink();
                this.boardLayerSelect_doResetPosition();
            }
        },
        "$store.state.positionAlive.newlyCreatedItemsByMe": {
            deep: true,
            handler(value) {
                // Filter on positions that are displayed in the current board
                const onThisBoard = value.filter((position) => {
                    return (
                        this.positionIds.includes(position.positionId) &&
                        position.componentId !==
                            app.visualWorldComponent.VW_svg_model
                    );
                });

                // Select newly created by current user positions
                if (onThisBoard.length) {
                    this.boardLayerSelect_doReset();
                    for (let item of onThisBoard) {
                        this.$set(
                            this.boardLayerSelect_getPosition,
                            item.positionId,
                            true
                        );
                    }
                    if (this.$store.state["overlay"].spinner) {
                        this.$store.commit("overlay/spinner", false);
                    }
                }
            },
        },
    },

    methods: {
        // Selection oof positions by area...
        boardLayerSelect_setPositionByArea(evt) {
            this.boardLayerSelect_doResetLink();

            for (let position of this.positions) {
                if (Position.match(evt, position.data)) {
                    this.$set(
                        this.boardLayerSelect_getPosition,
                        position.positionId,
                        true
                    );
                } else {
                    this.$delete(
                        this.boardLayerSelect_getPosition,
                        position.positionId
                    );
                }
            }

            this.boardLayerSelect_saveSelectPosition(evt.originalEvent);
        },

        // On click on a position or a link...
        boardLayerSelect_setPosition(evt) {
            this.boardLayerSelect_doResetLink();

            // Exit focus of any field
            document.getElementById("panzoom").focus();

            // If mode is select, invert selection of current position

            if (
                this.$store.getters[`app/objectsInBoard/modeIsLink`] ||
                this.$store.getters[`app/objectsInBoard/modeIsSelect`]
            ) {
                if (this.boardLayerSelect_getPosition[evt.id]) {
                    this.$delete(this.boardLayerSelect_getPosition, evt.id);
                } else {
                    this.$set(this.boardLayerSelect_getPosition, evt.id, true);
                }
            }

            // Else if current position isnt selected, reset selection and select only it
            else if (this.$store.getters[`app/objectsInBoard/modeIsNormal`]) {
                if (!this.boardLayerSelect_getPosition[evt.id]) {
                    this.boardLayerSelect_doResetPosition();
                    this.$set(this.boardLayerSelect_getPosition, evt.id, true);
                }
            }

            this.boardLayerSelect_saveSelectPosition(evt);
        },
        boardLayerSelect_setLink(evt) {
            this.boardLayerSelect_saveSelectPosition(evt);
            this.boardLayerSelect_doResetPosition();

            const selected = this.boardLayerSelect_getLink[evt.id];

            // To allow select multiple links
            if (!this.$store.getters[`app/objectsInBoard/modeIsSelect`]) {
                this.boardLayerSelect_doResetLink();
            }
            if (!selected) {
                // Select the link if it wasnt selected at start
                this.$set(this.boardLayerSelect_getLink, evt.id, true);
            }

            this.boardLayerSelect_saveSelectPosition(evt);
        },

        // On click elsewhere than on a position
        boardLayerSelect_reset() {
            // Reset current selection if neither the shift key nor the ctrl key are pressed
            if (!this.$store.getters[`app/objectsInBoard/modeIsSelect`]) {
                this.boardLayerSelect_doReset();
                document.getElementById("panzoom").focus();
            }
        },

        // Reset current selection
        boardLayerSelect_doCancelCreateLink(evt) {
            // Display board link toolbar on select link
            if (this.modeIsLink && evt.target.tagName !== "path") {
                this.boardLayerSelect_doReset();
            }
        },
        boardLayerSelect_doReset() {
            this.boardLayerSelect_doResetPosition();
            this.boardLayerSelect_doResetLink();
        },
        boardLayerSelect_doResetPosition() {
            const positionIds = Object.keys(this.boardLayerSelect_getPosition);
            for (let positionId of positionIds) {
                this.$delete(this.boardLayerSelect_getPosition, positionId);
            }
        },
        boardLayerSelect_doResetLink() {
            const linkIds = Object.keys(this.boardLayerSelect_getLink);
            for (let linkId of linkIds) {
                this.$delete(this.boardLayerSelect_getLink, linkId);
            }
        },

        // "Util", store event position
        boardLayerSelect_saveSelectPosition(evt) {
            const panzoom = this.$store.getters[`panzoom/panzoom`];
            this.$store.commit(
                `app/objectsInBoard/selectPosition`,
                Position.eventToLayer(evt, panzoom)[0]
            );
        },
    },
};
</script>
