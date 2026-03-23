<template>
    <pattern-import
        :title="$t('template_import.title')"
        :fileLabel="$t('template_import.default_json_input')"
        :filenamePlaceholder="$t('template_import.default_json_input')"
        fileType=".json"
        encoding="UTF-8"
        :errors="errors"
        :spinner="isInProgress"
        @input="onInput"
        @submit="onSubmit"
        @cancel="onCancel"
    />
</template>
<script>
import PatternImport from "../pattern-import/pattern-import.vue";
export default {
    name: "TemplateLibraryImportJson",
    components: {
        PatternImport,
    },
    inject: ["$view"],
    data() {
        return {
            filename: null,
            fileContent: null,
            isInProgress: false,
            errors: [],
        };
    },
    methods: {
        onInput(rawFileContent) {
            try {
                this.fileContent = JSON.parse(rawFileContent).VW;
            } catch (e) {
                this.fileContent = null;
                this.errors = this.formatErrors(
                    this.$t("template_import.invalid_json_file")
                );
            }
        },
        onSubmit() {
            try {
                this.isInProgress = true;

                this.$store.dispatch("templateIoSet/set", {
                    worldId: this.$view.worldId,
                    VW: this.fileContent,
                });
            } catch (e) {
                this.$store.dispatch("templateIoSet/set", {
                    // TODO: avoid that ping-pong with API
                    worldId: this.$view.worldId,
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
    },
    watch: {
        // Watch import status
        "$store.state.templateIoSet.importStatus"(status) {
            if (status?.error) {
                this.errors = [status.error].map((error) => {
                    const str = JSON.stringify(error);
                    return {
                        key: str,
                        title: str,
                        message: str,
                    };
                });
            }
            if (status?.success === true) {
                this.$emit("close");
            }
            this.isInProgress = false;
        },
    },
};
</script>
