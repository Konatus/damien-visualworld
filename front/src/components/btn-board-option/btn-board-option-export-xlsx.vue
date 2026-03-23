<script>
const CELL_MAX_LENGTH = 32765;
import mapValues from "lodash.mapvalues";
export default {
    name: "BtnBoardOptionExportXslx",
    inject: ["$view"],
    data() {
        return {
            btnBoardOptionExportXlsx_XLSX: null,
        };
    },
    computed: {
        btnBoardOptionExportXlsx_boardName() {
            return this.$store.getters["boardAlive/nameById"](
                this.$view.boardId
            );
        },
        btnBoardOptionExportXlsx_boardIo() {
            const items =
                this.$store.getters["boardIoGet/byId"](this.$view.boardId) ||
                {};
            return items.format === "xlsx" ? items : undefined;
        },
    },
    watch: {
        btnBoardOptionExportXlsx_boardIo() {
            this.btnBoardOptionExportXlsx_ready();
        },
        btnBoardOptionExportXlsx_XLSX() {
            this.btnBoardOptionExportXlsx_ready();
        },
    },
    methods: {
        // Ask for the full data & async load of the XLSX library
        async btnBoardOptionExportXlsx_do() {
            this.$store.dispatch("boardIoGet/get", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                format: "xlsx",
            });
            if (!this.btnBoardOptionExportXlsx_XLSX) {
                this.btnBoardOptionExportXlsx_XLSX = await import("xlsx");
            }
        },

        // The full data have been received,
        async btnBoardOptionExportXlsx_ready() {
            // Sync load of data and library
            if (
                !this.btnBoardOptionExportXlsx_boardIo ||
                !this.btnBoardOptionExportXlsx_XLSX
            ) {
                return;
            }

            // Set objects and links to the xlsx-export-library's format
            const { objects, links } =
                this.btnBoardOptionExportXlsx_boardIo.data.VW;
            const formattedObjects = objects.map((item) =>
                Object.assign(
                    {
                        [this.$t("xlsx_export.headings.componentName")]:
                            this.$store.getters[`componentAlive/nameById`](
                                item.componentId
                            ),
                        [this.$t("xlsx_export.headings.left")]: Math.round(
                            item.position.data.left
                        ),
                        [this.$t("xlsx_export.headings.top")]: Math.round(
                            item.position.data.top
                        ),
                        [this.$t("xlsx_export.headings.width")]: Math.round(
                            item.position.data.width
                        ),
                        [this.$t("xlsx_export.headings.height")]: Math.round(
                            item.position.data.height
                        ),
                        [this.$t("xlsx_export.headings.zIndex")]: Math.round(
                            item.position.data.zIndex
                        ),
                        [this.$t("xlsx_export.headings.rotation")]:
                            Math.round(item.position.data.rotation) || 0,
                        [this.$t("xlsx_export.headings.layer")]: this.$t(
                            `xlsx_export.placeholders.` +
                                (item.position.protect.isBackground
                                    ? "background"
                                    : "foreground")
                        ),
                        [this.$t("xlsx_export.headings.styleBackgroundColor")]:
                            item.object?.protect?.styleBackgroundColor,
                        [this.$t("xlsx_export.headings.styleOutlineColor")]:
                            item.object?.protect?.styleOutlineColor,
                        [this.$t("xlsx_export.headings.styleColor")]:
                            item.object?.protect?.styleColor,
                    },
                    mapValues(item.object.data, (property) => {
                        if (!property) {
                            return "null";
                        } // TODO: is it necessary ?
                        if (property?.[0]?.fileName) {
                            return property?.[0]?.fileName;
                        }
                        if (property.length > CELL_MAX_LENGTH) {
                            return property.slice(0, CELL_MAX_LENGTH);
                        }
                        return property;
                    })
                )
            );
            const formattedLinks = links.map((item) => ({
                [this.$t("xlsx_export.headings.linkOrigin")]:
                    2 +
                    objects.findIndex(
                        (object) =>
                            object.objectId &&
                            object.objectId ==
                                item.objects[item.objects[0].data.arrowhead]
                                    .objectId
                    ),
                [this.$t("xlsx_export.headings.linkEnd")]:
                    2 +
                    objects.findIndex(
                        (object) =>
                            object.objectId &&
                            object.objectId ==
                                item.objects[item.objects[1].data.arrowhead]
                                    .objectId
                    ),
                [this.$t("xlsx_export.headings.linkModel")]:
                    this.$store.getters[`linkModelAlive/nameById`](
                        item.linkModelId
                    ),
                [this.$t("xlsx_export.headings.label")]: item.data.title,
                [this.$t("xlsx_export.headings.color")]: item.data.color,
                [this.$t("xlsx_export.headings.size")]: item.data.size,
                [this.$t("xlsx_export.headings.curve")]: item.data.curve,
                [this.$t("xlsx_export.headings.dash")]: item.data.dash,
                [this.$t("xlsx_export.headings.originShape")]:
                    item.objects[item.objects[0].data.arrowhead].data.type,
                [this.$t("xlsx_export.headings.endShape")]:
                    item.objects[item.objects[1].data.arrowhead].data.type,
            }));

            // Create the Workbook, fill its properties & its sheets
            const XLSX = this.btnBoardOptionExportXlsx_XLSX;
            let wb = this.btnBoardOptionExportXlsx_XLSX.utils.book_new();
            wb.Props = {
                Title: `${this.$t("xlsx_export.title")} "${this.$store.getters[
                    "boardAlive/nameById"
                ](this.$view.boardId)}"`,
                Author: this.$store.getters[`connectionMe/email`],
                Application: this.$t("app_name"),
                Comments: window.location.href,
            };
            XLSX.utils.book_append_sheet(
                wb,
                XLSX.utils.json_to_sheet(formattedObjects),
                this.$t("xlsx_export.sheets.objects")
            );
            XLSX.utils.book_append_sheet(
                wb,
                XLSX.utils.json_to_sheet(formattedLinks),
                this.$t("xlsx_export.sheets.links")
            );
            XLSX.writeFile(
                wb,
                `${this.$store.getters["boardAlive/nameById"](
                    this.$view.boardId
                )}${this.$t("xlsx_export.extension")}`
            );
        },
    },
};
</script>
