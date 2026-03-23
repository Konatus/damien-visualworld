<template>
    <div
        id="selection-by-drag"
        :class="styleOfSelector ? 'active' : 'inactive'"
        @mousedown="onConditionalStart"
        @mousemove="onMove"
        @mouseup="onEnd"
        @touchstart="onConditionalStart"
        @touchmove="onMove"
        @touchend="onEnd"
    >
        <div
            id="selection-by-drag-selector"
            v-if="styleOfSelector"
            :style="styleOfSelector"
        />
    </div>
</template>

<script>
import Position from "../../utils/position";
export default {
    name: "SelectionByDrag",

    inject: ["$view"],

    data() {
        return {
            panzoom: null,
            startPosition: null,
            currentPosition: null,
            area: null,
        };
    },

    computed: {
        inProgress() {
            return !!this.startPosition;
        },
        styleOfSelector() {
            // Exit if area of selection is null
            if (!this.area) {
                return null;
            }

            return {
                left: `${this.area.left}px`,
                top: `${this.area.top}px`,
                width: `${this.area.width}px`,
                height: `${this.area.height}px`,
                borderWidth: `${5 / Math.sqrt(this.panzoom.scale)}px`,
            };
        },
    },

    watch: {
        inProgress() {
            this.$store.commit(
                `app/objectsInBoard/selectInProgress`,
                this.inProgress
            );
        },
    },

    methods: {
        // Start if shift or ctrl key is pressed
        onConditionalStart(evt) {
            evt.preventDefault();
            // First of all, a click event is sent in order to reset current selection
            this.$emit("selectionByDrag_clicked", {
                originalEvent: evt,
            });

            // If mode is the select one, this is the start of a selection by drag
            if (this.$store.getters[`app/objectsInBoard/modeIsSelect`]) {
                evt.stopPropagation(); // Stop propagation to panzoom
                this.onStart(evt);
            }

            this.$store.commit("app/objectsInBoard/setDrawerNone");
        },

        // Save start position
        // may be directly called eg using "v-touch:touchhold="onStart"
        onStart(evt) {
            this.panzoom = this.$store.getters[`panzoom/panzoom`];
            this.startPosition = Position.eventToLayer(evt, this.panzoom)[0]; // TODO: use full list in case of touch event
        },

        // Save current position
        onMove(evt) {
            if (this.startPosition) {
                // Avoid default navigation through history
                evt.preventDefault();

                // Save current position
                this.currentPosition = Position.eventToLayer(
                    evt,
                    this.panzoom
                )[0]; // TODO: use full list in case of touch event

                // Area of selection
                const area = { originalEvent: evt };
                if (this.startPosition.left < this.currentPosition.left) {
                    area.left = this.startPosition.left;
                    area.width =
                        this.currentPosition.left - this.startPosition.left;
                } else {
                    area.left = this.currentPosition.left;
                    area.width =
                        this.startPosition.left - this.currentPosition.left;
                }
                if (this.startPosition.top < this.currentPosition.top) {
                    area.top = this.startPosition.top;
                    area.height =
                        this.currentPosition.top - this.startPosition.top;
                } else {
                    area.top = this.currentPosition.top;
                    area.height =
                        this.startPosition.top - this.currentPosition.top;
                }

                // Render and emit event only if a real movement occured
                if (
                    !this.area ||
                    this.area.left !== area.left ||
                    this.area.width !== area.width ||
                    this.area.top !== area.top ||
                    this.area.height !== area.height
                ) {
                    this.area = area;
                    this.$emit("selectionByDrag_dragged", area); // TODO: does original event may be emitted
                }
            }
        },

        // Reset start and current positions
        onEnd() {
            this.panzoom = null;
            this.startPosition = null;
            this.currentPosition = null;
            this.area = null;
        },
    },
};
</script>

<style scoped>
#selection-by-drag {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
#selection-by-drag-selector {
    position: absolute;
    border-color: var(--style-color-grey);
    border-style: dashed;
    background: var(--color-drag-select);
    box-sizing: border-box;
}

#selection-by-drag.inactive {
    z-index: calc(-1 * var(--max-z-index));
}
#selection-by-drag.active {
    z-index: var(--max-z-index);
}
</style>
