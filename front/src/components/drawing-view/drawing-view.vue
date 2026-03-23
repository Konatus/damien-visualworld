<template>
    <div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="drawing-view"
            :width="width"
            :height="height"
            :viewport="`0 0 ${width} ${height}`"
            v-for="(path, index) of pathsOk"
            :key="index"
        >
            <path
                :data-index="index"
                :d="path.d"
                :fill="path.fill"
                :stroke="path.stroke"
                :style="{
                    fill: path.fill,
                    stroke: path.stroke,
                } /* necessary for docx captions */"
                :stroke-width="path.strokeWidth"
                :stroke-linecap="path.strokeLinecap"
                :stroke-linejoin="path.strokeLinejoin"
            />
        </svg>
    </div>
</template>
<script>
const COEFF_CURVE = 20 / 100;
const COEFF_AVG = 30 / 100;
import app from "../../conf/app";
import jsonDeepCopy from "../../utils/json-deep-copy";
export default {
    name: "DrawingView",
    props: {
        paths: {
            type: Array,
            default: () => [],
        },
        absolute: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            pathsOkCache: {},
        };
    },
    computed: {
        vdrPosition() {
            try {
                if (!this.absolute) {
                    let component = this;
                    for (let k = 0; k < 99; k++) {
                        if (
                            component?.position?.width &&
                            component?.position?.height
                        ) {
                            return component.position;
                        } else if (component.$parent) {
                            component = component.$parent;
                        } else {
                            break;
                        }
                    }
                }
            } catch {
                /* not catched */
            }
            return undefined;
        },
        width() {
            return this.vdrPosition?.width ?? app.board.size.width;
        },
        height() {
            return this.vdrPosition?.height ?? app.board.size.height;
        },

        pathsOk() {
            const paths = jsonDeepCopy(this.paths);
            for (let pathId = 0; pathId < paths.length; pathId++) {
                if (
                    pathId != paths.length - 1 &&
                    paths[pathId].positions.length &&
                    this.pathsOkCache[pathId]
                ) {
                    paths[pathId].d = this.pathsOkCache[pathId];
                }

                // Transform absolute positions to relative, if necessary
                const relatives = paths[pathId].positions.map((position) => ({
                    ...position,
                    x: position.left * (this.absolute ? 1 : this.width),
                    y: position.top * (this.absolute ? 1 : this.height),
                }));

                // Remove noise with a data regression
                const regression = relatives.map((position, idx, positions) => {
                    if (idx === 0 || idx === positions.length - 1) {
                        return position;
                    } else {
                        return {
                            ...position,
                            x:
                                (1 - COEFF_AVG) * position.x +
                                (COEFF_AVG / 2) *
                                    (positions[idx - 1].x +
                                        positions[idx + 1].x),
                            y:
                                (1 - COEFF_AVG) * position.y +
                                (COEFF_AVG / 2) *
                                    (positions[idx - 1].y +
                                        positions[idx + 1].y),
                        };
                    }
                });

                // Make SVG curves
                const curved = regression.map((position, idx, positions) => {
                    if (
                        idx === 0 ||
                        idx === 1 ||
                        idx === positions.length - 2 ||
                        idx === positions.length - 1
                    ) {
                        return position;
                    } else {
                        return {
                            ...position,
                            x1:
                                positions[idx - 1].x +
                                COEFF_CURVE *
                                    (positions[idx - 1].x -
                                        positions[idx - 2].x),
                            y1:
                                positions[idx - 1].y +
                                COEFF_CURVE *
                                    (positions[idx - 1].y -
                                        positions[idx - 2].y),
                            x2:
                                positions[idx + 0].x +
                                COEFF_CURVE *
                                    (positions[idx + 0].x -
                                        positions[idx + 1].x),
                            y2:
                                positions[idx + 0].y +
                                COEFF_CURVE *
                                    (positions[idx + 0].y -
                                        positions[idx + 1].y),
                        };
                    }
                });

                // To SVG string
                paths[pathId].d = curved
                    .map((pos, idx) => {
                        if (idx === 0 || pos.erased) {
                            return `M ${pos.x} ${pos.y}`;
                        } else if (
                            pos.x1 !== undefined &&
                            pos.y1 !== undefined &&
                            pos.x2 !== undefined &&
                            pos.y2 !== undefined
                        ) {
                            return `C ${pos.x1} ${pos.y1} ${pos.x2} ${pos.y2} ${pos.x} ${pos.y}`;
                        } else {
                            return `L ${pos.x} ${pos.y}`;
                        }
                    })
                    .join(" ");

                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                this.pathsOkCache[pathId] = paths[pathId].d;
            }
            return paths;
        },
    },
};
</script>
<style>
.drawing-view {
    position: absolute;
    z-index: var(--max-z-index);
}
</style>
