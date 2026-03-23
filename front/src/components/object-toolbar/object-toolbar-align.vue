<template>
    <el-submenu
        class="object-toolbar-align board-toolbar-button"
        v-if="
            $store.getters[`app/objectsInBoard/selectedPositionIds`].length > 1
        "
        mode="horizontal"
        popper-class="object-toolbar-align-popover vw-link-color"
        index="object-toolbar-align"
    >
        <template slot="title">
            <div class="vw-triangle">
                <img
                    src="../../assets/icons/toolbar/align-left.svg"
                    :alt="$t('toolbar.align')"
                />
            </div>
        </template>

        <el-menu-item @click="onAlignLeft">
            <img
                src="../../assets/icons/toolbar/align-left.svg"
                :alt="$t('toolbar.align_left')"
            />
            <span class="label">{{ $t("toolbar.align_left") }}</span>
        </el-menu-item>
        <el-menu-item @click="onAlignCenter">
            <img
                src="../../assets/icons/toolbar/align-center.svg"
                :alt="$t('toolbar.center_vertically')"
            />
            <span class="label">{{ $t("toolbar.center_vertically") }}</span>
        </el-menu-item>
        <el-menu-item @click="onAlignRight">
            <img
                src="../../assets/icons/toolbar/align-right.svg"
                :alt="$t('toolbar.align_right')"
            />
            <span class="label">{{ $t("toolbar.align_right") }}</span>
        </el-menu-item>
        <hr />
        <el-menu-item @click="onAlignTop">
            <img
                src="../../assets/icons/toolbar/align-top.svg"
                :alt="$t('toolbar.align_top')"
            />
            <span class="label">{{ $t("toolbar.align_top") }}</span>
        </el-menu-item>
        <el-menu-item @click="onAlignMiddle">
            <img
                src="../../assets/icons/toolbar/align-middle.svg"
                :alt="$t('toolbar.center_horizontally')"
            />
            <span class="label">{{ $t("toolbar.center_horizontally") }}</span>
        </el-menu-item>
        <el-menu-item @click="onAlignBottom">
            <img
                src="../../assets/icons/toolbar/align-bottom.svg"
                :alt="$t('toolbar.align_bottom')"
            />
            <span class="label">{{ $t("toolbar.align_bottom") }}</span>
        </el-menu-item>

        <template
            v-if="
                $store.getters[`app/objectsInBoard/selectedPositionIds`]
                    .length > 2
            "
        >
            <hr />
            <el-menu-item @click="onDistributeVertical">
                <img
                    src="../../assets/icons/toolbar/distribute-vertical.svg"
                    :alt="$t('toolbar.distribute_vertically')"
                />
                <span class="label">{{
                    $t("toolbar.distribute_vertically")
                }}</span>
            </el-menu-item>
            <el-menu-item @click="onDistributeHorizontal">
                <img
                    src="../../assets/icons/toolbar/distribute-horizontal.svg"
                    :alt="$t('toolbar.distribute_horizontally')"
                />
                <span class="label">{{
                    $t("toolbar.distribute_horizontally")
                }}</span>
            </el-menu-item>
        </template>
    </el-submenu>
</template>
<script>
import { getRect } from "../../utils/position";
import ObjectToolbarShared from "./object-toolbar-shared.vue";
export default {
    name: "ObjectToolbarAlign",
    inject: ["$view"],
    mixins: [ObjectToolbarShared],
    methods: {
        onAlignLeft() {
            const left = Math.min(
                ...this.selectedPositions().map((x) => x.data.left)
            );
            this.onAlign((/* position */) => ({
                left,
            }));
        },
        onAlignCenter() {
            const left = Math.min(
                ...this.selectedPositions().map((x) => x.data.left)
            );
            const right = Math.max(
                ...this.selectedPositions().map(
                    (x) => x.data.left + x.data.width
                )
            );
            const center = (left + right) / 2;
            this.onAlign((position) => ({
                left: center - position.data.width / 2,
            }));
        },
        onAlignRight() {
            const right = Math.max(
                ...this.selectedPositions().map(
                    (x) => x.data.left + x.data.width
                )
            );
            this.onAlign((position) => ({
                left: right - position.data.width,
            }));
        },
        onAlignTop() {
            const top = Math.min(
                ...this.selectedPositions().map((x) => x.data.top)
            );
            this.onAlign((/* position */) => ({
                top,
            }));
        },
        onAlignMiddle() {
            const top = Math.min(
                ...this.selectedPositions().map((x) => x.data.top)
            );
            const bottom = Math.max(
                ...this.selectedPositions().map(
                    (x) => x.data.top + x.data.height
                )
            );
            const middle = (top + bottom) / 2;
            this.onAlign((position) => ({
                top: middle - position.data.height / 2,
            }));
        },
        onAlignBottom() {
            const bottom = Math.max(
                ...this.selectedPositions().map(
                    (x) => x.data.top + x.data.height
                )
            );
            this.onAlign((position) => ({
                top: bottom - position.data.height,
            }));
        },
        onAlign(transformFunction) {
            this.$store.dispatch(`positionAlive/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: this.selectedPositions().map((position) => ({
                    positionId: position.positionId,
                    data: transformFunction(position),
                })),
                reply: true,
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },

        onDistributeHorizontal() {
            this.onDistributeVerticalOrHorizontal("x");
        },
        onDistributeVertical() {
            this.onDistributeVerticalOrHorizontal("y");
        },
        onDistributeVerticalOrHorizontal(axis) {
            const selectedPositions = this.selectedPositions();

            // Distribution doesnt make sense
            if (selectedPositions?.length < 3) return;

            // Properties to be used, based on requested axis
            const axisConf = {
                x: {
                    start: "left",
                    size: "width",
                    end: "right",
                },
                y: {
                    start: "top",
                    size: "height",
                    end: "bottom",
                },
            }[axis];

            // Get average available space between selected objects
            const selectedArea = getRect(selectedPositions);
            const sumOfObjectSize = selectedPositions
                .map((x) => x.data[axisConf.size])
                .reduce((a, b) => a + b);
            const averageSpace =
                (selectedArea[axisConf.size] - sumOfObjectSize) /
                (selectedPositions.length - 1);

            // Selected positions (sorted by projected-on-axis center)
            const sortedPositions = selectedPositions.sort(function (a, b) {
                return (
                    a.data[axisConf.start] +
                    0.5 * a.data[axisConf.size] -
                    (b.data[axisConf.start] + 0.5 * b.data[axisConf.size])
                );
            });

            // Compute new positions
            const positions = [];
            let inc = selectedArea[axisConf.start];
            for (let k = 1; k < sortedPositions.length - 1; k++) {
                // First and last positions wont be changed
                inc +=
                    sortedPositions[k - 1].data[axisConf.size] + averageSpace;
                positions.push({
                    positionId: sortedPositions[k].positionId,
                    data: {
                        [axisConf.start]: inc,
                    },
                });
            }

            // Dispatch positions to store
            this.$store.dispatch(`positionAlive/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: positions,
                reply: true,
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },
    },
};
</script>
<style>
.object-toolbar-align .vw-triangle:before {
    bottom: -6px;
    right: -3px;
}

.object-toolbar-align-popover .el-menu-item,
.object-toolbar-align-popover .el-submenu__title {
    font-size: 80%;
    height: 24px !important;
    line-height: 24px !important;
}
.object-toolbar-align-popover img {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}
.object-toolbar-align-popover .el-submenu__title .el-icon-view {
    font-size: 16px;
    margin-left: -5px;
}
</style>
