<template>
    <el-form id="component-template">
        <div id="component-template-main">
            <!-- Graphical templating -->
            <field-dock
                :key="data.schemaForm"
                v-show="!data.templateUseHtml"
                :gridSize="gridSize"
            />
            <div
                id="component-template-graphical"
                v-show="!data.templateUseHtml"
            >
                <component-grid
                    :key="`${data.templateGridStack}-${data.defaultWidth}-${data.defaultHeight}`"
                    :component="data"
                    :gridSize="gridSize"
                    v-model="data.templateGridStack"
                    :templateGridStackStyleAsString="
                        templateGridStackStyleAsString
                    "
                    ref="componentGrid"
                />
            </div>

            <!-- Advanced templating -->
            <div id="component-template-advanced" v-show="data.templateUseHtml">
                <el-input
                    type="textarea"
                    v-model="data.templateHtml"
                    autosize
                    :rows="3"
                >
                </el-input>
                <el-alert
                    type="error"
                    v-if="advancedTemplateErrors"
                    :title="advancedTemplateErrors"
                    :closable="false"
                    show-icon
                />
                <template
                    v-else-if="
                        advancedTemplateWarnings || advancedTemplateInfos
                    "
                >
                    <el-alert
                        type="warning"
                        v-if="advancedTemplateWarnings"
                        :title="advancedTemplateWarnings"
                        :closable="false"
                        show-icon
                    />
                    <el-alert
                        type="info"
                        v-if="advancedTemplateInfos"
                        :title="advancedTemplateInfos"
                        :closable="false"
                        show-icon
                    />
                </template>
            </div>

            <!-- Options of the template -->
            <div id="component-template-options">
                <el-steps :active="selectFieldId ? 0 : 1" simple>
                    <el-step
                        class="step-object"
                        :class="{ 'vw-link-color': selectFieldId }"
                        :title="$t('component_edit.template.object')"
                        @click.native="onShowComponentOptions"
                    />
                    <el-step
                        :title="$t('component_edit.template.property')"
                        v-if="selectFieldId"
                    />
                </el-steps>

                <span class="line"></span>

                <!-- General template's style options -->
                <div id="component-template-object" v-if="!selectFieldId">
                    <div id="component-template-size">
                        <el-form-item
                            id="component-template-width"
                            :label="
                                $t('component_edit.style_form.default_width')
                            "
                        >
                            <el-input-number
                                controlsPosition="right"
                                size="mini"
                                :min="1"
                                :max="boardSize.width"
                                v-model="data.defaultWidth"
                            />
                        </el-form-item>
                        <el-form-item
                            id="component-template-height"
                            :label="
                                $t('component_edit.style_form.default_height')
                            "
                        >
                            <el-input-number
                                controlsPosition="right"
                                size="mini"
                                :min="1"
                                :max="boardSize.height"
                                v-model="data.defaultHeight"
                            />
                        </el-form-item>
                    </div>

                    <el-form-item
                        id="component-template-colors"
                        class="vw-flex-col"
                        :label="$t('component_edit.style_form.colors')"
                    >
                        <div class="component-template-colors">
                            <color-picker
                                v-model="data.styleBackgroundColor"
                                mode="background"
                            />
                            <color-picker
                                v-model="data.styleOutlineColor"
                                mode="outline"
                            />
                            <color-picker v-model="styleColor" mode="font" />
                        </div>
                        <div id="component-template-colors-switch">
                            <el-switch
                                class="vw-link-color"
                                :active-text="
                                    $t('component_edit.style_form.overloadable')
                                "
                                v-model="data.styleOverloadable"
                            />
                        </div>
                    </el-form-item>
                </div>

                <!-- Field's style options -->
                <div
                    id="component-field"
                    v-if="!data.templateUseHtml && selectFieldId"
                >
                    <div
                        id="component-field-content"
                        v-if="/^fit_text/.test(selectFieldId)"
                    >
                        <el-form-item
                            class="vw-flex-col"
                            :label="$t('component_edit.style_field.content')"
                        >
                            <el-input
                                v-model="
                                    data.templateGridStackStyle[selectFieldId]
                                        .content
                                "
                                @input="
                                    getFieldStyle(
                                        'content',
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].content,
                                        selectFieldId
                                    )
                                "
                            />
                        </el-form-item>
                    </div>
                    <div id="component-field-style">
                        <el-form-item
                            id="component-field-style-color"
                            class="vw-flex-col"
                            :label="$t('component_edit.style_field.colors')"
                        >
                            <div class="component-field-style-colors">
                                <color-picker
                                    id="component-field-background"
                                    mode="background"
                                    v-model="
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].styleBackgroundColor
                                    "
                                    @input="
                                        getFieldStyle(
                                            'styleBackgroundColor',
                                            data.templateGridStackStyle[
                                                selectFieldId
                                            ].styleBackgroundColor,
                                            selectFieldId
                                        )
                                    "
                                />
                                <color-picker
                                    id="component-field-color"
                                    mode="font"
                                    v-model="
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].styleColor
                                    "
                                    @input="
                                        getFieldStyle(
                                            'styleColor',
                                            data.templateGridStackStyle[
                                                selectFieldId
                                            ].styleColor,
                                            selectFieldId
                                        )
                                    "
                                />
                            </div>
                        </el-form-item>

                        <div id="component-field-text">
                            <el-form-item
                                id="component-field-alignment"
                                :label="
                                    $t(
                                        'component_edit.style_field.alignment.label'
                                    )
                                "
                            >
                                <el-radio-group
                                    size="mini"
                                    v-model="
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].styleTextAlign
                                    "
                                    @change="
                                        getFieldStyle(
                                            'styleTextAlign',
                                            data.templateGridStackStyle[
                                                selectFieldId
                                            ].styleTextAlign,
                                            selectFieldId
                                        )
                                    "
                                    class="vw-link-color"
                                >
                                    <el-radio-button
                                        :label="
                                            $t(
                                                'component_edit.style_field.alignment.left'
                                            )
                                        "
                                    >
                                        <font-awesome-icon
                                            class="icon"
                                            icon="align-left"
                                        />
                                    </el-radio-button>
                                    <el-radio-button
                                        :label="
                                            $t(
                                                'component_edit.style_field.alignment.center'
                                            )
                                        "
                                    >
                                        <font-awesome-icon
                                            class="icon"
                                            icon="align-center"
                                        />
                                    </el-radio-button>
                                    <el-radio-button
                                        :label="
                                            $t(
                                                'component_edit.style_field.alignment.right'
                                            )
                                        "
                                    >
                                        <font-awesome-icon
                                            class="icon"
                                            icon="align-right"
                                        />
                                    </el-radio-button>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item
                                id="component-field-text-style"
                                :label="
                                    $t(
                                        'component_edit.style_field.advanced_style.label'
                                    )
                                "
                            >
                                <el-checkbox
                                    size="mini"
                                    v-model="
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].styleFontWeightBold
                                    "
                                    :true-label="
                                        $t(
                                            'component_edit.style_field.advanced_style.bold'
                                        )
                                    "
                                    false-label="unset"
                                    @change="
                                        getFieldStyle(
                                            'styleFontWeightBold',
                                            data.templateGridStackStyle[
                                                selectFieldId
                                            ].styleFontWeightBold,
                                            selectFieldId
                                        )
                                    "
                                    class="vw-link-color"
                                >
                                    <font-awesome-icon
                                        class="icon"
                                        icon="bold"
                                    />
                                </el-checkbox>

                                <el-checkbox
                                    size="mini"
                                    v-model="
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].styleTextDecorationUnderline
                                    "
                                    :true-label="
                                        $t(
                                            'component_edit.style_field.advanced_style.underline'
                                        )
                                    "
                                    false-label="unset"
                                    @change="
                                        getFieldStyle(
                                            'styleTextDecorationUnderline',
                                            data.templateGridStackStyle[
                                                selectFieldId
                                            ].styleTextDecorationUnderline,
                                            selectFieldId
                                        )
                                    "
                                    class="vw-link-color"
                                >
                                    <font-awesome-icon
                                        class="icon"
                                        icon="underline"
                                    />
                                </el-checkbox>

                                <el-checkbox
                                    size="mini"
                                    v-model="
                                        data.templateGridStackStyle[
                                            selectFieldId
                                        ].styleFontStyleItalic
                                    "
                                    :true-label="
                                        $t(
                                            'component_edit.style_field.advanced_style.italic'
                                        )
                                    "
                                    false-label="unset"
                                    @change="
                                        getFieldStyle(
                                            'styleFontStyleItalic',
                                            data.templateGridStackStyle[
                                                selectFieldId
                                            ].styleFontStyleItalic,
                                            selectFieldId
                                        )
                                    "
                                    class="vw-link-color"
                                >
                                    <font-awesome-icon
                                        class="icon"
                                        icon="italic"
                                    />
                                </el-checkbox>
                            </el-form-item>
                        </div>
                    </div>
                </div>

                <el-form-item
                    id="component-template-style"
                    :label="$t('component_edit.style_form.style')"
                    v-if="!selectFieldId"
                >
                    <el-input type="textarea" v-model="data.styleCss" autosize>
                    </el-input>
                </el-form-item>

                <span class="line"></span>

                <!-- Switch between graphical & advanced templating -->
                <el-form-item id="component-template-switch">
                    <el-link
                        class="component-template-switch-link vw-link-color vw-link-filter"
                        @click="switchTemplate"
                        v-if="!data.templateUseHtml"
                        :underline="false"
                    >
                        <img
                            src="../../assets/icons/component-html.svg"
                            :alt="
                                $t(
                                    'component_edit.template.use_advanced_template'
                                )
                            "
                        />
                        {{
                            $t("component_edit.template.use_advanced_template")
                        }}
                    </el-link>
                    <el-link
                        class="component-template-switch-link vw-link-color vw-link-filter"
                        @click="switchTemplate"
                        v-if="data.templateUseHtml"
                        :underline="false"
                    >
                        <img
                            src="../../assets/icons/component-html.svg"
                            :alt="
                                $t(
                                    'component_edit.template.use_graphical_template'
                                )
                            "
                        />
                        {{
                            $t("component_edit.template.use_graphical_template")
                        }}
                    </el-link>
                </el-form-item>

                <el-button
                    id="delete-field"
                    icon="el-icon-delete"
                    v-if="!data.templateUseHtml && selectFieldId"
                    @click="removeField"
                    size="small"
                    class="vw-link-color"
                >
                    {{ $t("component_edit.style_field.delete_field") }}
                </el-button>
            </div>
        </div>
    </el-form>
</template>
<script>
import jsonDeepCopy from "../../utils/json-deep-copy";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faAlignRight,
    faAlignCenter,
    faAlignLeft,
    faItalic,
    faBold,
    faUnderline,
} from "@fortawesome/free-solid-svg-icons";
library.add(
    faAlignRight,
    faAlignCenter,
    faAlignLeft,
    faItalic,
    faBold,
    faUnderline
);

import FieldDock from "../field-dock/field-dock";
import ColorPicker from "../color-picker/color-picker";
import ComponentGrid from "../component-grid/component-grid";

import VueTemplate from "../../utils/vue-template";

import app from "../../conf/app";

export default {
    name: "componentTemplate",

    components: {
        FontAwesomeIcon,
        FieldDock,
        ColorPicker,
        ComponentGrid,
    },

    props: {
        value: Object,
    },

    computed: {
        styleColor: {
            get() {
                return this.data.styleColor;
            },
            set(val) {
                // eslint-disable-next-line vue/no-mutating-props
                this.value.styleColor = val == null ? "rgba(0, 0, 0, 1)" : val;
            },
        },

        boardSize() {
            return app.board.size;
        },

        selectFieldId() {
            return this.$store.getters[`app/componentEdit/fieldId`];
        },

        // Errors or warning generated on compilation of advanced templating
        advancedTemplateReturn() {
            return VueTemplate.lint(this.data.templateHtml);
        },
        advancedTemplateErrors() {
            try {
                return this.advancedTemplateReturn.errors
                    .filter((item) => item.msg && item.codeFrame)
                    .map(
                        ({ msg, codeFrame }) =>
                            `${this.$t(
                                "component_edit.template.html.error"
                            )}${this.$t(
                                "component_edit.template.html." + msg
                            )}\n${codeFrame}`
                    )
                    .join("\n\n");
            } catch {
                return JSON.stringify(this.advancedTemplateReturn.errors);
            }
        },
        advancedTemplateWarnings() {
            try {
                return this.advancedTemplateReturn.warnings
                    .filter((item) => item.msg && item.codeFrame)
                    .map(
                        ({ msg, codeFrame }) =>
                            `${this.$t(
                                "component_edit.template.html.warning"
                            )}${this.$t(
                                "component_edit.template.html." + msg
                            )}\n${codeFrame}`
                    )
                    .join("\n\n");
            } catch {
                return [];
            }
        },
        advancedTemplateInfos() {
            try {
                return this.advancedTemplateReturn.infos
                    .filter((item) => item.msg && item.codeFrame)
                    .map(
                        ({ msg, codeFrame }) =>
                            `${this.$t(
                                "component_edit.template.html.info"
                            )}${this.$t(
                                "component_edit.template.html." + msg
                            )}\n${codeFrame}`
                    )
                    .join("\n\n");
            } catch {
                return [];
            }
        },

        gridSize() {
            const colCount = app.dynamicComponent.colCount;
            const cellWidth = this.data.defaultWidth / 12;
            const rowCount = Math.floor(this.data.defaultHeight / cellWidth);
            const cellHeight = this.data.defaultHeight / rowCount;

            return {
                colCount: colCount,
                cellWidth: cellWidth,
                rowCount: rowCount,
                cellHeight: cellHeight,
            };
        },
    },

    created() {
        // First of all refresh field list and board
        this.doRefreshPropFields(this.value.schemaForm);
        this.doRefreshCompFields(this.value.computed);
        this.doEmitInput(this.data);
    },

    destroyed() {
        this.$store.commit(`app/componentEdit/fieldId`, null);
    },

    watch: {
        // Refresh field list when schemaForm change
        // Refresh board when templateGridStack change
        value: {
            deep: true,
            handler(value) {
                this.data.name = value.name;
                this.data.description = value.description;
                this.data.schemaForm = value.schemaForm;
                this.doRefreshPropFields(value.schemaForm);
                this.doRefreshCompFields(value.computed);
            },
        },

        // Emit live updated data on change
        data: {
            deep: true,
            handler(data) {
                this.doEmitInput(data);
            },
        },
    },

    // Copy prop value for live update in the component
    data() {
        return {
            cachedSchemaForm: undefined,
            data: jsonDeepCopy(this.value),
            templateGridStackStyleAsString: "",
        };
    },

    methods: {
        removeField() {
            this.$refs.componentGrid.removeField();
        },

        getFieldStyle(styleName, value, selectFieldId) {
            // Save style for field
            this.data.templateGridStackStyle[selectFieldId].styleName = value;

            let style = {};
            switch (styleName) {
                case "content":
                    style[selectFieldId] = { content: value };
                    break;

                case "styleTextAlign":
                    style[selectFieldId] = { textAlign: value };
                    break;

                case "styleFontWeightBold":
                    style[selectFieldId] = { fontWeight: value };
                    break;

                case "styleTextDecorationUnderline":
                    style[selectFieldId] = { textDecoration: value };
                    break;

                case "styleFontStyleItalic":
                    style[selectFieldId] = { fontStyle: value };
                    break;

                case "styleBackgroundColor":
                    style[selectFieldId] = { background: value };
                    break;

                case "styleColor":
                    style[selectFieldId] = { color: value };
                    break;
            }

            // Transform style in string for reactivity in gridStack
            this.templateGridStackStyleAsString = JSON.stringify(style);
        },

        // Refresh list of fields for graphical templating
        doRefreshPropFields(schemaForm) {
            if (
                schemaForm != this.cachedSchemaForm ||
                this.cachedSchemaForm === undefined
            ) {
                // move that check into the store
                this.$store.commit(`field/schema`, schemaForm);
                this.cachedSchemaForm = schemaForm;
                this.doRefreshTemplateGridStack();
            }
        },
        doRefreshCompFields(computed) {
            this.$store.commit(`field/computed`, computed);
            this.doRefreshTemplateGridStack();
        },
        doRefreshTemplateGridStack() {
            // Remove deleted prop or computed from the gridstack
            const models = this.$store.getters[`field/idAsArray`];
            const grid = JSON.parse(this.value.templateGridStack).grid.filter(
                (item) => models.includes(item.fieldId)
            );
            this.data.templateGridStack = JSON.stringify({
                grid,
                rowCount: this.gridSize.rowCount,
                colCount: this.gridSize.colCount,
            });
        },

        // Emit updated data
        doEmitInput(data) {
            this.$emit("input", data);
        },

        switchTemplate() {
            this.$store.commit(`app/componentEdit/fieldId`, null);
            this.data.templateUseHtml = !this.data.templateUseHtml;
        },

        onShowComponentOptions() {
            this.$store.commit(`app/componentEdit/fieldId`, null);
        },
    },
};
</script>

<style>
.component-template-autocomplete .value {
    font-size: 14px;
}

.component-template-autocomplete li {
    padding: 0 16px;
}

#component-template-graphical .el-alert {
    display: none;
}
</style>
<style scoped>
.el-button.vw-link-color:hover {
    background: none;
}

/* General aspect of component template */
#component-template,
#component-template-main {
    height: 100%;
}

#component-template-switch {
    margin: 20px 20px 20px 25px;
}

#component-template-main {
    display: flex;
}

#component-template-graphical {
    position: absolute;
    border: 1px solid var(--style-color-grey);
    background: var(--layer-background);
    left: 20%;
    right: 20%;
    top: 0px;
    bottom: 0px;
    z-index: 1; /* ghost from dock immediatly visible */

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

#component-template-options {
    position: absolute;
    right: 0px;
    width: 20%;
    z-index: var(--max-z-index);
    background: white;
    height: 100%;
    padding-bottom: 20px;
    box-sizing: border-box;
}

/* General aspect of component template options */
#component-template-options >>> .el-form-item__content {
    line-height: inherit;
}

#component-template-options >>> .el-step__icon {
    display: none;
}

#component-template-size div:first-child {
    margin-right: 10px;
}

#component-template-options >>> .el-step__title {
    font-size: 16px;
    padding-right: 11px;
}

#component-template-options >>> .el-steps--simple {
    padding: 5px;
    margin: 20px 10px 20px 10px !important;
    height: 35px;
}

#component-template-options >>> .el-step__arrow::after {
    transform: rotate(45deg) translateY(2px);
}

#component-template-options >>> .el-step__arrow::before {
    transform: rotate(-45deg) translateY(-1px);
}

#component-template-options >>> .el-step__arrow::after,
#component-template-options >>> .el-step__arrow::before {
    height: 8px;
    width: 2px;
}

#component-template-options >>> .component-template-switch-link span {
    display: flex;
    align-items: center;
    font-size: 13px;
}

#component-template-options >>> .component-template-switch-link span img {
    margin-right: 10px;
}

/* Graphical templating */

#component-template-object {
    margin-top: 20px;
}

#component-template-colors >>> .el-form-item__label,
#component-field-style-color >>> .el-form-item__label {
    text-align: left !important;
}
.component-template-colors {
    display: flex;
    justify-content: space-between;
}
.component-field-style-colors {
    display: flex;
}
#component-template-colors-switch {
    margin-top: 20px;
}
#component-template-colors-switch >>> .el-switch__label > span {
    font-size: 14px;
}

#component-template-size,
#component-template-colors,
#component-field-content,
#component-field-style-color,
#component-template-options >>> .el-steps--simple {
    display: flex;
    margin-left: 25px;
    margin-right: 25px;
    margin-bottom: 20px;
}

#component-template-size >>> .el-form-item {
    margin-bottom: 0px;
}

#component-template-style-text {
    margin-bottom: 40.5px;
}

.vw-link-color:hover >>> .el-form-item__label {
    color: var(--color-main-font) !important;
}

#component-template-options >>> #component-template-size .el-input-number {
    width: 80px;
}

#component-template-options >>> #component-template-size .el-input__inner {
    padding-left: 10px;
    padding-right: 0px;
    text-align: left;
}

#component-template-options >>> #component-template-fontsize label {
    text-align: left;
}

#component-template-options >>> .el-input__suffix {
    color: var(--color-main-font);
    font-size: 12px;
    top: 7px;
    right: 13px;
    box-sizing: border-box;
}

#component-template-options >>> .el-autocomplete {
    width: 70px;
}

#component-template-options .step-object.vw-link-color:hover {
    cursor: pointer;
}

/* Component field style */

#component-field {
    max-height: 53vh;
    overflow-y: auto;
}

#component-field-style {
    margin-top: 20px;
}

#component-field-style >>> .el-form-item {
    margin-bottom: 20px;
}

#component-field-style-color {
    display: flex;
}

#component-field-color {
    height: 30px;
    margin-left: 52px;
}

#component-field-style #component-field-text {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

#component-field-style #component-field-background {
    margin-bottom: 20px;
}

#component-field-style #component-field-style-color,
#component-field-style #component-field-size,
#component-field-style #component-field-text {
    margin-left: 25px;
}

#component-field-alignment,
#component-field-text-style {
    width: 100%;
    display: flex;
    flex-direction: column;
}

#component-field-text-style >>> .el-form-item__content {
    display: flex;
    height: 28px;
}

#component-field-alignment >>> .el-form-item__label,
#component-field-content >>> .el-form-item__label,
#component-field-text-style >>> .el-form-item__label {
    text-align: left;
}

#component-field-text-style >>> .el-checkbox__input {
    display: none;
}

#component-field-text-style >>> .el-checkbox:first-child {
    border-radius: var(--style-border-radius) 0 0 var(--style-border-radius);
}

#component-field-text-style >>> .el-checkbox.is-checked:first-child {
    border-right: 1px solid white;
}

#component-field-text-style >>> .el-checkbox:last-child {
    border-radius: 0 var(--style-border-radius) var(--style-border-radius) 0;
}

#component-field-text-style >>> .el-checkbox.is-checked:last-child {
    border-left: 1px solid white;
}

#component-field-text-style >>> .el-checkbox {
    border: 1px solid #aeb1bb;
    padding: 7px 16px;
    font-size: 12px;
    margin-right: 0px;
}

#component-field-text-style >>> .el-checkbox__label {
    padding: 0px;
    font-size: 11px;
    line-height: inherit;
}

#component-field-text-style >>> .el-checkbox.is-checked {
    background-color: #171e36;
    border-color: #171e36;
}

#component-field-text-style >>> .el-checkbox.is-checked .el-checkbox__label {
    color: #fff;
}

#component-field-style #component-field-background >>> label,
#component-field-style #component-field-color >>> label {
    text-align: left;
}

#delete-field {
    margin-top: 10px;
    margin-left: 25px;
    margin-bottom: 30px;
}

/* Advanced templating */
#component-template-advanced {
    width: calc(80% - 20px);
    position: relative;
    margin: 20px 0px 20px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 1px solid #aeb1bb;
    border-radius: var(--style-border-radius);
}

#component-template-advanced >>> .el-textarea {
    height: 100% !important;
    font-family: monospace;
}
#component-template-advanced >>> .el-textarea__inner {
    width: 100%;
    height: 100% !important;
    resize: none;
    border: none;
}
#component-template-advanced >>> .el-alert {
    overflow-y: scroll;
    align-items: start;
    white-space: pre;
    font-family: monospace;
    padding: 14px 16px 14px 35px;
}
#component-template-advanced >>> .el-alert__icon {
    position: fixed;
    margin-left: -25px;
}

#component-template-style {
    margin-left: 25px;
}

#component-template-style >>> textarea {
    width: 90%;
    min-height: 60px !important;
    font-family: monospace;
}
</style>
