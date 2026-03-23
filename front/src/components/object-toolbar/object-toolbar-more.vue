<template>
    <el-menu mode="horizontal">
        <el-submenu
            id="object-toolbar-more"
            index="object-toolbar-more"
            ref="submenu"
            popper-class="object-toolbar-more-popover vw-link-color"
        >
            <template slot="title">
                <div class="board-toolbar-button">
                    <img
                        src="../../assets/icons/three-dots.svg"
                        :alt="$t('icon.three_dots')"
                    />
                </div>
            </template>
            <div
                v-if-granted:forOne="[
                    'position-alive/resize-front',
                    'position-alive/resize-back',
                    $view,
                ]"
            >
                <div class="object-toolbar-size">
                    <label>{{ $t("toolbar.initial_width") }}</label>
                    <el-input-number
                        size="small"
                        controlsPosition="right"
                        v-model="sizeWidth"
                    />
                    <label>{{ $t("toolbar.initial_height") }}</label>
                    <el-input-number
                        size="small"
                        controlsPosition="right"
                        v-model="sizeHeight"
                    />
                </div>

                <el-menu-item class="object-toolbar-rotate" @click="onRotate">
                    <i class="el-icon-refresh-right"></i>
                    <span class="label">{{ $t("toolbar.rotate") }}</span>
                </el-menu-item>

                <el-divider direction="horizontal" />
            </div>
            <template
                v-show-granted:forOne="[
                    'position-alive/update-front',
                    'position-alive/update-back',
                    $view,
                ]"
            >
                <el-menu-item @click="sendForward">
                    <img
                        src="../../assets/icons/toolbar/send-over.svg"
                        :alt="$t('toolbar.send_forward')"
                    />
                    <span class="label">{{ $t("toolbar.send_forward") }}</span>
                </el-menu-item>
                <el-menu-item @click="sendBackward">
                    <img
                        src="../../assets/icons/toolbar/send-under.svg"
                        :alt="$t('toolbar.send_backward')"
                    />
                    <span class="label">{{ $t("toolbar.send_backward") }}</span>
                </el-menu-item>
            </template>

            <el-divider direction="horizontal" />

            <el-menu-item
                @click="sendBackgroundOrForeground"
                v-show-granted:forAll="[
                    'position-alive/set-back',
                    'position-alive/unset-back',
                    $view,
                ]"
            >
                <template
                    v-if="
                        $store.getters[
                            `app/objectsInBoard/activeLayerIsForeground`
                        ]
                    "
                >
                    <img
                        src="../../assets/icons/toolbar/send-background.svg"
                        :alt="$t('toolbar.send_foreground')"
                    />
                    <span class="label">{{
                        $t("toolbar.send_background")
                    }}</span>
                </template>
                <template
                    v-else-if="
                        $store.getters[
                            `app/objectsInBoard/activeLayerIsBackground`
                        ]
                    "
                >
                    <img
                        src="../../assets/icons/toolbar/send-foreground.svg"
                        :alt="$t('toolbar.send_background')"
                    />
                    <span class="label">{{
                        $t("toolbar.send_foreground")
                    }}</span>
                </template>
            </el-menu-item>

            <el-divider direction="horizontal" />

            <el-submenu
                index="1.4"
                v-show-granted:forOne="[
                    'position-alive/update-front',
                    'position-alive/update-back',
                    $view,
                ]"
                mode="horizontal"
                @mouseover.native="
                    $store.dispatch(`boardShortcut/readBoards`, $view)
                "
            >
                <template slot="title">
                    <i class="el-icon-view"></i>
                    <span>{{ $t("toolbar.shortcut") }}</span>
                </template>
                <el-menu-item
                    v-for="board in copyOnAnotherBoard_boardList"
                    :key="board._id"
                    @click="copyOnAnotherBoard_openDialog(board)"
                >
                    {{ board.name }}
                </el-menu-item>
                <el-menu-item
                    disabled
                    v-if="!copyOnAnotherBoard_boardList.length"
                >
                    {{ $t("toolbar.prevent_shortcut") }}
                </el-menu-item>
            </el-submenu>
        </el-submenu>
    </el-menu>
</template>
<script>
import app from "../../conf/app.js";
import ObjectToolbarShared from "./object-toolbar-shared.vue";
export default {
    name: "ObjectToolbarMore",
    inject: ["$view"],
    mixins: [ObjectToolbarShared],
    computed: {
        sizeWidth: {
            get() {
                const widths = this.selectedPositions().map(
                    (item) => item.data.width
                );
                return widths.every((val, _, arr) => val === arr[0])
                    ? widths[0]
                    : undefined;
            },
            set(width) {
                if (this.sizeWidth != width) {
                    this.onSizeChange({ width });
                }
            },
        },
        sizeHeight: {
            get() {
                const heights = this.selectedPositions().map(
                    (item) => item.data.height
                );
                return heights.every((val, _, arr) => val === arr[0])
                    ? heights[0]
                    : undefined;
            },
            set(height) {
                if (this.sizeHeight != height) {
                    this.onSizeChange({ height });
                }
            },
        },
        copyOnAnotherBoard_boardList() {
            const allowedBoardsAndObjects = [];
            try {
                const selectedPositions = this.selectedPositions();
                const availableBoards = this.$store.getters[
                    "boardShortcut/byWorldId"
                ](this.$view.worldId);
                for (const board of availableBoards) {
                    if (board._id != this.$view.boardId) {
                        const allowedObjects = [];

                        for (const selectedPosition of selectedPositions) {
                            if (
                                !board.objectIds.includes(
                                    selectedPosition.objectId
                                )
                            ) {
                                allowedObjects.push(selectedPosition);
                            }
                        }

                        if (allowedObjects.length) {
                            board.allowedObjects = allowedObjects;
                            allowedBoardsAndObjects.push(board);
                        }
                    }
                }
            } catch {
                /* not catched */
            }
            return allowedBoardsAndObjects;
        },
    },
    methods: {
        onSizeChange(data) {
            this.$store.dispatch(`positionAlive/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: this.selectedPositions().map((position) => ({
                    positionId: position.positionId,
                    data,
                })),
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
                reply: true,
            });
        },
        onRotate() {
            this.$refs.submenu.parentMenu.open(this.$refs.submenu.index); // dont close currently opened menu
            this.$store.dispatch(`positionAlive/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: this.selectedPositions().map((position) => ({
                    positionId: position.positionId,
                    data: {
                        rotation: ((position.data.rotation || 0) + 90) % 360,
                        left:
                            position.data.left +
                            (position.data.width - position.data.height) / 2,
                        top:
                            position.data.top +
                            (position.data.height - position.data.width) / 2,
                        width: position.data.height,
                        height: position.data.width,
                    },
                })),
                reply: true,
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },
        sendForward() {
            this.sendForwardOrBackward(1);
        },
        sendBackward() {
            this.sendForwardOrBackward(-1);
        },
        sendForwardOrBackward(order) {
            let zIndex =
                this.$store.getters[
                    order > 0
                        ? `positionAlive/zIndexMax`
                        : `positionAlive/zIndexMin`
                ];
            const positions = this.selectedPositionsByZIndex(order).map(
                (position) => {
                    zIndex += order;
                    return {
                        positionId: position.positionId,
                        data: {
                            zIndex: zIndex,
                        },
                    };
                }
            );
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

        sendBackgroundOrForeground() {
            this.$store.dispatch(`positionAlive/setBack`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: this.$store.getters[
                    `app/objectsInBoard/selectedPositionIds`
                ].map((positionId) => ({ positionId })),
                isBackground:
                    !this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },

        copyOnAnotherBoard_openDialog(board) {
            if (
                this.$store.getters[`app/objectsInBoard/selectedPositionIds`]
                    .length > board.allowedObjects.length
            ) {
                this.$modal.show("dialog", {
                    title: this.$t("toolbar.shortcut_modal.title"),
                    text: this.$t("toolbar.shortcut_modal.text"),
                    buttons: [
                        {
                            title: this.$t("modal.no"),
                            default: true,
                        },
                        {
                            title: this.$t("modal.yes"),
                            handler: () => {
                                this.copyOnAnotherBoard_do(board);
                                this.$modal.hide("dialog");
                            },
                        },
                    ],
                });
            } else {
                this.copyOnAnotherBoard_do(board);
                this.$emit("close");
            }
        },
        copyOnAnotherBoard_do(board) {
            if (
                !this.$store.getters[`connectionMe/isGrantedForOne`](
                    [
                        "position-alive/create-front",
                        "position-alive/create-back",
                    ],
                    this.$view
                )
            ) {
                return;
            }
            board.allowedObjects.sort((a, b) => a.data.zIndex - b.data.zIndex);
            const left =
                app.board.size.width / 2 -
                board.allowedObjects[0].data.width / 2;
            let offset = 0;
            let zIndex = board.zIndexMax;

            this.$store.dispatch(`positionAlive/create`, {
                worldId: this.$view.worldId,
                boardId: board._id,
                data: board.allowedObjects.map((object) => ({
                    componentId: object.componentId,
                    objectId: object.objectId,
                    data: {
                        width: object.data.width,
                        height: object.data.height,
                        top: app.shortcut.dropZoneTopStartingPoint,
                        left: left + app.shortcut.offset * offset++,
                        zIndex: zIndex++,
                    },
                })),
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
#object-toolbar-more .board-toolbar-button {
    padding-left: 0;
}
.object-toolbar-more-popover .el-menu-item,
.object-toolbar-more-popover .el-submenu__title {
    font-size: 80%;
    height: 24px !important;
    line-height: 24px !important;
}
.object-toolbar-more-popover img {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}
.object-toolbar-size {
    display: flex;
    align-items: center;
    width: 230px;
    font-size: 80%;
    height: 2em;
    color: initial;
    margin: 6px 0px;
}
.object-toolbar-size label {
    margin-left: 10px;
}
.object-toolbar-size .el-input-number {
    transform: scale(0.8);
}
.object-toolbar-size .el-input__inner {
    font-size: 125%;
}
.object-toolbar-rotate .el-icon-refresh-right {
    position: relative;
    left: -5px;
    margin-right: 0 !important;
}
.object-toolbar-more-popover .el-submenu__title .el-icon-view {
    font-size: 16px;
    margin-left: -5px;
}
.object-toolbar-size .el-input-number.is-controls-right .el-input__inner {
    padding-left: 0px;
    padding-right: 32px;
}
</style>
