<template>
    <g>
        <g v-for="drawing of drawings" :key="drawing.id">
            <!-- Anchors'definition & design -->
            <defs>
                <marker
                    v-for="anchor of anchors"
                    :key="anchor.positionId"
                    :id="`${anchor.linkObjectId}-${linkId}-${drawing.id}`"
                    viewBox="0 0 20 20"
                    refX="6"
                    refY="10"
                    :orient="anchor.orient"
                    :markerWidth="drawing.anchoreSize"
                    :markerHeight="drawing.anchoreSize"
                    :fill="drawing.color"
                    :stroke="
                        anchor.linkObject.type === 'arrow' ? drawing.color : ''
                    "
                >
                    <path
                        v-if="anchor.linkObject.type === 'triangle'"
                        :d="drawing.triangle"
                    />
                    <circle
                        v-else-if="anchor.linkObject.type === 'circle'"
                        cx="6"
                        cy="10"
                        r="5"
                    />
                    <rect
                        v-else-if="anchor.linkObject.type === 'square'"
                        y="5"
                        x="1"
                        width="10"
                        height="10"
                    />
                    <rect
                        v-else-if="anchor.linkObject.type === 'rhombus'"
                        y="-0.6"
                        x="8"
                        width="7"
                        height="7"
                        transform="rotate(45)scale(0.98)"
                    />
                    <polyline
                        v-else-if="anchor.linkObject.type === 'arrow'"
                        fill="none"
                        points="1 6,9 10,1 14"
                        :stroke-width="drawing.polylineStrokeWidth"
                    />
                </marker>
            </defs>

            <!-- Link itself, link selector & selection viewer -->
            <g
                v-for="(path, index) in paths"
                :key="path"
                :stroke="drawing.color"
                :marker-start="`url(#${anchors[index].linkObjectId}-${linkId}-${drawing.id})`"
                :marker-end="
                    anchors.length === 2
                        ? `url(#${anchors[1].linkObjectId}-${linkId}-${drawing.id})`
                        : null
                "
                fill="none"
            >
                <path
                    :key="linkId"
                    :d="path"
                    :stroke-width="drawing.pathStrokeWidth"
                    stroke-linejoin="miter"
                    stroke-linecap="round"
                    @mouseover="onOver"
                    @mouseout="onOut"
                    @mousedown="onClick"
                    @touchstart="onClick"
                    style="pointer-events: all"
                    :stroke-dasharray="drawing.dashArray"
                />
            </g>
        </g>
        <foreignObject
            class="link-view-title-wrapper"
            v-if="title || isSelected"
            :x="barycenter.x - titleSize.w / 2"
            :y="barycenter.y - titleSize.h / 4"
            :width="titleSize.w"
            :height="titleSize.h"
            @mousemove.stop
        >
            <el-input
                :style="{
                    backgroundColor: cleanLinkModelData.color,
                    color: titleColor,
                }"
                v-model="title"
            />
            <div class="link-view-title-hidden">
                <span
                    class="link-view-title-hidden"
                    ref="link-view-title-hidden"
                    >{{ title }}</span
                >
            </div>
        </foreignObject>
    </g>
</template>
<script>
import app from "../../conf/app";
import blackOrWhite from "../../utils/black-or-white";
import jsonDeepCopy from "../../utils/json-deep-copy";
import meanBy from "lodash.meanby";
export default {
    props: {
        linkId: {
            type: String,
        },
        isSelected: {
            type: Boolean,
            default: false,
        },
        isSelectable: {
            type: Boolean,
            default: false,
        },
        linkModelData: {
            type: Object,
            default: null,
        },
        objectAndPosition: {
            type: Array,
            required: true,
        },
    },
    inject: ["$view"],
    computed: {
        cleanLinkModelData() {
            return this.linkModelData
                ? this.linkModelData
                : this.$store.getters[`linkAlive/byId`](this.linkId)?.data;
        },

        anchors() {
            const largestObjects = jsonDeepCopy(this.objectAndPosition).sort(
                (a, b) =>
                    b.position.data.width +
                    b.position.data.height -
                    a.position.data.width -
                    a.position.data.height
            );

            // Anchor selection
            for (let item of largestObjects) {
                const anchorGap =
                    item.object.data.type != "none"
                        ? this.cleanLinkModelData.size * 9
                        : this.cleanLinkModelData.size == 0.3
                        ? app.linkStyle.xSmall.gapWithoutAnchors
                        : this.cleanLinkModelData.size == 1
                        ? app.linkStyle.small.gapWithoutAnchors
                        : this.cleanLinkModelData.size == 2
                        ? app.linkStyle.medium.gapWithoutAnchors
                        : this.cleanLinkModelData.size == 3
                        ? app.linkStyle.large.gapWithoutAnchors
                        : 0;

                const barycenter = {
                    x: meanBy(
                        largestObjects,
                        ({ anchor, position }) =>
                            anchor?.x ||
                            position.data.left + position.data.width / 2
                    ),
                    y: meanBy(
                        largestObjects,
                        ({ anchor, position }) =>
                            anchor?.y ||
                            position.data.top + position.data.height / 2
                    ),
                };
                item.anchor = [
                    {
                        x: item.position.data.left - anchorGap,
                        y:
                            item.position.data.top +
                            item.position.data.height / 2,
                        orient: 0,
                        curve: { x: -1, y: 0 },
                    }, // left
                    {
                        x:
                            item.position.data.left +
                            item.position.data.width / 2,
                        y: item.position.data.top - anchorGap,
                        orient: 90,
                        curve: { x: 0, y: -1 },
                    }, // top
                    {
                        x:
                            item.position.data.left +
                            item.position.data.width +
                            anchorGap,
                        y:
                            item.position.data.top +
                            item.position.data.height / 2,
                        orient: 180,
                        curve: { x: 1, y: 0 },
                    }, // right
                    {
                        x:
                            item.position.data.left +
                            item.position.data.width / 2,
                        y:
                            item.position.data.top +
                            item.position.data.height +
                            anchorGap,
                        orient: 270,
                        curve: { x: 0, y: 1 },
                    }, // bottom
                ]
                    .map((anchor) => ({
                        ...anchor,
                        dist:
                            Math.pow(barycenter.x - anchor.x, 2) +
                            Math.pow(barycenter.y - anchor.y, 2),
                    }))
                    .sort((a, b) => a.dist - b.dist)[0];
            }

            // Computations that require all anchors
            const barycenter = {
                x: meanBy(largestObjects, ({ anchor }) => anchor.x),
                y: meanBy(largestObjects, ({ anchor }) => anchor.y),
            };
            for (let item of largestObjects) {
                const delta = {
                    x: barycenter.x - item.anchor.x,
                    y: barycenter.y - item.anchor.y,
                };

                item.anchor.curve.x *=
                    Math.abs(delta.y) * this.cleanLinkModelData.curve;
                item.anchor.curve.y *=
                    Math.abs(delta.x) * this.cleanLinkModelData.curve;

                if (
                    item.object.data.type != "square" &&
                    (this.cleanLinkModelData.curve === 0 || // Straight link
                        this.cleanLinkModelData.curve == -2) // Lightning arrow
                ) {
                    item.anchor.orient =
                        (Math.atan2(-delta.y, -delta.x) * 180) / Math.PI;
                }
            }
            return largestObjects.map(({ anchor, object, position }) => ({
                positionId: position.positionId,
                linkObjectId: object.objectId,
                linkObject: object.data,
                x: anchor.x,
                y: anchor.y,
                orient: anchor.orient,
                curve: anchor.curve,
            }));
        },
        paths() {
            const render = (source, target) => {
                if (this.cleanLinkModelData.curve == -1) {
                    // angular
                    if (source.orient % 180 === 0) {
                        // horizontal
                        if (target.orient % 180 === 0) {
                            return (
                                `M${source.x},${source.y} ` +
                                `${(source.x + target.x) / 2},${source.y} ` +
                                `${(source.x + target.x) / 2},${target.y} ` +
                                `${target.x},${target.y}`
                            );
                        } else {
                            return (
                                `M${source.x},${source.y} ` +
                                `${target.x},${source.y} ` +
                                `${target.x},${target.y}`
                            );
                        }
                    } else {
                        // vertical
                        if (target.orient % 180 === 0) {
                            return (
                                `M${source.x},${source.y} ` +
                                `${source.x},${target.y} ` +
                                `${target.x},${target.y}`
                            );
                        } else {
                            return (
                                `M${source.x},${source.y} ` +
                                `${source.x},${(source.y + target.y) / 2} ` +
                                `${target.x},${(source.y + target.y) / 2} ` +
                                `${target.x},${target.y}`
                            );
                        }
                    }
                } else if (this.cleanLinkModelData.curve == -2) {
                    // lightening
                    const Z = 0.01; // Lightning arrow width
                    if (source.orient % 180 === 0) {
                        return (
                            `M${source.x},${source.y} ` +
                            `${
                                (source.x + target.x) /
                                (2 + (source.x > target.x ? Z : -Z))
                            }, ${
                                (target.y + source.y) /
                                    (2 + (target.y < source.y ? Z : -Z)) +
                                (target.y - source.y) / 10
                            } ` +
                            `${
                                (source.x + target.x) /
                                (2 + (source.x > target.x ? -Z : Z))
                            }, ${
                                (target.y + source.y) /
                                    (2 + (target.y < source.y ? -Z : Z)) -
                                (target.y - source.y) / 10
                            } ` +
                            `${target.x},${target.y}`
                        );
                    } else {
                        return (
                            `M${source.x},${source.y} ` +
                            `${
                                (target.x + source.x) /
                                    (2 + (target.x < source.x ? Z : -Z)) +
                                (target.x - source.x) / 10
                            }, ${
                                (source.y + target.y) /
                                (2 + (source.y > target.y ? Z : -Z))
                            } ` +
                            `${
                                (target.x + source.x) /
                                    (2 + (target.x < source.x ? -Z : Z)) -
                                (target.x - source.x) / 10
                            }, ${
                                (source.y + target.y) /
                                (2 + (source.y > target.y ? -Z : Z))
                            } ` +
                            `${target.x},${target.y}`
                        );
                    }
                } else {
                    //curved & straight line
                    return (
                        `M${source.x} ${source.y} ` +
                        `C${source.x + (source?.curve?.x || 0)} ${
                            source.y + (source?.curve?.y || 0)
                        }` +
                        ` ${target.x + (target?.curve?.x || 0)} ${
                            target.y + (target?.curve?.y || 0)
                        },` +
                        ` ${target.x} ${target.y}`
                    );
                }
            };
            return this.anchors.length == 2
                ? [render(this.anchors[0], this.anchors[1])]
                : this.anchors.map((anchor) => render(anchor, this.barycenter));
        },
        drawings() {
            const res = [];

            // Invisible and widther copy of the link itself: ease the selection
            if (this.isSelectable) {
                res.push({
                    id: "selector",
                    anchoreSize: 5,
                    color: this.over ? this.cleanLinkModelData.color : "none",
                    triangle: "M 2 5 L 10.5 10 L 2 15 z",
                    polylineStrokeWidth: 5,
                    pathStrokeWidth: 10 * this.cleanLinkModelData.size,
                    dashArray: "0 0",
                });
            }

            // Selected link's shadow
            if (this.isSelected) {
                res.push({
                    id: "shadow",
                    anchoreSize: 5,
                    color: "#80828C",
                    triangle: "M 2 5 L 10.5 10 L 2 15 z",
                    polylineStrokeWidth: 5,
                    pathStrokeWidth: 10 * this.cleanLinkModelData.size,
                    dashArray: "0 0",
                });
            }

            // Link itself
            res.push({
                id: "self",
                anchoreSize: 8,
                color: this.cleanLinkModelData.color,
                triangle: "M 2 6 L 10 10 L 2 14 z",
                polylineStrokeWidth: 2,
                pathStrokeWidth: 4 * this.cleanLinkModelData.size,
                dashArray: `${
                    this.cleanLinkModelData.dash * this.cleanLinkModelData.size
                } ${
                    this.cleanLinkModelData.dash * this.cleanLinkModelData.size
                }`,
            });

            return res;
        },

        barycenter() {
            //
            if (
                this.cleanLinkModelData.curve > 0 && // Gentle or tight curve: on the middle of the Bezier curve
                this.anchors.length == 2
            ) {
                return getBezierXY(
                    0.5,
                    this.anchors[0].x,
                    this.anchors[0].y,
                    this.anchors[0].x + (this.anchors[0]?.curve?.x || 0),
                    this.anchors[0].y + (this.anchors[0]?.curve?.y || 0),
                    this.anchors[1].x + (this.anchors[1]?.curve?.x || 0),
                    this.anchors[1].y + (this.anchors[1]?.curve?.y || 0),
                    this.anchors[1].x,
                    this.anchors[1].y
                );
            } else if (
                this.cleanLinkModelData.curve == -1 && // Single angulared link: on the angle
                this.anchors.length == 2 &&
                (this.anchors[0].orient - this.anchors[1].orient + 360) %
                    180 ===
                    90
            ) {
                return this.anchors[0].orient % 180 === 0
                    ? {
                          x: this.anchors[1].x,
                          y: this.anchors[0].y,
                      }
                    : {
                          x: this.anchors[0].x,
                          y: this.anchors[1].y,
                      };
            } else {
                // General case: real barycenter
                return {
                    x: meanBy(this.anchors.map(({ x }) => x)),
                    y: meanBy(this.anchors.map(({ y }) => y)),
                };
            }
        },

        title: {
            get() {
                if (this.linkId) {
                    return this.$store.getters[`linkAlive/titleById`](
                        this.linkId
                    );
                } else {
                    return "";
                }
            },
            set(title) {
                if (this.linkId) {
                    this.doGetTitleSize();
                    this.$store.dispatch("linkAlive/update", {
                        worldId: this.$view.worldId,
                        boardId: this.$view.boardId,
                        linkId: this.linkId,
                        data: { title },
                        reply: false,
                    });
                }
            },
        },
        titleColor() {
            // Set the font color to white or black depending on the background color
            return blackOrWhite(this.cleanLinkModelData.color);
        },
    },
    data() {
        return {
            over: false,
            titleSize: {
                w: 100,
                h: 30,
            },
        };
    },
    methods: {
        doGetTitleSize() {
            if (this.linkId) {
                this.$nextTick(() => {
                    if (this.$refs["link-view-title-hidden"]) {
                        const w =
                            this.$refs["link-view-title-hidden"].offsetWidth;
                        const h =
                            this.$refs["link-view-title-hidden"].offsetHeight;
                        this.titleSize = {
                            w: w + h,
                            h: h * 2,
                        };
                    }
                });
            }
        },

        // Select the link when clicked
        onClick(evt) {
            if (this.isSelectable) {
                this.$emit("click", evt);
            }
        },

        // Preview the selection shadow when pointer is over the link
        onOver() {
            this.over = true;
        },
        onOut() {
            this.over = false;
        },
    },
    created() {
        this.doGetTitleSize();
    },
    watch: {
        title() {
            this.doGetTitleSize();
        },
        isSelected() {
            this.doGetTitleSize();
        },
    },
};

// http://www.independent-software.com/determining-coordinates-on-a-html-canvas-bezier-curve.html
function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
    return {
        x:
            Math.pow(1 - t, 3) * sx +
            3 * t * Math.pow(1 - t, 2) * cp1x +
            3 * t * t * (1 - t) * cp2x +
            t * t * t * ex,
        y:
            Math.pow(1 - t, 3) * sy +
            3 * t * Math.pow(1 - t, 2) * cp1y +
            3 * t * t * (1 - t) * cp2y +
            t * t * t * ey,
    };
}
</script>
<style>
.link-view-title-wrapper {
    pointer-events: all;
    font-size: 16px !important;
}
.link-view-title-wrapper .el-input {
    border-radius: 4px;
    border-width: 0;
}
.link-view-title-wrapper input {
    height: 2.4em;
    padding: 0.5em;
    background-color: transparent;
    border-width: 0;
    color: inherit;
    text-align: center;
}
.link-view-title-hidden {
    opacity: 0;
    padding: 8px;
    position: absolute;
    width: max-content;
}
</style>
