<script>
import BlobDownload from "../../utils/blob-download";
export default {
    name: "TemplateLibraryExportJson",

    inject: ["$view"],

    computed: {
        templateLibraryExportJson_templateIo() {
            return (
                this.$store.getters["templateIoGet/byId"](this.$view.worldId) ||
                {}
            );
        },
    },

    watch: {
        templateLibraryExportJson_templateIo() {
            if (this.templateLibraryExportJson_templateIo) {
                const name = this.$store.getters["worldAlive/byId"](
                    this.$view.worldId
                ).data.name;
                const json = this.templateLibraryExportJson_templateIo.data;
                const blob = new Blob([JSON.stringify(json, null, 2)], {
                    type: "application/json",
                });
                BlobDownload(`${name}_templates.json`, blob);
            }
        },
    },

    methods: {
        templateLibraryExportJson_do() {
            this.$store.dispatch(`templateIoGet/get`, {
                worldId: this.$view.worldId,
            });
        },
    },
};
</script>
