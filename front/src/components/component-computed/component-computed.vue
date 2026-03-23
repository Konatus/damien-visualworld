<template>
    <div id="component-computed">
        <el-button
            size="small"
            icon="el-icon-delete"
            @click="onDelete"
            :disabled="!selection.length"
            class="vw-link-color"
        >
            {{ $t("component_edit.computed.delete.label") }}
        </el-button>
        <el-button
            size="small"
            icon="el-icon-circle-plus-outline"
            @click="onAdd"
            class="vw-link-color"
        >
            {{ $t("component_edit.computed.add") }}
        </el-button>

        <el-table
            id="computed-list"
            size="mini"
            :data="computed"
            max-height="500"
            @selection-change="onSelectionChange"
        >
            <el-table-column type="selection" width="35" />

            <el-table-column
                min-width="80"
                class-name="computed-model"
                :label="$t('component_edit.computed.header.model')"
            >
                <template slot-scope="scope">
                    <el-form
                        :model="scope.row"
                        :rules="rules"
                        @submit.prevent.native
                    >
                        <el-form-item prop="model">
                            <el-input
                                size="mini"
                                :placeholder="
                                    $t(
                                        'component_edit.computed.placeholder.model'
                                    )
                                "
                                v-model="scope.row.model"
                                @input="onChange"
                            />
                        </el-form-item>
                    </el-form>
                </template>
            </el-table-column>

            <el-table-column
                min-width="320"
                class-name="computed-formula"
                :label="$t('component_edit.computed.header.formula')"
            >
                <template slot-scope="scope">
                    <el-form
                        :model="scope.row"
                        :rules="rules"
                        @submit.prevent.native
                    >
                        <el-form-item prop="formula">
                            <el-input
                                size="mini"
                                type="textarea"
                                spellcheck="false"
                                :autosize="{ minRows: 2, maxRows: 10 }"
                                :placeholder="
                                    $t(
                                        'component_edit.computed.placeholder.formula'
                                    )
                                "
                                v-model="scope.row.formula"
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
    name: "ComponentComputed",

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
            computed: [],
            selection: [],
            rules: {
                model: [
                    {
                        required: true,
                        message: this.$t(
                            `component_edit.computed.validation.model.required`
                        ),
                        trigger: "change",
                    },
                    {
                        pattern: /^[a-z0-9_]*$/,
                        message: this.$t(
                            "component_edit.computed.validation.model.allowed_chars"
                        ),
                        trigger: "change",
                    },
                    {
                        validator: (rule, value, callback) => {
                            // check if model isnt already given to a property or another computed
                            if (
                                this.properties.filter((item) =>
                                    new RegExp(`^${item.model}$`, "i").test(
                                        value
                                    )
                                ).length > 0 ||
                                this.computed.filter((item) =>
                                    new RegExp(`^${item.model}$`, "i").test(
                                        value
                                    )
                                ).length > 1 ||
                                /^VW$/i.test(value)
                            ) {
                                callback(
                                    new Error(
                                        this.$i18n.t(
                                            `component_edit.computed.validation.model.existing`
                                        )
                                    )
                                );
                            }
                        },
                        trigger: "change",
                    },
                ],
                formula: [
                    {
                        required: true,
                        message: this.$t(
                            `component_edit.computed.validation.formula.required`
                        ),
                        trigger: "change",
                    },
                    {
                        validator: (rule, value, callback) => {
                            // check if formula is correctly written with JSONata syntax
                            try {
                                jsonata(value);
                            } catch (e) {
                                callback(
                                    new Error(
                                        this.$i18n.t(
                                            `component_edit.computed.validation.formula.syntax`,
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
        this.doRefreshComputed();
    },
    watch: {
        input() {
            this.doRefreshComputed();
        },
    },

    computed: {
        properties() {
            try {
                const component = JSON.parse(this.componentAsString);
                const schema = JSON.parse(component.data.schemaForm);
                return schema.list;
            } catch (e) {
                return [];
            }
        },
    },

    methods: {
        doRefreshComputed() {
            this.computed = JSON.parse(this.value);
        },
        onDelete() {
            this.$modal.show(
                "dialog",
                {
                    text: this.$t(
                        `component_edit.computed.delete.confirm_${
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
                                this.computed = this.computed.filter(
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
            this.computed.push({
                _id: stringToHash(),
                model: "",
                formula: "",
            });
        },
        onChange() {
            this.$emit("input", JSON.stringify(this.computed));
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

#component-computed {
    padding: 15px 20px;
}
#computed-list {
    margin-top: 10px;
}

/* By default, no border is displayed */
#computed-list >>> .el-table__row .el-input__inner,
#computed-list >>> .el-table__row .el-textarea__inner {
    border-color: transparent;
}

/* A light grey boarder is displayed when mouse is over the line */
#computed-list >>> .el-table__row:hover .el-input__inner,
#computed-list >>> .el-table__row:hover .el-textarea__inner {
    border-color: #aeb1bb;
}

/* Blue border for focused element */
#computed-list >>> .el-table__row .el-input__inner:focus,
#computed-list >>> .el-table__row .el-textarea__inner:focus {
    border-color: var(--style-color-lightblue);
}

/* Vertical align inside selection & name cells */
#computed-list >>> .el-table__row > .el-table-column--selection > .cell {
    position: absolute;
    top: 9px;
}
#computed-list >>> .el-table__row > .computed-model > .cell {
    position: absolute;
    top: 0;
    height: -webkit-fill-available;
    word-break: break-word;
}

/* Formula is code, so monospace font is used */
#computed-list >>> .el-table__row > .computed-formula > .cell {
    font-family: monospace;
}
</style>
