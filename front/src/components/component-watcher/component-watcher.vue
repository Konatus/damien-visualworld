<template>
    <div id="component-watcher">
        <el-button
            size="small"
            icon="el-icon-delete"
            @click="onDelete"
            :disabled="!selection.length"
            class="vw-link-color"
        >
            {{ $t("component_edit.watcher.delete.label") }}
        </el-button>
        <el-button
            size="small"
            icon="el-icon-circle-plus-outline"
            @click="onAdd"
            class="vw-link-color"
        >
            {{ $t("component_edit.watcher.add") }}
        </el-button>

        <el-table
            id="watcher-list"
            size="mini"
            :data="watcher"
            max-height="600"
            @selection-change="onSelectionChange"
        >
            <el-table-column type="selection" width="35" />

            <el-table-column
                min-width="150"
                class-name="watcher-given"
                :label="$t('component_edit.watcher.header.given')"
            >
                <template slot-scope="scope">
                    <el-form
                        :model="scope.row"
                        :rules="rules"
                        @submit.prevent.native
                    >
                        <el-form-item prop="given">
                            <el-input
                                size="mini"
                                type="textarea"
                                spellcheck="false"
                                :autosize="{ minRows: 2, maxRows: 10 }"
                                :placeholder="
                                    $t(
                                        'component_edit.watcher.placeholder.given'
                                    )
                                "
                                v-model="scope.row.given"
                                @input="onChange"
                            />
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>

            <el-table-column
                min-width="150"
                class-name="watcher-when"
                :label="$t('component_edit.watcher.header.when')"
            >
                <template slot-scope="scope">
                    <el-form
                        :model="scope.row"
                        :rules="rules"
                        @submit.prevent.native
                    >
                        <el-form-item prop="when">
                            <el-select
                                clearable
                                filterable
                                v-model="scope.row.when"
                                :placeholder="
                                    $t(
                                        'component_edit.watcher.placeholder.when'
                                    )
                                "
                                @input="onChange"
                            >
                                <el-option
                                    v-for="item in fieldsAndcomputeds"
                                    :key="item.model"
                                    :label="item.model"
                                    :value="item.model"
                                />
                            </el-select>
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>

            <el-table-column
                min-width="150"
                class-name="watcher-then"
                :label="$t('component_edit.watcher.header.then')"
            >
                <template slot-scope="scope">
                    <el-form
                        :model="scope.row"
                        :rules="rules"
                        @submit.prevent.native
                    >
                        <el-form-item prop="thenKey">
                            <el-select
                                clearable
                                filterable
                                v-model="scope.row.thenKey"
                                :placeholder="
                                    $t(
                                        'component_edit.watcher.placeholder.thenKey'
                                    )
                                "
                                @input="onChange"
                            >
                                <el-option
                                    v-for="item in fields"
                                    :key="item.model"
                                    :label="item.model"
                                    :value="item.model"
                                />
                            </el-select>
                        </el-form-item>
                        <code style="flex-shrink: 0"> := </code>
                        <el-form-item prop="thenValue">
                            <el-input
                                size="mini"
                                type="textarea"
                                spellcheck="false"
                                :autosize="{ minRows: 2, maxRows: 10 }"
                                :placeholder="
                                    $t(
                                        'component_edit.watcher.placeholder.thenValue'
                                    )
                                "
                                v-model="scope.row.thenValue"
                                @input="onChange"
                            />
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
import jsonata from "jsonata";
import app from "../../conf/app";
import stringToHash from "../../utils/string-to-hash";
export default {
    name: "ComponentWatcher",

    props: {
        value: {
            type: String,
            default: "[]",
        },
        componentAsString: {
            type: String,
            default: "{}",
        },
    },

    data() {
        return {
            watcher: [],
            selection: [],
            rules: {
                given: [
                    {
                        required: true,
                        message: this.$t(
                            `component_edit.watcher.validation.given.required`
                        ),
                        trigger: "change",
                    },
                    {
                        validator: (rule, value, callback) => {
                            try {
                                jsonata(value);
                            } catch (e) {
                                callback(
                                    new Error(
                                        this.$i18n.t(
                                            `component_edit.watcher.validation.given.syntax`,
                                            { exception: e.message }
                                        )
                                    )
                                );
                            }
                        },
                        trigger: "change",
                    },
                ],
                when: [
                    {
                        required: true,
                        message: this.$t(
                            `component_edit.watcher.validation.when.required`
                        ),
                        trigger: "change",
                    },
                ],
                thenKey: [
                    {
                        required: true,
                        message: this.$t(
                            `component_edit.watcher.validation.thenKey.required`
                        ),
                        trigger: "change",
                    },
                ],
                thenValue: [
                    {
                        required: true,
                        message: this.$t(
                            `component_edit.watcher.validation.thenValue.required`
                        ),
                        trigger: "change",
                    },
                    {
                        validator: (rule, value, callback) => {
                            try {
                                jsonata(value);
                            } catch (e) {
                                callback(
                                    new Error(
                                        this.$i18n.t(
                                            `component_edit.watcher.validation.thenValue.syntax`,
                                            { exception: e.message }
                                        )
                                    )
                                );
                            }
                        },
                        trigger: "change",
                    },
                ],
            },
        };
    },

    created() {
        this.doRefreshwatcher();
    },
    watch: {
        input() {
            this.doRefreshwatcher();
        },
    },

    computed: {
        fields() {
            let fields = [];
            try {
                const component = JSON.parse(this.componentAsString);
                const schema = JSON.parse(component.data.schemaForm);
                fields = schema.list;
                fields.sort((a, b) => {
                    return a.model.localeCompare(b.model);
                });
            } catch (e) {
                /* nothing to do */
            }
            return fields;
        },
        computeds() {
            let computed = [];
            try {
                const component = JSON.parse(this.componentAsString);
                computed = JSON.parse(component.data.computed);
            } catch (e) {
                /* nothing todo */
            }
            return computed;
        },
        fieldsAndcomputeds() {
            let out = [];
            try {
                out = [...this.fields, ...this.computeds];
                out.sort((a, b) => {
                    return a.model.localeCompare(b.model);
                });
            } catch (e) {
                /* nothing to do */
            }
            return out;
        },
    },

    methods: {
        doRefreshwatcher() {
            this.watcher = JSON.parse(this.value);
        },
        onDelete() {
            this.$modal.show(
                "dialog",
                {
                    text: this.$t(
                        `component_edit.watcher.delete.confirm_${
                            this.selection.length < 2 ? "singular" : "plural"
                        }`
                    ),
                    buttons: [
                        {
                            title: this.$t("modal.yes"),
                            handler: () => {
                                const selectedIds = this.selection.map(
                                    (item) => item._id
                                );
                                this.watcher = this.watcher.filter(
                                    (item) => !selectedIds.includes(item._id)
                                );
                                this.selection = [];
                                this.onChange();
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
        onAdd() {
            this.watcher.push({
                _id: stringToHash(),
                given: "",
                when: null,
                thenKey: null,
                thenValue: null,
            });
        },
        onChange() {
            this.$emit("input", JSON.stringify(this.watcher));
        },
        onSelectionChange(evt) {
            this.selection = evt;
        },
    },
};
</script>
<style scoped>
.vw-link-color.el-button:hover {
    background: #fff;
}

#component-watcher {
    padding: 15px 20px;
}
#watcher-list {
    margin-top: 10px;
}

/* By default, no border is displayed */
#watcher-list >>> .el-table__row .el-input__inner,
#watcher-list >>> .el-table__row .el-textarea__inner {
    border-color: transparent;
}

/* A light grey boarder is displayed when mouse is over the line */
#watcher-list >>> .el-table__row:hover .el-input__inner,
#watcher-list >>> .el-table__row:hover .el-textarea__inner {
    border-color: #aeb1bb;
}

/* Blue border for focused element */
#watcher-list >>> .el-table__row .el-input__inner:focus,
#watcher-list >>> .el-table__row .el-textarea__inner:focus {
    border-color: var(--style-color-lightblue);
}

/* Vertical align inside selection & name cells */
#watcher-list >>> .el-table__row > .el-table-column--selection > .cell {
    position: absolute;
    top: 9px;
}
#watcher-list >>> .el-table__row > .watcher-name > .cell {
    position: absolute;
    top: 0;
}

/* TODO: monospace for given & then-value fields */

#watcher-list >>> .el-table__row > .watcher-then > .cell > .el-form {
    display: flex;
}
</style>
