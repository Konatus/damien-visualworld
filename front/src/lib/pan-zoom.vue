<!--
    This file integrates the Panzoom library in Vue.
    Ce fichier intègre la bibliothèque Panzoom à Vue.
-->
<template>
    <div class="vue-pan-zoom-wrapper">
        <div id="panzoom-scene" class="vue-pan-zoom-scene">
            <slot></slot>
        </div>
    </div>
</template>
<script>
import isEqual from "lodash.isequal";
import app from "../conf/app";
import { execAfterPause } from "../utils/frequency-limit";
import scale from "../utils/scale";

import LibPanzoom from "panzoom"; // Not a component, a real library
export default {
    name: "panZoom",

    props: {
        options: Object,
    },
    inject: ["$view"],

    data() {
        return {
            instance: {},
            handleTouchMove_previousPosition: null,
            resizeObserver: null,
        };
    },

    computed: {
        board() {
            return app.board.size;
        },
        scale() {
            return this.$store.getters[`panzoom/scale`];
        },
        scene() {
            return this.$store.getters[`panzoom/scene`];
        },
    },

    watch: {
        scene() {
            // Adjust min zoom
            const minZoom = scale.getMinScale(
                this.scene.width,
                this.scene.height,
                app.board.size.width,
                app.board.size.height,
                app.board.zoom.scaleBoundsMargin
            );
            this.instance.setMinZoom(minZoom);
            this.$store.commit(`panzoom/minScale`, minZoom);
        },
    },

    mounted() {
        // Instanciate original library with event management
        const scene = this.$el.querySelector(".vue-pan-zoom-scene");
        if (scene) {
            this.resizeObserver = new ResizeObserver(this.doCommit).observe(
                this.$el
            );
            this.$el.addEventListener("touchmove", this.handleTouchMove);

            // Call original library
            this.instance = LibPanzoom(scene, {
                ...this.options,
                filterKey: () => true,
            });

            // Emit events received from Panzoom
            this.instance.on("pan", (evt) => {
                this.$emit("pan");
                this.onPanOrZoom(evt);
            });
            // TODO: is it relevant to listen to pan / zoom separetely ?
            this.instance.on("zoom", (evt) => {
                this.$emit("zoom");
                this.onPanOrZoom(evt);
            });

            // Save instance of Panzoom
            this.$store.commit(`panzoom/instance`, this.instance);
        }
    },
    destroyed() {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.$el);
        }
        this.$el.removeEventListener("touchmove", this.handleTouchMove);
    },

    methods: {
        // Adding pan to existing zoom on touchMove
        handleTouchMove(evt) {
            if (evt.touches.length > 1 && !this.instance.isPaused()) {
                // Compute current position
                const touches = Object.values(evt.touches);
                const currentPosition = {
                    x:
                        touches.map((t) => t.clientX).reduce((a, b) => a + b) /
                        evt.touches.length,
                    y:
                        touches.map((t) => t.clientY).reduce((a, b) => a + b) /
                        evt.touches.length,
                };

                // Lets do pan
                if (this.handleTouchMove_previousPosition) {
                    const delta = {
                        x:
                            currentPosition.x -
                            this.handleTouchMove_previousPosition.x,
                        y:
                            currentPosition.y -
                            this.handleTouchMove_previousPosition.y,
                    };
                    this.instance.moveBy(delta.x, delta.y);
                }

                // Save current position
                this.handleTouchMove_previousPosition = currentPosition;
            } else {
                this.handleTouchMove_previousPosition = null;
            }
        },

        onPanOrZoom(evt) {
            const transform = evt.getTransform();
            const coord = scale.replaceInBounds(
                transform.x,
                transform.y,
                transform.scale,
                this.scene.width,
                this.scene.height,
                app.board.size.width,
                app.board.size.height,
                app.board.zoom.scaleBoundsMargin
            );
            if (coord.outOfBounds) {
                this.instance.moveTo(coord.x, coord.y);
            }

            // New value will be saved atfer a short time, if no other pan or zoom will have occured...
            execAfterPause("panzoom.onPanOrZoom", 50, () => {
                this.$store.commit(`panzoom/scale`, transform.scale);
                this.$store.commit(`panzoom/x`, transform.x);
                this.$store.commit(`panzoom/y`, transform.y);
            }).catch(() => {
                /* nothing to do */
            });
        },

        // Commit new state
        doCommit() {
            // Position of panzoom in window
            const boundingClientRect = this.$el.getBoundingClientRect();
            const boundingClientObj = {
                top: boundingClientRect.top,
                bottom: boundingClientRect.bottom,
                height: boundingClientRect.height,
                left: boundingClientRect.left,
                right: boundingClientRect.right,
                width: boundingClientRect.width,
            };
            if (!isEqual(boundingClientObj, this.scene)) {
                // Save scene
                this.$store.commit(`panzoom/scene`, boundingClientObj);
            }
        },
    },
};
</script>
