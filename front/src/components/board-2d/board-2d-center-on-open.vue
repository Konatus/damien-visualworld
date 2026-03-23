<!--
    This mixin handles board centering on board opening.
    Ce mixin gère le centrage à l'ouverture d'un tableau.
-->
<script>
import app from "../../conf/app";
import scale from "../../utils/scale";
export default {
    name: "Board2dCenterOnOpen",

    inject: ["$view"],

    data() {
        return {
            board2dCenterOnOpen_interval: null,
            board2dCenterOnOpen_hasBeenDone: false,
            board2dCenterOnOpen_count: 0,
        };
    },

    mounted() {
        this.board2dCenterOnOpen_interval = setInterval(() => {
            this.board2dCenterOnOpen_do();
        }, 50);
    },

    computed: {
        board2dCenterOnOpen_scene() {
            return this.$store.getters[`panzoom/scene`];
        },
        board2dCenterOnOpen_positions() {
            return this.$store.getters[`positionAlive/asArray`] || [];
        },
        board2dCenterOnOpen_positionsAreInitialized() {
            try {
                return this.$store.getters[`positionAlive/isInitialized`];
            } catch (e) {
                return true; // component-edit
            }
        },
    },

    methods: {
        board2dCenterOnOpen_do() {
            this.board2dCenterOnOpen_count++;
            let coord, err;

            // If board hasnt been centered yet...
            // If panzoom scene has a size...
            // If board has a size...
            if (
                !this.board2dCenterOnOpen_hasBeenDone &&
                this.board2dCenterOnOpen_positionsAreInitialized &&
                this.board2dCenterOnOpen_scene.width > 0 &&
                this.board2dCenterOnOpen_scene.height > 0
            ) {
                try {
                    // Compute scale and offset
                    coord = scale.center(
                        this.board2dCenterOnOpen_positions.filter(
                            (x) => x.data
                        ),
                        this.board2dCenterOnOpen_scene.width,
                        this.board2dCenterOnOpen_scene.height,
                        app.board.size.width,
                        app.board.size.height,
                        app.board.zoom.scaleBoundsMargin
                    );
                    if (0 < coord.scale) {
                        // Set scale and offset
                        this.$refs["panzoom"].instance.moveTo(coord.x, coord.y);
                        this.$refs["panzoom"].instance.zoomAbs(
                            coord.x,
                            coord.y,
                            coord.scale
                        );

                        // Save center as done
                        this.board2dCenterOnOpen_hasBeenDone = true;
                        clearInterval(this.board2dCenterOnOpen_interval);
                    }
                } catch (e) {
                    err = e;
                }
            }

            // KO after 5s? Try list positions again!
            if (
                this.board2dCenterOnOpen_count == 100 &&
                !this.board2dCenterOnOpen_positionsAreInitialized
            ) {
                this.$store.dispatch(`positionAlive/list`, this.$view);
            }

            // KO after 10s? Do log!
            if (this.board2dCenterOnOpen_count == 200) {
                this.$store.dispatch(
                    `root/log`,
                    `board2dCenterOnOpen_do hasBeenDone='${
                        this.board2dCenterOnOpen_hasBeenDone
                    }', positionsAreInitialized='${
                        this.board2dCenterOnOpen_positionsAreInitialized
                    }', width='${
                        this.board2dCenterOnOpen_scene.width
                    }', height='${
                        this.board2dCenterOnOpen_scene.height
                    }, height='${
                        this.board2dCenterOnOpen_scene.height
                    }', err=${JSON.stringify(err)}`
                );
            }
        },
    },
};
</script>
