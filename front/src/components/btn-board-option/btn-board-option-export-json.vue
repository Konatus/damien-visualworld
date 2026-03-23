<script>
import BlobDownload from "../../utils/blob-download";
export default {
    name: "BtnBoardOptionExportJson",

    inject: ["$view"],

    computed: {
        btnBoardOptionExportJson_boardIo() {
            const items =
                this.$store.getters["boardIoGet/byId"](this.$view.boardId) ||
                {};
            return items.format === "json" ? items : undefined;
        },
    },

    watch: {
        btnBoardOptionExportJson_boardIo() {
            if (this.btnBoardOptionExportJson_boardIo) {
                let screenshot;
                this.btnBoardOptionExportScreenshot_64()
                    .then((data) => {
                        screenshot = data;
                    })
                    .finally(() => {
                        const name = this.$store.getters["boardAlive/nameById"](
                            this.$view.boardId
                        );
                        const json = this.btnBoardOptionExportJson_boardIo.data;
                        json.board = {
                            data: {
                                name,
                                screenshot,
                            },
                        };
                        const blob = new Blob([JSON.stringify(json, null, 2)], {
                            type: "application/json",
                        });
                        BlobDownload(`${name}.json`, blob);
                        this.$store.commit("overlay/spinner", false);
                    });
            }
        },
    },

    methods: {
        btnBoardOptionExportJson_do() {
            this.$store.commit("overlay/spinner", true);
            this.$store.dispatch(`boardIoGet/get`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                format: "json",
            });
        },
    },
};
</script>
