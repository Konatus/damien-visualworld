<template>
    <div id="btn-board-option-wrapper">
        <el-menu class="btn-board-option vw-link-color" mode="horizontal">
            <el-submenu
                id="submenu-option"
                popper-class="submenu-option"
                index="1"
            >
                <template slot="title">
                    <i class="btn-board-option-dots el-icon-more"></i>
                </template>

                <el-menu-item
                    v-show-granted:for="['board-alive/update', $view]"
                    index="1-3"
                    @click="onEditBoard"
                    class="vw-link-color"
                >
                    <img
                        src="../../assets/icons/settings-dark.svg"
                        :alt="$t('top_menu.breadcrumb.board_settings')"
                    />
                    <span>
                        {{ $t("top_menu.breadcrumb.board_settings") }}
                    </span>
                </el-menu-item>

                <el-submenu
                    v-show-granted:for="['board-io/set', $view]"
                    index="1-4"
                    class="vw-link-color"
                    popper-class="submenu-option-menu"
                >
                    <template slot="title">
                        <span> {{ $t("top_menu.breadcrumb.import") }} </span>
                    </template>
                    <el-menu-item
                        v-show-granted:for="['board-io/set-json', $view]"
                        @click="onImportJson"
                        class="vw-link-color"
                    >
                        <span>
                            {{ $t("top_menu.breadcrumb.import_json") }}
                        </span>
                    </el-menu-item>
                    <el-menu-item @click="onImportXlsx" class="vw-link-color">
                        <span>
                            {{ $t("top_menu.breadcrumb.import_xlsx") }}
                        </span>
                    </el-menu-item>
                </el-submenu>

                <div>
                    <el-submenu
                        popper-class="submenu-option-menu"
                        index="1-5"
                        class="vw-link-color"
                    >
                        <template slot="title">
                            <span>
                                {{ $t("top_menu.breadcrumb.export") }}
                            </span>
                        </template>
                        <div v-show-granted:for="['board-io/get', $view]">
                            <el-menu-item
                                v-show-granted:for="[
                                    'board-io/set-json',
                                    $view,
                                ]"
                                @click="onExportJson"
                                class="vw-link-color"
                            >
                                {{ $t("top_menu.breadcrumb.export_json") }}
                            </el-menu-item>
                            <el-divider />

                            <el-menu-item
                                @click="onExportXlsx"
                                class="vw-link-color"
                            >
                                {{ $t("top_menu.breadcrumb.export_xlsx") }}
                            </el-menu-item>
                            <el-menu-item
                                @click="onExportOptimization"
                                class="vw-link-color"
                            >
                                Exporter pour optimisation
                            </el-menu-item>
                            <el-menu-item
                                @click="onExportDocx"
                                class="vw-link-color"
                            >
                                {{ $t("top_menu.breadcrumb.export_docx") }}
                            </el-menu-item>
                        </div>
                        <div
                            v-show-granted:forOne="[
                                'board-io/get-png',
                                'board-io/get-pdf',
                                $view,
                            ]"
                        >
                            <el-menu-item
                                @click="onExportPdf"
                                class="vw-link-color"
                            >
                                {{ $t("top_menu.breadcrumb.export_pdf") }}
                            </el-menu-item>
                            <el-menu-item
                                @click="onExportPng"
                                class="vw-link-color"
                            >
                                {{ $t("top_menu.breadcrumb.export_png") }}
                            </el-menu-item>
                        </div>
                    </el-submenu>
                </div>
            </el-submenu>
        </el-menu>
    </div>
</template>
<script>
import app from "../../conf/app";
import BoardEdit from "../../views/board-edit";
import BtnBoardOptionExportJson from "./btn-board-option-export-json";
import BtnBoardOptionExportScreenshot from "./btn-board-option-export-screenshot";
import BtnBoardOptionExportXlsx from "./btn-board-option-export-xlsx";
import BtnBoardOptionExportOptimization from "./btn-board-option-export-optimization";
import BtnBoardOptionExportDocx from "./btn-board-option-export-docx";
import BtnBoardOptionImport from "./btn-board-option-import";
export default {
    name: "BtnBoardOption",

    mixins: [
        BtnBoardOptionExportJson,
        BtnBoardOptionExportScreenshot,
        BtnBoardOptionExportXlsx,
        BtnBoardOptionExportOptimization,
    ],

    inject: ["$view"],

    methods: {
        onEditBoard() {
            this.$modal.show(
                BoardEdit,
                {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                },
                app.modal.parameters_world_edit,
                {
                    "before-close": () => document.activeElement.blur(),
                }
            );
        },

        onImportJson() {
            this.$modal.show(
                BtnBoardOptionImport,
                {
                    format: "JSON",
                },
                app.modal.parameters
            );
        },

        onImportXlsx() {
            this.$modal.show(
                BtnBoardOptionImport,
                {
                    format: "XLSX",
                },
                app.modal.parameters
            );
        },

        onExportJson() {
            this.btnBoardOptionExportJson_do();
        },

        onExportPdf() {
            this.btnBoardOptionExportScreenshot_pdf();
        },

        onExportPng() {
            this.btnBoardOptionExportScreenshot_png();
        },

        onExportXlsx() {
            this.btnBoardOptionExportXlsx_do();
        },

        onExportOptimization() {
            this.btnBoardOptionExportOptimization_do();
        },

        onExportDocx() {
            this.$modal.show(
                BtnBoardOptionExportDocx,
                {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    screenshotPromise: this.btnBoardOptionExportScreenshot_blob,
                },
                app.modal.parameters
            );
        },
    },
};
</script>

<style>
.submenu-option {
    margin-left: -8px;
}
.submenu-option .submenu-option-onload {
    display: flex;
    align-items: center;
}
.submenu-option .submenu-option-onload span {
    display: block;
    width: 165px;
    word-break: break-all;
    white-space: initial;
    line-height: initial;
}

.submenu-option .submenu-option-onload i {
    margin-right: 9px;
}
</style>
<style scoped>
#btn-board-option-wrapper {
    width: 36px;
    padding: 0;
    border-radius: var(--style-border-radius);
    overflow: hidden;
}

.btn-board-option {
    border: none !important;
}

.btn-board-option-dots {
    transform: rotate(90deg);
    color: var(--style-color-main);
}

#submenu-option >>> .el-submenu__title,
#board-is-template >>> .el-submenu__title {
    display: flex;
    align-items: center;
    color: var(--color-main-font);
    font-size: 14px;
    font-weight: 700;
    padding-left: 7px;
    padding-right: 7px;
    border-bottom: none;
}
#submenu-option >>> .el-submenu__icon-arrow {
    display: none;
}
</style>
