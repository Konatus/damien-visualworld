<template>
    <div v-if="btnBoardOptionTemplate_isTemplate">
        <el-menu class="btn-board-option" mode="horizontal">
            <el-submenu
                id="board-is-template"
                popper-class="submenu-option"
                index="2"
                :class="{
                    upToDate: btnBoardOptionTemplate_isUpToDate,
                    obsolete: !btnBoardOptionTemplate_isUpToDate,
                }"
            >
                <template slot="title">
                    {{ $t("top_menu.breadcrumb.is_template") }}
                </template>

                <el-menu-item
                    index="2-1"
                    v-show-granted:for="['board-alive/save-state', $view]"
                    @click="btnBoardOptionTemplate_onSave"
                    class="vw-link-color"
                >
                    <i class="el-icon-circle-check"></i>
                    <span> {{ $t("top_menu.breadcrumb.save_template") }} </span>
                </el-menu-item>

                <el-menu-item
                    index="2-2"
                    v-show-granted:for="['board-alive/load-state', $view]"
                    @click="btnBoardOptionTemplate_onLoad"
                    v-if="btnBoardOptionTemplate_latestStateTimestamp"
                    class="submenu-option-onload vw-link-color"
                >
                    <i class="el-icon-refresh-left"></i>
                    <span>
                        {{
                            $t("top_menu.breadcrumb.load_template", {
                                date: $d(
                                    btnBoardOptionTemplate_latestStateTimestamp,
                                    "long"
                                ),
                            })
                        }}
                    </span>
                </el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>
<script>
import btnBoardOptionExportScreenshot from "../btn-board-option/btn-board-option-export-screenshot.vue";
export default {
    name: "BtnBoardTemplate",
    mixins: [btnBoardOptionExportScreenshot],
    computed: {
        btnBoardOptionTemplate_isTemplate() {
            try {
                return this.$store.getters[`boardAlive/isTemplate`](
                    this.$view.boardId
                );
            } catch (e) {
                return false;
            }
        },
        btnBoardOptionTemplate_board() {
            try {
                return this.$store.getters[`boardAlive/byId`](
                    this.$view.boardId
                );
            } catch (e) {
                return null;
            }
        },
        btnBoardOptionTemplate_latestStateTimestamp() {
            try {
                return this.btnBoardOptionTemplate_board.state.latest * 1000;
            } catch (e) {
                return null;
            }
        },
        btnBoardOptionTemplate_isUpToDate() {
            try {
                return this.btnBoardOptionTemplate_board.data
                    .templateIsUpToDate;
            } catch (e) {
                return false;
            }
        },
    },
    data() {
        return {
            btnBoardOptionTemplate_watchPosition: () => {},
        };
    },
    watch: {
        btnBoardOptionTemplate_isUpToDate(value) {
            if (value) {
                this.btnBoardOptionTemplate_watchPosition = this.$watch(
                    "$store.state.positionAlive.items",
                    {
                        deep: true,
                        handler() {
                            this.btnBoardOptionTemplate_onChange();
                        },
                    }
                );
            } else {
                this.btnBoardOptionTemplate_watchPosition();
            }
        },
    },
    methods: {
        btnBoardOptionTemplate_onSave() {
            const usedArea = this.btnBoardOptionExportScreenshot_usedAreaCache;
            this.btnBoardOptionExportScreenshot_64().then((screenshot) => {
                this.$store.dispatch("boardAlive/saveState", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data: {
                        screenshot,
                        usedArea,
                        templateIsUpToDate: true,
                    },
                });
            });
        },
        btnBoardOptionTemplate_onLoad() {
            this.$store.dispatch("boardAlive/loadState", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
            });
        },
        btnBoardOptionTemplate_onChange() {
            this.$store.dispatch("boardAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: { templateIsUpToDate: false },
                reply: true,
            });
        },
    },
};
</script>
<style scoped>
#board-is-template.upToDate >>> .el-submenu__title {
    color: var(--color-success);
    background: var(--color-success-light);
}
#board-is-template.obsolete >>> .el-submenu__title {
    color: var(--color-warning);
    background: var(--color-warning-light);
}
#board-is-template >>> .el-submenu__title {
    border: 0;
    line-height: 3;
}
</style>
