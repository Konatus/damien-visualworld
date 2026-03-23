<!--
    This file contains the corrections and adaptations made, on the fly, on the vue-draggable library.
    Ce fichier contient les corrections et adptations effectuées, à la volée, sur la bibliothèque vue-draggable.
-->
<script>
import VD from "vuedraggable";
export default {
    name: "VueDraggable",

    mixins: [VD],

    props: {
        ghost: String,
    },

    // Listen to original library event
    created() {
        this.$on("choose", this.onChoose);
        this.$on("start", this.onStart);
        this.$on("end", this.onEnd);
        this.$on("unchoose", this.onUnchoose);

        document.addEventListener("keydown", this.nulling);
    },

    mounted() {
        this._sortable.options.fallbackOnBody = true;
    },

    data() {
        return {
            ghostDataset: null,
            onChooseEvent: null,
        };
    },

    methods: {
        // On drag, save actual position of cursor before any move
        onChoose(evt) {
            this.onChooseEvent = evt.originalEvent;
            this._sortable._appendGhost();
            this.onStart(evt);
        },

        // When cursor has moved and ghost has appeared, adjust the ghost's appearance
        onStart(evt) {
            // HTML nodes of the ghost
            const ghost = document.body.querySelector(
                `.${this._sortable.options.fallbackClass}`
            );
            if (!ghost) {
                return;
            }
            const componentGhost = this.ghost
                ? ghost.querySelector(this.ghost)
                : ghost;
            if (!componentGhost) {
                return;
            }

            // Move the center of the ghost at the cursor position
            if (this.ghost) {
                ghost.style.left = `${
                    this.onChooseEvent.clientX - componentGhost.offsetWidth / 2
                }px`;
                ghost.style.top = `${
                    this.onChooseEvent.clientY - componentGhost.offsetHeight / 2
                }px`;
            }

            if (evt.clone) {
                // Save data in the ghost
                // will be used on drop
                this.ghostDataset = evt.clone.dataset;
                this.ghostSize = {
                    width: componentGhost.offsetWidth,
                    height: componentGhost.offsetHeight,
                };

                // Emit drag event
                this.$emit("drag", {
                    originalEvent: evt.originalEvent,
                    dataset: this.ghostDataset,
                    position: this.ghostSize,
                });
            }
            this.$store.commit(
                "app/librariesOfUniverse/createObjectByClick",
                true
            );
        },

        // On drop, emit event with position & ghost data
        onEnd(evt) {
            this.$emit("drop", {
                originalEvent: evt.originalEvent,
                dataset: this.ghostDataset,
                position: this.ghostSize,
            });
            this.$store.commit(
                "app/librariesOfUniverse/createObjectByClick",
                false
            );
        },

        // A click event is detected if choose & unchoose positions are the same.
        // On click, emulate a choose event...
        onUnchoose(evt) {
            if (
                Math.abs(
                    evt.originalEvent.clientX - this.onChooseEvent.clientX
                ) < 1 &&
                Math.abs(
                    evt.originalEvent.clientY - this.onChooseEvent.clientY
                ) < 1
            ) {
                const target =
                    this.onChooseEvent.target || this.onChooseEvent.srcElement;
                target.dispatchEvent(this.onChooseEvent);
            }
        },
        nulling(evt) {
            const ghost = document.body.querySelector(
                `.${this._sortable.options.fallbackClass}`
            );
            if (this._sortable && evt.keyCode == 27 /* Escape */) {
                this._sortable._nulling();
                if (ghost) ghost.remove();
            }
        },

        destroyed() {
            document.removeEventListener("keydown", this.nulling);

            // Remove the ghosts if it remains visible
            const ghost = document.body.querySelector(
                `.${this._sortable.options.fallbackClass}`
            );
            if (ghost) ghost.remove();
        },
    },
};
</script>
<style>
.sortable-fallback {
    z-index: var(--max-z-index);
    width: auto !important;
    height: auto !important;
    display: grid !important;
    cursor: move !important;
}
</style>
