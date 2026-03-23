<!--
    This file contains the corrections and adaptations made, on the fly, on the vue-drag-resize library.
    Ce fichier contient les corrections et adptations effectuées, à la volée, sur la bibliothèque vue-drag-resize.
-->
<script>
// Original VDR library
import VDR from "vue-drag-resize";

// Style mapping from original VDR library
const styleMapping = {
    y: {
        t: "top",
        m: "marginTop",
        b: "bottom",
    },
    x: {
        l: "left",
        m: "marginLeft",
        r: "right",
    },
};

export default {
    name: "VueDragResize",

    mixins: [VDR],

    props: {
        z: {
            type: Number,
            default: 0,
            validator: function (val) {
                return typeof val === "number";
            },
        },
    },
    inject: ["$view"],

    updated() {
        // FIX active property was lost on render
        if (this.active != this.isActive) {
            this.active = this.isActive;
        }
    },

    computed: {
        // FIX style render to avoid negative width and height
        // Negative values caused warnings in Firefox
        style() {
            return {
                top: (this.top > 0 ? this.top : 0) + "px",
                left: (this.left > 0 ? this.left : 0) + "px",
                width: (this.width > 0 ? this.width : 0) + "px",
                height: (this.height > 0 ? this.height : 0) + "px",
                zIndex: this.zIndex,
            };
        },

        // FEAT: adaptative position of sticks on mobile devices
        // FIX: using global scale in function instead of props avoid frequent re-renders on zoom
        vdrStick() {
            return (stick) => {
                // Avoid render on pan or zoom if resize sticks are now displayed
                if (!this.isActive) {
                    return;
                }
                if (!this.isResizable) {
                    return;
                }

                // Get current Panzoom's scale and device kind (mobile or not)
                const scale = this.getScale();

                // Adjust size of sticks, based on square root of scale
                const unit = 30 / Math.sqrt(scale);
                const stickStyle = {
                    width: `${unit}px`,
                    height: `${unit}px`,
                };

                // Adjust position of sticks
                stickStyle[styleMapping.y[stick[0]]] = `${-0.6 * unit}px`;
                stickStyle[styleMapping.x[stick[1]]] = `${-0.6 * unit}px`;

                return stickStyle;
            };
        },
    },

    methods: {
        // Read scale in store
        getScale() {
            try {
                return this.$store.getters[`panzoom/scale`];
            } catch (e) {
                return 1;
            }
        },

        // FEAT: allow input, textarea and select in a vdr object
        bodyDown(ev) {
            const target = ev.target || ev.srcElement;

            // If the event's target is the active element (id: is an input, a textarea...) :
            // - stop propagation to panzoom
            // - break the VDR's drag process
            if (target === document.activeElement) {
                ev.stopPropagation();
                return;
            }

            if (!this.preventActiveBehavior) {
                this.active = true;
            }

            if (ev.button && ev.button !== 0) {
                return;
            }

            this.$emit("clicked", ev);

            if (/*!this.isDraggable ||*/ !this.active) {
                return;
            }

            if (
                this.dragHandle &&
                target.getAttribute("data-drag-handle") !== this._uid.toString()
            ) {
                return;
            }

            if (
                this.dragCancel &&
                target.getAttribute("data-drag-cancel") === this._uid.toString()
            ) {
                return;
            }
            if (!this.$store.getters[`app/objectsInBoard/modeIsDrawing`]) {
                ev.stopPropagation(); // Stop propagation to panzoom
            }

            ev.preventDefault();

            this.bodyDrag = true;

            this.stickStartPos.mouseX =
                typeof ev.pageX !== "undefined"
                    ? ev.pageX
                    : ev.touches[0].pageX;
            this.stickStartPos.mouseY =
                typeof ev.pageY !== "undefined"
                    ? ev.pageY
                    : ev.touches[0].pageY;

            this.stickStartPos.left = this.left;
            this.stickStartPos.right = this.right;
            this.stickStartPos.top = this.top;
            this.stickStartPos.bottom = this.bottom;
        },

        // FEAT: dont really move object on dragging, that will be done by board-multiple-drag.
        // This delegation removes lag between objects in case of multiple drag.
        bodyMove(ev) {
            const scale = this.getScale();

            const delta = {
                x:
                    (this.axis !== "y" && this.axis !== "none"
                        ? this.stickStartPos.mouseX -
                          (ev.pageX || ev.touches[0].pageX)
                        : 0) / scale,
                y:
                    (this.axis !== "x" && this.axis !== "none"
                        ? this.stickStartPos.mouseY -
                          (ev.pageY || ev.touches[0].pageY)
                        : 0) / scale,
            };

            let newPosition = {
                left: this.stickStartPos.left - delta.x,
                top: this.stickStartPos.top - delta.y,
                bottom: this.stickStartPos.bottom + delta.y,
                right: this.stickStartPos.right + delta.x,
                width: this.width,
                height: this.height,
            };

            if (this.snapToGrid) {
                let diffT =
                    newPosition.top -
                    Math.floor(newPosition.top / this.gridY) * this.gridY;
                let diffB =
                    this.parentHeight -
                    newPosition.bottom -
                    Math.floor(
                        (this.parentHeight - newPosition.bottom) / this.gridY
                    ) *
                        this.gridY;
                let diffL =
                    newPosition.left -
                    Math.floor(newPosition.left / this.gridX) * this.gridX;
                let diffR =
                    this.parentWidth -
                    newPosition.right -
                    Math.floor(
                        (this.parentWidth - newPosition.right) / this.gridX
                    ) *
                        this.gridX;

                if (diffT > this.gridY / 2) {
                    diffT = diffT - this.gridY;
                }
                if (diffB > this.gridY / 2) {
                    diffB = diffB - this.gridY;
                }
                if (diffL > this.gridX / 2) {
                    diffL = diffL - this.gridX;
                }
                if (diffR > this.gridX / 2) {
                    diffR = diffR - this.gridX;
                }

                const alignTop = Math.abs(diffB) >= Math.abs(diffT);
                const alignLeft = Math.abs(diffR) >= Math.abs(diffL);
                newPosition.top = newPosition.top - (alignTop ? diffT : diffB);
                newPosition.bottom =
                    this.parentHeight - newPosition.height - newPosition.top;
                newPosition.left =
                    newPosition.left - (alignLeft ? diffL : diffR);
                newPosition.right =
                    this.parentWidth - newPosition.width - newPosition.left;
            }

            this.$emit("dragging", newPosition);
        },

        // FIX: using global scale in function instead of props avoid frequent re-renders on zoom
        stickMove(ev) {
            const scale = this.getScale();
            const stickStartPos = this.stickStartPos;

            const delta = {
                x:
                    (stickStartPos.mouseX - (ev.pageX || ev.touches[0].pageX)) /
                    scale,
                y:
                    (stickStartPos.mouseY - (ev.pageY || ev.touches[0].pageY)) /
                    scale,
            };

            let rect = {
                left: stickStartPos.left,
                top: stickStartPos.top,
                width:
                    this.parentWidth - stickStartPos.left - stickStartPos.right,
                height:
                    this.parentHeight -
                    stickStartPos.top -
                    stickStartPos.bottom,
                stick: this.currentStick,
            };

            switch (this.currentStick[0]) {
                case "b":
                    if (this.snapToGrid) {
                        delta.y =
                            this.parentHeight -
                            Math.round(
                                (this.parentHeight - delta.y) / this.gridY
                            ) *
                                this.gridY;
                    }

                    rect.height -= delta.y;
                    break;

                case "t":
                    if (this.snapToGrid) {
                        delta.y = Math.round(delta.y / this.gridY) * this.gridY;
                    }

                    rect.height += delta.y;
                    rect.top -= delta.y;
                    break;
            }

            switch (this.currentStick[1]) {
                case "r":
                    if (this.snapToGrid) {
                        delta.x =
                            this.parentWidth -
                            Math.round(
                                (this.parentWidth - delta.x) / this.gridX
                            ) *
                                this.gridX;
                    }

                    rect.width -= delta.x;
                    break;

                case "l":
                    if (this.snapToGrid) {
                        delta.x = Math.round(delta.x / this.gridX) * this.gridX;
                    }

                    rect.width += delta.x;
                    rect.left -= delta.x;
                    break;
            }

            this.$emit("resizing", rect);
        },
    },
};
</script>
<style>
.vdr.active:before {
    width: unset !important;
    height: unset !important;
    top: calc(-1 * var(--selection-margin)) !important;
    left: calc(-1 * var(--selection-margin)) !important;
    bottom: calc(-1 * var(--selection-margin)) !important;
    right: calc(-1 * var(--selection-margin)) !important;
}

:root {
    --vdr-stick-margin: calc(-1 * var(--selection-margin) - 4px);
}
.vdr-stick-tl,
.vdr-stick-tm,
.vdr-stick-tr {
    margin-top: var(--vdr-stick-margin) !important;
}
.vdr-stick-bl,
.vdr-stick-bm,
.vdr-stick-br {
    margin-bottom: var(--vdr-stick-margin) !important;
}
.vdr-stick-tl,
.vdr-stick-ml,
.vdr-stick-bl {
    margin-left: var(--vdr-stick-margin) !important;
}
.vdr-stick-tr,
.vdr-stick-mr,
.vdr-stick-br {
    margin-right: var(--vdr-stick-margin) !important;
}

.vdr-stick-tl,
.vdr-stick-tr,
.vdr-stick-bl,
.vdr-stick-br {
    background: var(--color-select, #2196f3) !important;
    border: none !important;
    box-shadow: none !important;
    z-index: 1;
}
.vdr-stick-ml,
.vdr-stick-mr {
    top: 0 !important;
    bottom: 0;
    height: unset !important;
}
.vdr-stick-tm,
.vdr-stick-bm {
    left: 0 !important;
    right: 0;
    width: unset !important;
}

.vdr-stick-ml,
.vdr-stick-mr,
.vdr-stick-bm,
.vdr-stick-tm {
    opacity: 0;
}
</style>
