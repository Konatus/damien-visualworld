<template>
    <section class="pattern-import vue-dialog">
        <div class="pattern-import-header">
            <h1 class="pattern-import-title modal-title" v-if="title">
                {{ title }}
            </h1>
            <div class="pattern-import-warning" v-if="warning">
                {{ warning }}
            </div>
        </div>
        <form
            class="pattern-import-form"
            @submit.prevent
            enctype="multipart/form-data"
        >
            <div v-loading="spinner">
                <label class="el-form-item__label"> {{ fileLabel }} </label>
                <button
                    @click="onFileChoose"
                    :class="{
                        'pattern-import-button': true,
                        'input-error': errors.length > 0,
                    }"
                    class="el-button--small vw-link-color"
                >
                    {{ filename || filenamePlaceholder }}
                </button>
                <input
                    ref="input-file"
                    type="file"
                    :accept="fileType"
                    :key="refresh"
                    @change="onFileChange"
                    v-show="false"
                />

                <div class="pattern-import-default">
                    <slot name="default" />
                </div>
            </div>

            <div class="pattern-import-errors" v-if="errors.length > 0">
                <el-alert
                    v-for="error of errors"
                    :key="error.key"
                    :title="error.title"
                    :description="error.message"
                    type="error"
                    :closable="false"
                >
                </el-alert>
            </div>

            <div class="vue-dialog-buttons">
                <el-button
                    size="small"
                    class="el-button--success"
                    :disabled="
                        !fileContent ||
                        errors.length > 0 ||
                        spinner ||
                        disableSubmit
                    "
                    type="submit"
                    @click="onSubmit"
                >
                    {{ $t("modal.submit.validate") }}
                </el-button>
                <el-button class="vw-link-color" size="small" @click="onCancel">
                    {{ $t("modal.submit.cancel") }}
                </el-button>
            </div>
        </form>
    </section>
</template>
<script>
const UTF8 = "UTF-8";
const BINARY = "BINARY";
export default {
    name: "PatternImport",
    props: {
        title: {
            type: String,
        },
        warning: {
            type: String,
        },
        fileLabel: {
            type: String,
            default: "", // TODO: generic message ?
        },
        filenamePlaceholder: {
            type: String,
            default: "", // TODO: generic message ?
        },
        fileType: {
            type: String,
            default: "*",
        },
        encoding: {
            type: String,
            validator(value) {
                return [UTF8, BINARY].includes(value);
            },
        },
        errors: {
            type: Array,
            default: () => [],
        },
        spinner: {
            type: Boolean,
            default: false,
        },
        disableSubmit: {
            type: Boolean,
            default: false,
        },
    },
    inject: ["$view"],
    data() {
        return {
            refresh: 0,
            filename: null,
            fileContent: null,
        };
    },
    methods: {
        onFileChoose() {
            this.$refs["input-file"].click();
        },
        onFileChange(evt) {
            this.filename = null;
            this.fileContent = null;

            // Get file from input
            const files = evt.target.files || evt.dataTransfer.files;
            if (!files.length) {
                return;
            }
            this.filename = files[0].name;

            // Read file from input
            const reader = new FileReader();
            if (this.encoding === UTF8) {
                reader.readAsText(files[0], "UTF-8");
            } else if (this.encoding === BINARY) {
                reader.readAsBinaryString(files[0]);
            }
            reader.onload = (evtRead) => {
                const content = evtRead.target.result;
                this.fileContent = content;
                this.$emit("input", content);
                this.refresh++;
            };
        },

        onSubmit() {
            this.$emit("submit");
        },
        onCancel() {
            this.$emit("cancel");
        },
    },
};
</script>
<style>
.pattern-import-header {
    margin-bottom: 20px;
}
.pattern-import-title {
    margin-top: 0;
    margin-bottom: 10px;
}
.pattern-import-warning {
    font-size: 13px;
    font-style: italic;
}
.pattern-import-form .pattern-import-button {
    font-size: 0.9em;
    border: 1px solid var(--style-color-grey) !important;
    margin-top: 4px;
    padding: 7px;
    border-radius: var(--style-border-radius);
    color: var(--style-color-grey);
}
.pattern-import-form .el-input__inner button {
    height: 100px;
}
.pattern-import-default {
    width: max-content;
    margin: auto;
}
.pattern-import-errors {
    max-height: 15em;
    overflow-y: scroll;
}
.pattern-import-errors .el-alert--error.is-light {
    margin-bottom: 2px;
}
.pattern-import .vw-link-color.el-button:hover {
    background: none;
}
</style>
