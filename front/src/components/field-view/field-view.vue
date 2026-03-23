<template>
    <form
        class="field-view el-form-item el-form-item__content"
        :class="{
            'not-static-fit': widget.type != 'fit_text',
            'is-full-form': isFullForm,
            'is-error': !fieldViewData_isValid,
            'el-form-item__content_disabled':
                widget && widget.options && widget.options.disabled,
        }"
        :style="style"
        :data-field-type="widget.type"
        @submit.prevent="fieldViewData_onSubmit"
        @keydown.esc="fieldViewData_onEscape"
    >
        <!-- Label -->
        <label v-if="isFullForm">
            {{ widget.name }}
        </label>

        <!-- Static fit text in html template <fit> -->
        <template v-if="widget.type == 'fit_text'">
            <slot />
        </template>

        <!-- Regular Vue Form Making fields -->
        <template v-else-if="widget.type == 'input'">
            <el-input
                v-if="
                    widget.options.dataType == 'number' ||
                    widget.options.dataType == 'integer' ||
                    widget.options.dataType == 'float'
                "
                v-model.number="value"
                type="number"
                size="medium"
                :placeholder="isFullForm ? widget.options.placeholder : ' '"
                :disabled="disabledFields"
                :tabindex="tabIndex"
                @touchstart.native="fieldViewData_onDblTap"
                @dblclick.native="fieldViewData_onDblClick"
                @focus="onFocus"
                @input="fieldViewData_onInput"
                @blur="onBlur"
            />
            <el-input
                v-else
                v-model="value"
                size="medium"
                :type="widget.options.dataType"
                :disabled="disabledFields"
                :placeholder="isFullForm ? widget.options.placeholder : ' '"
                :tabindex="tabIndex"
                @touchstart.native="fieldViewData_onDblTap"
                @dblclick.native="fieldViewData_onDblClick"
                @focus="onFocus"
                @input="fieldViewData_onInput"
                @blur="onBlur"
            />
        </template>
        <template v-else-if="widget.type == 'textarea'">
            <el-input
                type="textarea"
                :rows="5"
                v-model="value"
                size="medium"
                :disabled="disabledFields"
                :placeholder="isFullForm ? widget.options.placeholder : ' '"
                :tabindex="tabIndex"
                @touchstart.native="fieldViewData_onDblTap"
                @dblclick.native="fieldViewData_onDblClick"
                @focus="onFocus"
                @input="fieldViewData_onInput"
                @blur="onBlur"
            />
            <span class="fitty-sandbox" v-text="value"></span>
        </template>
        <template v-else-if="widget.type == 'number'">
            <el-input-number
                v-model="value"
                size="medium"
                :step="widget.options.step"
                :controls="isFullForm"
                :disabled="disabledFields"
                :min="
                    widget.options.min ? Number(widget.options.min) : -Infinity
                "
                :max="
                    widget.options.max ? Number(widget.options.max) : Infinity
                "
                :tabindex="tabIndex"
                @touchstart.native="fieldViewData_onDblTap"
                @dblclick.native="fieldViewData_onDblClick"
                @focus="onFocus"
                @input="fieldViewData_onInput"
                @blur="onBlur"
                @change="fieldViewData_onChange"
            />
        </template>
        <template v-else-if="widget.type == 'radio'">
            <el-radio-group
                v-model="value"
                size="mini"
                :disabled="disabledFields"
                :tabindex="tabIndex"
                @input="onBlur"
                @blur="onBlur"
            >
                <el-radio-button
                    v-for="(item, index) in widget.options.options"
                    :key="index"
                    :style="{ display: 'inline-block' }"
                    :label="item.value"
                    @touchstart.native="$event.target.click()"
                >
                    {{ widget.options.showLabel ? item.label : item.value }}
                </el-radio-button>
            </el-radio-group>
        </template>
        <template v-else-if="widget.type == 'checkbox'">
            <el-checkbox-group
                v-model="value"
                size="mini"
                :disabled="disabledFields"
                :tabindex="tabIndex"
                @input="onBlur"
                @blur="onBlur"
            >
                <el-checkbox-button
                    v-for="(item, index) in widget.options.options"
                    :key="index"
                    :style="{ display: 'inline-block' }"
                    :label="item.value"
                    @touchstart.native="$event.target.click()"
                >
                    {{ widget.options.showLabel ? item.label : item.value }}
                </el-checkbox-button>
            </el-checkbox-group>
        </template>
        <template v-else-if="widget.type == 'time'">
            <el-time-picker
                v-model="value"
                size="medium"
                :is-range="widget.options.isRange"
                :placeholder="isFullForm ? widget.options.placeholder : ' '"
                :start-placeholder="
                    isFullForm ? widget.options.startPlaceholder : ' '
                "
                :end-placeholder="
                    isFullForm ? widget.options.endPlaceholder : ' '
                "
                :readonly="widget.options.readonly"
                :disabled="disabledFields"
                :editable="widget.options.editable"
                :clearable="widget.options.clearable"
                :arrowControl="widget.options.arrowControl"
                :value-format="widget.options.format"
                :tabindex="tabIndex"
                @touchstart.native="fieldViewData_onDblTap"
                @dblclick.native="fieldViewData_onDblClick"
                @focus="onFocus"
                @input="fieldViewData_onInput"
                @blur="onBlur"
            />
        </template>
        <template v-else-if="widget.type == 'date'">
            <el-date-picker
                v-model="value"
                size="medium"
                :type="widget.options.type"
                :placeholder="isFullForm ? widget.options.placeholder : ' '"
                :start-placeholder="
                    isFullForm ? widget.options.startPlaceholder : ' '
                "
                :end-placeholder="
                    isFullForm ? widget.options.endPlaceholder : ' '
                "
                :readonly="widget.options.readonly"
                :disabled="disabledFields"
                :editable="widget.options.editable"
                :clearable="widget.options.clearable"
                :value-format="
                    widget.options.timestamp
                        ? 'timestamp'
                        : widget.options.format
                "
                :format="widget.options.format"
                :tabindex="tabIndex"
                @touchstart.native="fieldViewData_onDblTap"
                @dblclick.native="fieldViewData_onDblClick"
                @focus="onFocus"
                @input="fieldViewData_onInput"
                @blur="onBlur"
            />
        </template>
        <template v-else-if="widget.type == 'rate'">
            <el-rate
                v-model="value"
                size="medium"
                :max="widget.options.max"
                :disabled="disabledFields"
                :allow-half="widget.options.allowHalf"
                :tabindex="tabIndex"
                @input="onBlur"
                @blur="onBlur"
                @touchstart.native="$event.target.click()"
            />
        </template>
        <template v-else-if="widget.type == 'color'">
            <color-picker
                style="width: 100%"
                v-model="value"
                @input="fieldViewData_onInput"
            />
        </template>
        <template v-else-if="widget.type == 'select'">
            <el-select
                v-model="value"
                size="medium"
                :disabled="disabledFields"
                :multiple="widget.options.multiple"
                :clearable="widget.options.clearable"
                :placeholder="isFullForm ? widget.options.placeholder : ' '"
                :filterable="widget.options.filterable"
                :tabindex="tabIndex"
                @input="onBlur"
                @touchstart.native="$event.target.focus()"
            >
                <el-option
                    v-for="item in optionsSelect"
                    :key="item.value"
                    :value="item.value"
                    :label="widget.options.showLabel ? item.label : item.value"
                    :tabindex="tabIndex"
                />
            </el-select>
        </template>
        <template v-else-if="widget.type == 'switch'">
            <el-switch
                v-model="value"
                size="medium"
                :disabled="disabledFields"
                :tabindex="tabIndex"
                @input="onBlur"
                @blur="onBlur"
                @touchstart.native="
                    ($event) => {
                        $event.target.click();
                    }
                "
            />
        </template>

        <!--
            Read-only fields in editable content
            Editable fields in object-data pop-in
        -->
        <template v-else-if="widget.type == 'imgupload'">
            <image-picker
                v-if="isFullForm"
                v-model="value"
                :disabled="disabledFields"
                :postUrl="imgPostUrl"
                @input="onBlur"
            />
            <img
                v-else
                :src="imgGetUrl"
                srcset=""
                :alt="imgGetUrl"
                @error="srcValidImg = false"
            />
        </template>
        <template v-else-if="widget.type == 'editor'">
            <vue-editor
                v-if="isFullForm"
                v-model="value"
                :disabled="disabledFields"
                @input="fieldViewData_onInput"
            />
            <div v-else class="ql-editor ql-editor-readonly">
                <div v-sanitize-html="value" />
            </div>
        </template>

        <!-- Computed (.CALC) -->
        <template v-else-if="widget.type == 'computed'">
            <div style="width: 100%">{{ value }}</div>
        </template>

        <!-- Default, very simple rendering -->
        <template v-else>
            <span>{{ value }}</span>
        </template>

        <!-- Ask for reset if data isnt valid -->
        <el-alert
            v-if="fieldViewData_showPopReset"
            closable
            type="error"
            show-icon
            @close="fieldViewData_doReset"
        >
            <ul style="margin: 0">
                <li v-for="e in fieldViewData_errors" :key="e.message">
                    {{ e.message }}
                </li>
            </ul>
        </el-alert>
    </form>
</template>
<script>
import isEqual from "lodash.isequal";
import FieldViewData from "./field-view-data";
import FieldViewFit from "./field-view-fit";
import FieldViewJira from "./field-view-jira";
import FieldViewSpeech from "./field-view-speech";
import ColorPicker from "../color-picker/color-picker";
import ImagePicker from "../image-picker/image-picker";

import defaultBrokenImage from "../../assets/icons/broken-img.svg";
import urlLink from "../../assets/icons/url-link.svg";
import Url from "../../conf/url";
import { execAfterPause } from "../../utils/frequency-limit";
import app from "../../conf/app";

export default {
    name: "FieldView",
    mixins: [FieldViewData, FieldViewFit, FieldViewJira, FieldViewSpeech],
    components: {
        ColorPicker,
        ImagePicker,
    },
    props: {
        // Vue Form Making's field definition
        widget: {
            type: Object,
            default() {
                return { type: "computed" };
            },
        },

        // Object with all properties
        models: {
            type: Object,
            default() {
                return {};
            },
        },

        // Grid position
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
        w: {
            type: Number,
            default: 0,
        },
        h: {
            type: Number,
            default: 0,
        },

        // Style
        fieldStyle: {
            type: Object,
            default() {
                return {};
            },
        },
        fontSize: String,
        syncFontSize: Number,

        objectId: String,
        positionId: String,
        // Does that field or another one of the same object have the focus?
        focus: Boolean,

        // The full form is displayed in the only case of an object-data
        isFullForm: {
            type: Boolean,
            default: false,
        },

        abacus: Array,
    },
    inject: ["$view"],
    data() {
        return {
            srcValidImg: true,
            editField: false,
            value:
                this.widget.type !== "computed"
                    ? this.models[this.widget.model]
                    : this.fieldStyle.content ||
                      this.models.CALC?.[this.widget.model],
        };
    },
    watch: {
        fieldStyle: {
            deep: true,
            handler() {
                if (this.widget.type === "computed") {
                    this.modelChanged(this.models);
                }
            },
        },
        models: {
            deep: true,
            handler(newModels) {
                this.modelChanged(newModels);
            },
        },
    },
    methods: {
        async modelChanged(newModels) {
            const value =
                this.widget.type !== "computed"
                    ? newModels[this.widget.model]
                    : this.fieldStyle.content ||
                      newModels.CALC?.[this.widget.model];
            if (isEqual(this.value, value)) {
                // nothing to do: data has been modified by this component
            } else {
                // Modification wasnt made inside this component...

                // Blur & refresh value
                this.fieldViewData_doBlur();
                this.value = value;

                // Do we have to refresh dont-size?
                const object = this.$store.getters[`object/byId`](
                    this.objectId
                );
                if (!object?.me) {
                    this.$store.commit(`app/objectsInBoard/fieldEditedByUser`, {
                        fieldId: this.fieldId,
                        user: this.object.private.updating,
                        positionId: this.positionId,
                    });

                    if (!this.$el.disabled) {
                        this.editField = true;
                        this.$el.classList.add("field-edit");
                        execAfterPause(
                            `field-view_${this.fieldId}_${this.positionId}`,
                            app.delayBeforeHide,
                            () => {
                                this.editField = false;
                                this.$el.classList.remove("field-edit");
                            }
                        ).catch(() => {
                            /* nothing to do */
                        });
                    }
                } else {
                    // Update has been made in object-data by current session

                    // Let's recompute the font-size
                    if (!this.isFullForm) {
                        const abacus =
                            await this.fieldViewFit_onContentChangedFromObjectData(
                                {
                                    valid: this.fieldViewData_isValid,
                                }
                            );
                        if (abacus && this.isProperty) {
                            this.$emit("elFormBlur", {
                                // TODO: elFormChange or elFormBlur?
                                model: this.widget.model,
                                abacus,
                            });
                        }
                    }
                }
            }
        },
        onFocus(evt) {
            this.fieldViewData_onFocus(evt);
            this.fieldViewSpeech_onFocus(evt);
        },
        onBlur(evt) {
            this.fieldViewData_onBlur(evt);
            this.fieldViewSpeech_onBlur(evt);
        },
    },
    computed: {
        tabIndex() {
            return this.isFullForm ||
                this.focus ||
                this.fieldViewData_hasBeenRequestedForFocus
                ? "0"
                : "-1";
        },

        // Build an id based on field name & its position
        fieldId() {
            return `${this.widget?.model}_x${this.x}_y${this.y}_w${this.w}_h${this.h}`;
        },

        // Background, border and font colours
        // Bold, italic and/or underline
        // Grid position inside parent component
        style() {
            return this.isFullForm
                ? {}
                : {
                      color: this.fieldStyle.styleColor,
                      background: this.fieldStyle.styleBackgroundColor,
                      fontWeight: this.fieldStyle.styleFontWeightBold,
                      textDecoration:
                          this.fieldStyle.styleTextDecorationUnderline,
                      fontStyle: this.fieldStyle.styleFontStyleItalic,
                      gridColumn: `${1 + this.x}/${1 + this.x + this.w}`,
                      gridRow: `${1 + this.y}/${1 + this.y + this.h}`,
                      width: "100%",
                      maxHeight: "100%",
                      display: "flex" /* flexShrink: 0,  flexGrow: 1, */,
                      textAlign: ["left", "center", "right"].includes(
                          this.fieldStyle.styleTextAlign
                      )
                          ? this.fieldStyle.styleTextAlign
                          : "inherit",
                      alignItems: "center",
                      overflow: "hidden",
                      ...this.fieldViewFit_style,
                  };
        },

        // Source if this field is an image
        imgGetUrl() {
            if (!this.srcValidImg) return defaultBrokenImage;
            if (this.widget.type !== "imgupload") {
                return undefined;
            }
            try {
                return this.value[0].url;
            } catch {
                if (this.widget.model == "imgUrl") return urlLink;
                return defaultBrokenImage;
            }
        },
        imgPostUrl() {
            const key = `${this.objectId}_${this.widget?.model}`;
            const worldId = this.$view.worldId;
            return Url.img({ worldId, key });
        },
        object() {
            return this.$store.getters[`object/byId`](this.objectId);
        },

        isProperty() {
            return !["fit_text", "computed"].includes(this.widget.type);
        },

        disabledFields() {
            if (this.object?.data.jira_key || this.jiraFieldDisabled()) {
                return true;
            }
            return this.widget.options.disabled || this.editField;
        },
    },
    updated() {
        if (["select", "number"].includes(this.widget?.type)) {
            const inputs = this.$el.querySelectorAll("input");
            for (let input of inputs) {
                input.setAttribute("tabIndex", this.tabIndex);
            }
        }
    },
};
</script>
<style scoped>
/**
 * Look at syle merge strategy to split following rules into mixins
 * Many rules may be probably set with non scoped classes
 */
.field-view.is-full-form {
    margin-bottom: 14px;
}
.field-view.is-full-form >>> label {
    display: block;
    font-size: 14px;
    color: #171e36;
    font-weight: 600;
}
.field-view.is-full-form >>> textarea {
    overflow-y: hidden;
}

/**
  * field-view-validation
  */
.field-view.is-error {
    border-color: var(--color-error-input) !important;
}
.field-view.is-error >>> .el-input__inner:focus,
.field-view.is-error >>> .el-textarea__inner:focus,
.field-view.is-error >>> .el-form-item__content.focused {
    border: 1px solid var(--color-error-input);
    box-shadow: var(--shadow-inset-error);
}

.field-view:not(.is-full-form) .el-alert {
    position: fixed;
    margin-top: 35px;
    width: 320px;
    margin-left: -1px;
}

.field-view >>> .el-alert__description {
    margin: 0px !important;
    line-height: 12px;
    font-weight: normal;
}

/* Specific */
.ql-editor.ql-editor-readonly {
    min-height: unset;
}
.field-edit {
    border: 2px solid var(--color-error-input) !important;
}
.user-edit {
    display: none;
}
</style>
