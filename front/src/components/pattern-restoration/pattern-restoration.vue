<template>
    <div>
        <!-- necessary for coloration of background around the table and scroll management -->

        <el-table
            id="pattern-restoration"
            :data="deletedItems"
            :empty-text="$t('restore.empty')"
            :stripe="true"
            border
            size="medium"
            max-height="700"
        >
            <el-table-column :label="$t('restore.table.button')" width="100">
                <template slot-scope="scope">
                    <el-button
                        type="info"
                        size="mini"
                        @click.stop="
                            onRestoreItem(scope.row._id, scope.row.name)
                        "
                        @touchstart="
                            onRestoreItem(scope.row._id, scope.row.name)
                        "
                    >
                        <i class="el-icon-bangzhu"></i>
                    </el-button>
                </template>
            </el-table-column>

            <el-table-column prop="name" sortable :label="$t(conf.nameLabel)" />

            <el-table-column
                prop="deletedAt"
                sortable
                sort-by="timestamp"
                :label="$t('restore.table.deleted_on')"
            />
        </el-table>
    </div>
</template>

<script>
import app from "../../conf/app";

export default {
    name: "PatternRestoration",

    inject: ["$view"],

    computed: {
        conf() {
            const CONF = {
                board: {
                    store: "boardTrash",
                    nameProperty: "name",
                    nameLabel: "restore.table.name",
                    modalTitle: "restore.modal.board_title",
                },
                world: {
                    store: "worldTrash",
                    nameProperty: "name",
                    nameLabel: "restore.table.name",
                    modalTitle: "restore.modal.world_title",
                },
            };
            return CONF[this.$attrs.item];
        },

        // items offered for restore
        deletedItems() {
            const deletedItems =
                this.$store.getters[`${this.conf.store}/asArray`];

            // Add properties to be rendered...
            for (let item of deletedItems) {
                if (item.private && item.private.deletedAt) {
                    // Timestamp needed for element-ui table sorting on dates
                    item.timestamp = Date.parse(item.private.deletedAt);

                    // Readable date and time to be displayed
                    item.deletedAt = this.$d(
                        new Date(item.private.deletedAt),
                        "long"
                    );
                }

                // Choose the field to be displayed as name
                if (item.data && item.data[this.conf.nameProperty]) {
                    item.name = item.data[this.conf.nameProperty];
                } else {
                    item.name = item._id;
                }
            }

            // Sort by name ascending
            deletedItems.sort((a, b) => a.name.localeCompare(b.name));

            return deletedItems;
        },
    },

    methods: {
        onRestoreItem(_id, name) {
            this.$modal.show(
                "dialog",
                {
                    title: this.$t(this.conf.modalTitle),
                    text: `${this.$t("restore.modal.text")} "${name}" ?`,
                    buttons: [
                        {
                            title: this.$t("modal.yes"),
                            handler: () => {
                                this.$store.dispatch(
                                    `${this.conf.store}/restore`,
                                    {
                                        worldId: this.$view.worldId,
                                        boardId: this.$view.boardId,
                                        data: [{ _id }],
                                    }
                                );
                                this.$modal.hide("dialog");
                            },
                        },
                        {
                            title: this.$t("modal.no"),
                            default: true,
                        },
                    ],
                },
                app.modal.parameters
            );
        },
    },
};
</script>
<style scoped>
#pattern-restoration >>> .cell {
    text-align: center;
}

#pattern-restoration >>> th > .cell {
    color: #303133;
}
</style>
