<template>
    <pattern-import
        :title="title"
        :warning="warning"
        :fileLabel="labelAndInput"
        :filenamePlaceholder="labelAndInput"
        :fileType="fileType"
        :encoding="encoding"
        :errors="errors"
        :spinner="isInProgress"
        :disableSubmit="noImportOptionIsChecked"
        @input="onInput"
        @submit="onSubmit"
        @cancel="onCancel"
    >
        <div
            class="btn-board-option-import"
            :class="{ 'with-screenshot': screenshot }"
            v-if="fileContent"
        >
            <h4>{{ importOptionLabel }}</h4>
            <div class="vw-flex-col">
                <el-switch
                    :class="{ 'vw-link-color': foregroundInFile }"
                    v-model="options.importForeground"
                    :disabled="!foregroundInFile"
                    :active-text="frontImportLabel"
                />
                <el-switch
                    :class="{ 'vw-link-color': backgroundInFile }"
                    v-model="options.importBackground"
                    :disabled="!backgroundInFile"
                    :active-text="backImportLabel"
                />
                <el-switch
                    :class="{ 'vw-link-color': linksInFile }"
                    v-model="options.importLinks"
                    :disabled="!linksInFile"
                    :active-text="linkImportLabel"
                />
            </div>
            <img
                class="btn-board-option-import-screenshot"
                v-if="screenshot"
                :src="screenshot"
                :alt="$t('json_import.screenshot')"
            />
        </div>
    </pattern-import>
</template>

<script>
let XLSX_PARSER = null; // Will be lazily loaded
const JSON_FORMAT = "JSON";
const XLSX_FORMAT = "XLSX";
import omit from "lodash.omit";
import PatternImport from "../pattern-import/pattern-import.vue";
export default {
    name: "BtnBoardOptionImport",
    components: {
        PatternImport,
    },
    props: {
        format: {
            type: String,
            validator(value) {
                return [JSON_FORMAT, XLSX_FORMAT].includes(value);
            },
        },
    },
    async created() {
        if (!XLSX_PARSER && this.format === XLSX_FORMAT) {
            XLSX_PARSER = await import("xlsx");
        }
    },
    inject: ["$view"],
    data() {
        return {
            filename: null,
            fileContent: null,
            boardInfo: null,
            options: {
                importForeground: true,
                importBackground: true,
                importLinks: true,
            },
            isInProgress: false,
            errors: [],
        };
    },
    computed: {
        // GUI labels
        title() {
            return {
                [JSON_FORMAT]: this.$t("json_import.title"),
                [XLSX_FORMAT]: this.$t("xlsx_import.title"),
            }[this.format];
        },
        warning() {
            return {
                [JSON_FORMAT]: null,
                [XLSX_FORMAT]: this.$t("xlsx_import.warning"),
            }[this.format];
        },
        labelAndInput() {
            return {
                [JSON_FORMAT]: this.$t("json_import.default_json_input"),
                [XLSX_FORMAT]: this.$t("xlsx_import.default_xlsx_input"),
            }[this.format];
        },
        fileType() {
            return {
                [JSON_FORMAT]: ".json",
                [XLSX_FORMAT]: ".xlsx",
            }[this.format];
        },
        encoding() {
            return {
                [JSON_FORMAT]: "UTF-8",
                [XLSX_FORMAT]: "BINARY",
            }[this.format];
        },
        importOptionLabel() {
            return {
                [JSON_FORMAT]: this.$t("json_import.options"),
                [XLSX_FORMAT]: this.$t("xlsx_import.options"),
            }[this.format];
        },
        frontImportLabel() {
            return {
                [JSON_FORMAT]: this.$t(
                    "json_import.import_options.import_foreground"
                ),
                [XLSX_FORMAT]: this.$t(
                    "xlsx_import.import_options.import_foreground"
                ),
            }[this.format];
        },
        backImportLabel() {
            return {
                [JSON_FORMAT]: this.$t(
                    "json_import.import_options.import_background"
                ),
                [XLSX_FORMAT]: this.$t(
                    "xlsx_import.import_options.import_background"
                ),
            }[this.format];
        },
        linkImportLabel() {
            return {
                [JSON_FORMAT]: this.$t(
                    "json_import.import_options.import_links"
                ),
                [XLSX_FORMAT]: this.$t(
                    "xlsx_import.import_options.import_links"
                ),
            }[this.format];
        },

        screenshot() {
            return this.boardInfo?.data?.screenshot;
        },

        // Submitable only if an allowed options is checked
        noImportOptionIsChecked() {
            return (
                !this.options.importBackground &&
                !this.options.importForeground &&
                !this.options.importLinks
            );
        },

        // Check what can be imported
        foregroundInFile() {
            return (
                this.fileContent?.objects?.length &&
                this.fileContent.objects.some(
                    (object) => !object?.position?.protect?.isBackground
                )
            );
        },
        backgroundInFile() {
            return (
                this.fileContent?.objects?.length &&
                this.fileContent.objects.some(
                    (object) => object?.position?.protect?.isBackground
                )
            );
        },
        linksInFile() {
            return this.fileContent?.links?.length > 0;
        },
    },
    methods: {
        onInput(rawFileContent) {
            if (this.format === JSON_FORMAT) {
                // JSON parse
                try {
                    this.fileContent = JSON.parse(rawFileContent).VW;
                    this.boardInfo = JSON.parse(rawFileContent).board;
                } catch (e) {
                    this.fileContent = null;
                    this.errors = this.formatErrors(
                        this.$t("json_import.invalid_json_file")
                    );
                    return;
                }
            } else if (this.format === XLSX_FORMAT) {
                // Excel parse
                let wsObjects, wsLinks;
                try {
                    const wb = XLSX_PARSER.read(rawFileContent, {
                        type: "binary",
                    });
                    wsObjects = XLSX_PARSER.utils.sheet_to_json(
                        wb.Sheets[this.$t("xlsx_export.sheets.objects")]
                    );
                    wsLinks = XLSX_PARSER.utils.sheet_to_json(
                        wb.Sheets[this.$t("xlsx_export.sheets.links")]
                    );
                } catch {
                    this.errorMessage = this.formatErrors(
                        this.$t("xlsx_import.invalid_xlsx_file")
                    );
                    return;
                }

                // Transform into JSON
                try {
                    const objects = wsObjects.map((item, index) => ({
                        index, // TODO: remove? semble utilisé pour les messages d'erreurs uniquement
                        objectId: `object_${2 + index}`, // line in Excel workbook
                        componentId: this.$store.getters[
                            `componentAlive/idByName`
                        ](item[this.$t("xlsx_export.headings.componentName")]),
                        object: {
                            data: omit(item, [
                                this.$t("xlsx_export.headings.componentName"),
                                this.$t(
                                    "xlsx_export.headings.styleBackgroundColor"
                                ),
                                this.$t(
                                    "xlsx_export.headings.styleOutlineColor"
                                ),
                                this.$t("xlsx_export.headings.styleColor"),
                                this.$t("xlsx_export.headings.left"),
                                this.$t("xlsx_export.headings.top"),
                                this.$t("xlsx_export.headings.zIndex"),
                                this.$t("xlsx_export.headings.width"),
                                this.$t("xlsx_export.headings.height"),
                                this.$t("xlsx_export.headings.rotation"),
                                this.$t("xlsx_export.headings.layer"),
                            ]),
                            protect: {
                                styleBackgroundColor:
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.styleBackgroundColor"
                                        )
                                    ],
                                styleOutlineColor:
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.styleOutlineColor"
                                        )
                                    ],
                                styleColor:
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.styleColor"
                                        )
                                    ],
                            },
                        },
                        position: {
                            data: {
                                left: item[
                                    this.$t("xlsx_export.headings.left")
                                ],
                                top: item[this.$t("xlsx_export.headings.top")],
                                zIndex: item[
                                    this.$t("xlsx_export.headings.zIndex")
                                ],
                                rotation:
                                    item[
                                        this.$t("xlsx_export.headings.rotation")
                                    ],
                                width: item[
                                    this.$t("xlsx_export.headings.width")
                                ],
                                height: item[
                                    this.$t("xlsx_export.headings.height")
                                ],
                            },
                            protect: {
                                isBackground:
                                    item[
                                        this.$t("xlsx_export.headings.layer")
                                    ] ==
                                    this.$t(
                                        "xlsx_export.placeholders.background"
                                    ),
                            },
                        },
                    }));
                    const links = wsLinks.map((item, index) => ({
                        _id: `link_${2 + index}`,
                        linkModelId: this.$store.getters[
                            `linkModelAlive/idByName`
                        ](item[this.$t("xlsx_export.headings.linkModel")]),
                        data: {
                            title:
                                item[this.$t("xlsx_export.headings.label")] ||
                                "",
                            color: item[this.$t("xlsx_export.headings.color")],
                            size: item[this.$t("xlsx_export.headings.size")],
                            curve: item[this.$t("xlsx_export.headings.curve")],
                            dash: item[this.$t("xlsx_export.headings.dash")],
                        },
                        objects: [
                            {
                                _id: `link_start_${2 + index}`,
                                linkId: `link_${2 + index}`,
                                objectId: `object_${
                                    item[
                                        this.$t(
                                            "xlsx_export.headings.linkOrigin"
                                        )
                                    ]
                                }`,
                                data: {
                                    arrowhead: 0,
                                    type: item[
                                        this.$t(
                                            "xlsx_export.headings.originShape"
                                        )
                                    ],
                                },
                            },
                            {
                                _id: `link_end_${2 + index}`,
                                linkId: `link_${2 + index}`,
                                objectId: `object_${
                                    item[
                                        this.$t("xlsx_export.headings.linkEnd")
                                    ]
                                }`,
                                data: {
                                    arrowhead: 1,
                                    type: item[
                                        this.$t("xlsx_export.headings.endShape")
                                    ],
                                },
                            },
                        ],
                    }));

                    this.fileContent = { objects, links };
                } catch {
                    this.errorMessage = this.formatErrors(
                        this.$t("xlsx_import.error")
                    );
                    return;
                }
            }

            // Options
            this.options.importForeground =
                this.options.importForeground && this.foregroundInFile;
            this.options.importBackground =
                this.options.importBackground && this.backgroundInFile;
            this.options.importLinks =
                this.options.importLinks && this.linksInFile;
        },
        onSubmit() {
            try {
                this.isInProgress = true;

                // Set imported objects on top
                this.fileContent.objects.sort((a, b) => {
                    return a?.position?.data.zIndex - b?.position?.data.zIndex;
                });
                let zIndex = this.$store.getters[`positionAlive/zIndexMax`];
                for (let object of this.fileContent.objects) {
                    if (object?.position?.data) {
                        object.position.data.zIndex = ++zIndex;
                    }
                }

                this.$store.dispatch("boardIoSet/set", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    VW: this.fileContent,
                    options: {
                        ...this.options,
                        flushForeground: false,
                        flushBackground: false,
                        updateModel: false,
                        useNewObjectId: true,
                    },
                });
            } catch (e) {
                this.$store.dispatch("boardIoSet/setError", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    error: e.message,
                });
            }
        },
        onCancel() {
            if (this.isInProgress) {
                this.isInProgress = false;
            } else {
                this.$emit("close");
            }
        },

        formatErrors(oneOrSeveralErrors) {
            try {
                const errors = Array.isArray(oneOrSeveralErrors)
                    ? oneOrSeveralErrors
                    : [oneOrSeveralErrors];
                return errors.map((error, index) => {
                    if (error.code === "TRASHED_ITEM") {
                        return {
                            key: error.key + error.value,
                            title: error.key,
                            message: `${error.value} ${this.$t(
                                "json_import.trashed_item"
                            )}`,
                        };
                    } else if (error.code === "NOT_FOUND_ITEM") {
                        return {
                            key: error.key + error.value,
                            title: error.key,
                            message: `${error.value} ${this.$t(
                                "json_import.not_found_item"
                            )}`,
                        };
                    } else if (error.code === "JIRA_ITEM") {
                        return {
                            key: error.key + error.value,
                            title: error.key,
                            message: `${error.value} ${this.$t(
                                "json_import.duplicate_jira_us"
                            )}`,
                        };
                    } else if (
                        error.instancePath &&
                        this.format == JSON_FORMAT
                    ) {
                        return {
                            key: error.instancePath,
                            title: error.instancePath,
                            message: error.message,
                        };
                    } else if (
                        error.instancePath &&
                        this.format == XLSX_FORMAT
                    ) {
                        const line =
                            2 +
                            1 * error.instancePath.match(/^\/\w+\/(\d+)\//i)[1];
                        return (
                            {
                                "#/properties/componentId/type": {
                                    key: index,
                                    title: this.$t(
                                        "xlsx_import.component_not_found",
                                        { line }
                                    ),
                                },
                                "#/definitions/PositionData/required": {
                                    key: index,
                                    title: this.$t(
                                        "xlsx_import.object_missing_property",
                                        {
                                            line,
                                            property: this.$t(
                                                `xlsx_export.headings.${error.params.missingProperty}`
                                            ),
                                        }
                                    ),
                                },
                                "#/properties/linkModelId/type": {
                                    key: index,
                                    title: this.$t(
                                        "xlsx_import.link_model_not_found",
                                        { line }
                                    ),
                                },
                                "#/definitions/LinkData/required": {
                                    key: index,
                                    title: this.$t(
                                        "xlsx_import.link_missing_property",
                                        {
                                            line,
                                            property: this.$t(
                                                `xlsx_export.headings.${error.params.missingProperty}`
                                            ),
                                        }
                                    ),
                                },
                                "#/definitions/LinkObjectData/required": {
                                    key: index,
                                    title: this.$t(
                                        "xlsx_import.link_missing_anchor",
                                        { line }
                                    ),
                                },
                            }[error.schemaPath] || {
                                key: index,
                                title: this.$t(
                                    "xlsx_import.default_import_error"
                                ),
                                message: `${error.instancePath} ${error.message}`,
                            }
                        );
                    } else if (typeof error === "string") {
                        return {
                            key: error,
                            title: error,
                            message: error,
                        };
                    } else {
                        throw new Error("Unexpected import error");
                    }
                });
            } catch (e) {
                return [
                    this.format === JSON_FORMAT
                        ? this.$t("json_import.default_import_error")
                        : this.format === XLSX_FORMAT
                        ? this.$t("xlsx_import.default_import_error")
                        : "",
                ];
            }
        },
    },
    watch: {
        // Watch import status
        "$store.state.boardIoSet.importStatus"(status) {
            if (status?.error) {
                this.errors = this.formatErrors(status.error);
            }
            if (status?.success === true) {
                this.$emit("close");
            }
            if (status) {
                this.isInProgress = false;
            }
        },
    },
};
</script>
<style>
.btn-board-option-import.with-screenshot {
    padding-right: 160px;
}
.btn-board-option-import h4 {
    margin-bottom: 8px;
}
.btn-board-option-import .el-switch {
    margin: 4px;
}
.btn-board-option-import .el-switch__label * {
    font-size: 14px;
}
.btn-board-option-import-screenshot {
    position: absolute;
    top: var(--app-padding);
    right: var(--app-padding);
    width: 160px;
    height: auto;
    max-height: calc(100% - 2 * var(--app-padding));
    object-fit: contain;
    border: 1px solid lightgrey;
}
</style>
