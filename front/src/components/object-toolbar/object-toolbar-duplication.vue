<template>
    <el-menu-item
        class="board-toolbar-button"
        @click="onDuplicate"
        v-if-granted:for="['position-alive/duplicate', $view]"
    >
        <img
            src="../../assets/icons/toolbar/duplicate.svg"
            :alt="$t('toolbar.duplicate')"
        />
    </el-menu-item>
</template>
<script>
import app from "../../conf/app.js";
import jsonDeepCopy from "../../utils/json-deep-copy";
import merge from "lodash.merge";
import ObjectToolbarShared from "./object-toolbar-shared.vue";
export default {
    name: "ObjectToolbarDuplication",
    inject: ["$view"],
    mixins: [ObjectToolbarShared],
    watch: {
        "$store.state.app.objectsInBoard.event"(evt) {
            if (evt.name === "objectToolbarDuplication") {
                this.onDuplicate(evt.center, evt.data);
            }
        },
    },
    methods: {
        /**
         * Copy/patse positions
         * centerObject: current mouse position in board
         * selectedPositions: list of positions selected in the clipboard
         */
        onDuplicate(centerObject, givenSelectedPositions) {
            if (
                !this.$store.getters[`connectionMe/isGrantedFor`](
                    ["position-alive/duplicate"],
                    this.$view
                )
            ) {
                return;
            }
            const LAG_OFFSET = app.lagOffset;
            let duplicateCreate = [];
            let scale = { x: 0, y: 0 };
            let zIndex = this.$store.getters[`positionAlive/zIndexMax`];
            const boardSize = app.board.size;

            const selectedPositions =
                givenSelectedPositions || this.selectedPositions();

            if (centerObject.left && centerObject.top) {
                scale.x =
                    centerObject.left -
                    Math.min(...selectedPositions.map((x) => x.data.left)) -
                    LAG_OFFSET;
                scale.y =
                    centerObject.top -
                    Math.min(...selectedPositions.map((x) => x.data.top)) -
                    LAG_OFFSET;
            }

            // Avoid duplications of jira type positions
            const selectedPostionsFiltered = selectedPositions.filter(
                (item) => {
                    return (
                        this.$store.getters[`componentAlive/byId`](
                            item.componentId
                        ).data?.noObjectDuplication !== true
                    );
                }
            );

            for (let selectedPosition of selectedPostionsFiltered) {
                const left = selectedPosition.data.left + LAG_OFFSET + scale.x;
                const top = selectedPosition.data.top + LAG_OFFSET + scale.y;

                const { data, protect } =
                    selectedPosition.objectData ||
                    this.$store.getters["object/byId"](
                        selectedPosition.objectId
                    ) ||
                    {};
                const { width, height } = selectedPosition.data;
                duplicateCreate.push({
                    componentId: selectedPosition.componentId,
                    object: {
                        data,
                        protect,
                    },
                    data: merge(jsonDeepCopy(selectedPosition.data), {
                        left:
                            left + width < boardSize.width
                                ? left
                                : boardSize.width - width,
                        top:
                            top + height < boardSize.height
                                ? top
                                : boardSize.height - height,
                        width,
                        height,
                        zIndex: ++zIndex,
                    }),
                });
            }

            this.$store.dispatch(`positionAlive/create`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: duplicateCreate,
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
            });
        },
    },
};
</script>
