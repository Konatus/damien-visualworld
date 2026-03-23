<!--
    TODO: define document properties (title: world & board, author: firstname & lastname of current user, "Visual World" must be written somewhere)
-->
<template>
    <div id="btn-board-option-export-docx" class="vue-dialog">
        <p>
            <span> {{ $t("docx_export.title") }} </span>
            <i18n path="docx_export.description" tag="small">
                <template #defaultTemplate>
                    <a
                        class="vw-link-color"
                        href="/assets/docx/VW-default-template.docx"
                        >{{ $t("docx_export.description_default_template") }}</a
                    >
                </template>
            </i18n>
        </p>
        <form
            id="btn-board-option-export-docx-form"
            @submit.prevent
            enctype="multipart/form-data"
        >
            <div class="btn-board-option-export-docx-item">
                <label
                    class="el-form-item__label"
                    for="btn-board-option-export-docx"
                >
                    {{ $t("docx_export.template") }}
                </label>

                <button
                    @click="btnBoardOptionExportDocx_onFileChoose"
                    class="vw-link-color"
                    :class="{
                        'btn-board-option-export-docx-button': true,
                        'input-error': btnBoardOptionExportDocx_errorMessage,
                    }"
                >
                    {{
                        btnBoardOptionExportDocx_templateFilename ||
                        $t("docx_export.default_docx_input")
                    }}
                </button>

                <input
                    ref="input-file"
                    type="file"
                    accept=".docx"
                    @change="btnBoardOptionExportDocx_onFileChange"
                    v-show="false"
                />

                <span
                    class="el-form-item__error"
                    v-if="btnBoardOptionExportDocx_errorMessage"
                >
                    {{ btnBoardOptionExportDocx_errorMessage }}
                </span>
            </div>

            <div class="vue-dialog-buttons">
                <el-button
                    size="small"
                    type="submit"
                    class="el-button--success"
                    :disabled="!btnBoardOptionExportDocx_templateIsValid"
                    @click="btnBoardOptionExportDocx_onSubmit"
                >
                    {{ $t("modal.submit.validate") }}
                </el-button>
                <el-button
                    class="vw-link-color"
                    size="small"
                    @click="btnBoardOptionExportDocx_onCancel"
                >
                    {{ $t("modal.submit.cancel") }}
                </el-button>
            </div>
        </form>
    </div>
</template>

<script>
const SCREENSHOT_WIDTH = 600;
const IMG_MAX_WIDTH = 500;
let TemplateHandler; // Will be lazily loaded
import jsonata from "jsonata";
import striptags from "striptags";
import BlobDownload from "../../utils/blob-download";
import blobTo64 from "../../utils/blob-to-64";
import { getRect } from "../../utils/position";
import stringToHash from "../../utils/string-to-hash";
import jsonDeepCopy from "../../utils/json-deep-copy";
export default {
    name: "BtnBoardOptionExportDocx",

    props: {
        screenshotPromise: Function,
    },
    inject: ["$view"],

    data() {
        return {
            btnBoardOptionExportDocx_inProgress: false,
            btnBoardOptionExportDocx_template: null,
            btnBoardOptionExportDocx_templateFilename: null,
            btnBoardOptionExportDocx_templateIsValid: true,
            btnBoardOptionExportDocx_errorMessage: null, // Invalid template or error on export
        };
    },

    async created() {
        TemplateHandler = (await import("easy-template-x")).TemplateHandler;
    },

    methods: {
        // When a template is provided, its validity must be checked
        btnBoardOptionExportDocx_onFileChoose() {
            this.$refs["input-file"].click();
        },
        btnBoardOptionExportDocx_onFileChange(evtFileChange) {
            this.btnBoardOptionExportDocx_template = null;
            this.btnBoardOptionExportDocx_templateFilename = null;
            this.btnBoardOptionExportDocx_templateIsValid = null;
            this.btnBoardOptionExportDocx_errorMessage = null;

            // Get file from input
            const files =
                evtFileChange.target.files || evtFileChange.dataTransfer.files;
            if (!files.length) {
                return;
            }

            this.btnBoardOptionExportDocx_template = files[0];
            this.btnBoardOptionExportDocx_templateFilename = files[0].name;

            // Docx verification
            new TemplateHandler()
                .parseTags(this.btnBoardOptionExportDocx_template)
                .then((tags) => {
                    const tagsContent = tags
                        .filter(
                            (tag) =>
                                tag.disposition == "Open" ||
                                tag.disposition == "SelfClosed"
                        )
                        .map((tag) => tag.name);
                    for (const tag of tagsContent) {
                        jsonata(tag); // not used, catch expected if the tag content isnt valid
                    }
                })
                .then(() => {
                    this.btnBoardOptionExportDocx_templateIsValid = true;
                })
                .catch((err) => {
                    this.btnBoardOptionExportDocx_templateIsValid = false;

                    const parsedError = jsonDeepCopy(err);
                    if (parsedError.expectedFileType) {
                        // Corrupted file: {expectedFileType: "docx"}
                        this.btnBoardOptionExportDocx_errorMessage = this.$t(
                            "docx_export.invalid_docx"
                        );
                    } else if (Object.keys(parsedError).length === 0) {
                        // Template error: {}
                        this.btnBoardOptionExportDocx_errorMessage = this.$t(
                            "docx_export.invalid_template"
                        );
                    } else if (parsedError.code) {
                        // Jsonata error: {code: "S0201", position: 10, token: "objects", stack: "Error↵    at handleError (webpack:///./node_module…oader/lib/selector.js?type=script&index=0:174:88)", message: "Syntax error: "objects""}
                        this.btnBoardOptionExportDocx_errorMessage = this.$t(
                            "docx_export.invalid_jsonata"
                        );
                    } else {
                        this.btnBoardOptionExportDocx_errorMessage =
                            this.$t("docx_export.error");
                    }
                });
        },

        // On submit, get default template if needed, then launch process...
        // TODO: dont load default component more than once
        async btnBoardOptionExportDocx_onSubmit() {
            if (!this.btnBoardOptionExportDocx_template) {
                await this.btnBoardOptionExportDocx_default();
            }
            this.btnBoardOptionExportDocx_do();
        },
        async btnBoardOptionExportDocx_do() {
            try {
                const screenshotBlob = await this.screenshotPromise();
                const screenshotSize = getRect(
                    this.$store.getters[`positionAlive/asArray`]
                );
                const screenshotRatio =
                    screenshotSize.width / screenshotSize.height;

                // Provide ressources for templates
                const data = {
                    objects: this.$store.getters[`positionAlive/asArray`].map(
                        ({ positionId, componentId }) => {
                            const { data } = this.$store.getters[
                                `recursiveData/full`
                            ]({ positionId, componentId });

                            // Transform drawing-view's paths into a caption
                            if (
                                Object.prototype.hasOwnProperty.call(
                                    data,
                                    "paths"
                                )
                            ) {
                                const node =
                                    document.getElementById(positionId);
                                const svg = node.getElementsByTagName("svg")[0];
                                if (svg) {
                                    const blob = new Blob([svg.outerHTML], {
                                        type: "image/svg+xml",
                                    });
                                    const width = Math.max(
                                        IMG_MAX_WIDTH,
                                        data.VW?.width
                                    );
                                    const height =
                                        (width * data.VW?.height) /
                                        data.VW?.width;
                                    data.caption = {
                                        _type: "image",
                                        source: blob,
                                        format: blob?.type,
                                        width,
                                        height,
                                    };
                                    delete data.paths;
                                }
                            }

                            return {
                                positionId,
                                componentId,
                                ...data,
                                asArray: Object.keys(data)
                                    .filter(
                                        (key) => !["VW", "CALC"].includes(key)
                                    )
                                    .map((key) => ({
                                        key,
                                        value: data[key],
                                    })),
                            };
                        }
                    ),
                    screenshot: {
                        source: screenshotBlob,
                        _type: "image",
                        format: "image/png",
                        width: SCREENSHOT_WIDTH,
                        height: SCREENSHOT_WIDTH / screenshotRatio,
                    },
                    pageBreak: {
                        _type: "rawXml",
                        xml: '<w:br w:type="page"/>',
                        replaceParagraph: false,
                    },
                    world: this.$store.getters[`worldAlive/byId`](
                        this.$view.worldId
                    ).data.name,
                    board: this.$store.getters[`boardAlive/byId`](
                        this.$view.boardId
                    ).data.name,
                };

                // Fetch pictures
                let imgCache = [];
                for (const object of data.objects) {
                    for (const field in object) {
                        const url = object[field]?.[0]?.url;
                        if (url) {
                            imgCache.push(
                                new Promise((resolve) => {
                                    fetch(url)
                                        .then((fetched) => {
                                            if (fetched.status >= 400) {
                                                throw new Error(
                                                    "IMG not fetched"
                                                );
                                            }
                                            return fetched.blob();
                                        })
                                        .then(async (blob) => ({
                                            blob,
                                            src64: await blobTo64(blob),
                                        }))
                                        .then(({ blob, src64 }) => {
                                            const img = new Image();
                                            img.src = src64;
                                            img.onload = () => {
                                                const width = Math.min(
                                                    IMG_MAX_WIDTH,
                                                    img.naturalWidth
                                                );
                                                const height =
                                                    (width / img.naturalWidth) *
                                                    img.naturalHeight;
                                                resolve({
                                                    [url]: {
                                                        blob,
                                                        width,
                                                        height,
                                                    },
                                                });
                                            };
                                        })
                                        .catch(() => {
                                            resolve({
                                                [url]: {
                                                    blob: null,
                                                    width: 0,
                                                    height: 0,
                                                },
                                            });
                                        });
                                })
                            );
                        }
                    }
                }
                imgCache = [...(await Promise.all(imgCache))];

                const scopeDataCache = {};
                const blob = await new TemplateHandler({
                    delimiters: {
                        tagStart: "{{",
                        tagEnd: "}}",
                    },
                    scopeDataResolver: (scope) => {
                        let parentPath = jsonDeepCopy(scope.strPath);
                        let selfPath = parentPath.pop();

                        // Read parent value
                        let parentValue;
                        if (!parentPath.length) {
                            parentValue = scope.data;
                        } else {
                            const parentKey = stringToHash(
                                parentPath.join(".")
                            );
                            parentValue = scopeDataCache[parentKey];
                        }

                        // Evaluate expression
                        const expression = jsonata(selfPath);
                        let value = expression.evaluate(parentValue);

                        // Images
                        const url = value?.[0]?.url;
                        if (url) {
                            value = {
                                _type: "image",
                                source: imgCache[url]?.blob,
                                format: imgCache[url]?.blob?.type,
                                width: imgCache[url]?.width,
                                height: imgCache[url]?.height,
                            };
                        }

                        // Persist self value for potential children use
                        const key = stringToHash(scope.strPath.join("."));
                        scopeDataCache[key] = value;
                        if (Array.isArray(value)) {
                            for (let index in value) {
                                const subKey = stringToHash(
                                    [...scope.strPath, index].join(".")
                                );
                                scopeDataCache[subKey] = value[index];
                            }
                        } else {
                            const subKey = stringToHash(
                                [...scope.strPath, 0].join(".")
                            );
                            scopeDataCache[subKey] = value;
                        }

                        // Return the stringified object if it is selfClose tag, the object itself if it a loop tag
                        if (typeof value === "string") {
                            value = striptags(value);
                            value = jsonDeepCopy(value); // Get rid of quotation marks
                        }
                        return value;
                    },
                }).process(this.btnBoardOptionExportDocx_template, data);

                BlobDownload(
                    `${this.$store.getters["boardAlive/nameById"](
                        this.$view.boardId
                    )}.docx`,
                    blob
                );
                this.$emit("close");
            } catch {
                this.btnBoardOptionExportDocx_errorMessage =
                    this.$t("docx_export.error");
            }
        },

        async btnBoardOptionExportDocx_default() {
            let defaultTemplate = await fetch(
                "/assets/docx/VW-default-template.docx"
            );
            this.btnBoardOptionExportDocx_template =
                await defaultTemplate.blob();
        },

        btnBoardOptionExportDocx_onCancel() {
            this.$emit("close");
        },
    },
};
</script>

<style scoped>
.el-button.vw-link-color:hover {
    background: none;
}
#btn-board-option-export-docx {
    /* TODO: replace by proper css architecture */
    padding-top: 1px;
}
#btn-board-option-export-docx span {
    margin-bottom: 15px;
}
#btn-board-option-export-docx-form .btn-board-option-export-docx-button {
    font-size: 0.9em;
    border: 1px solid var(--style-color-grey) !important;
    margin-top: 4px;
    padding: 7px;
    border-radius: var(--style-border-radius);
    color: var(--style-color-grey);
}
#btn-board-option-export-docx-form .el-input__inner button {
    height: 100px;
}
#btn-board-option-export-docx-form .el-form-item__error {
    position: relative;
    left: 81px;
    width: 85%;
    display: block;
}
#btn-board-option-export-docx-form .el-radio.is-bordered {
    margin-left: 0px;
    padding: 6px 15px 6px 10px;
    height: 32px !important;
}
#btn-board-option-export-docx-form h4 {
    margin-bottom: 5px;
}
.input-error {
    border-color: var(--color-error-input) !important;
}
</style>
