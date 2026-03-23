/**
 * Build the Vue component
 */
const DELAY_BEFORE_LOST_FOCUS = 200; /* ms */
import jsonata from "jsonata";
import isEqual from "lodash.isequal";
import stringToHash from "./string-to-hash.js";
import app from "../conf/app.js";
import css from "./css-parser.js";
import VueTemplate from "../utils/vue-template.js";
import ChartJs from "../lib/chart-js.vue";
import DrawingView from "../components/drawing-view/drawing-view.vue";
import FieldView from "../components/field-view/field-view.vue";
export default {
    install(Vue) {
        Vue.componentBuild = async (component) => {
            const hash = stringToHash(JSON.stringify(component.data));
            component.name =
                component._id === app.visualWorldComponent.VW_default
                    ? `dynamic-component-${component._id}`
                    : `dynamic-component-${component._id}-${hash}`;

            // Per field schema...
            const VW_schema = component.schema;

            // Computed used inside HTML template (inside a v-for, for example)
            let computed = {};
            try {
                for (let model in VW_schema) {
                    computed[model] = {
                        get: function () {
                            if (VW_schema[model].type === "imgupload") {
                                return this.VW_data[model] &&
                                    this.VW_data[model][0]
                                    ? this.VW_data[model][0].url
                                    : null;
                            } else {
                                return this.VW_data[model];
                            }
                        },
                        set(value) {
                            // property changed by template but not field-view (ex: @click="myProperty=!myProperty")
                            this.VW_onInput({ model: model, value }, true);
                        },
                    };
                }

                computed.CALC = function () {
                    return this.VW_data.CALC;
                };
                computed.VW = function () {
                    return this.VW_data?.VW;
                };
            } catch {
                /* not catched */
            }

            // Style of the component
            try {
                component.parsedStyle = css.parse(
                    component.data.styleCss || ""
                );
                computed.VW_style = function () {
                    const style = {};
                    const VW = this.VW_data?.VW;
                    if (VW?.backgroundColor) {
                        style.backgroundColor = VW.backgroundColor;
                    }
                    if (VW?.outlineColor) {
                        style.outlineColor = VW.outlineColor;
                    }
                    if (VW?.color) {
                        style.color = VW.color;
                    }
                    style.fontSize = `${this.VW_syncFontSize}px`;
                    return Object.assign(style, component.parsedStyle);
                };
            } catch {
                /* not catched */
            }

            try {
                computed.VW_focus = function () {
                    for (let field in this.VW_focuses) {
                        if (this.VW_focuses[field]) {
                            return true;
                        }
                    }
                    return false;
                };
            } catch {
                /* not catched */
            }

            // User-defined watchers
            let watch = {};
            try {
                const watchers = JSON.parse(component.data.watch);
                for (let watcher of watchers) {
                    watch[watcher.when] = {
                        deep: true,
                        handler(newV, oldV) {
                            if (!isEqual(newV, oldV)) {
                                const givenExpression = jsonata(watcher.given);
                                if (givenExpression.evaluate(this)) {
                                    const thenExpression = jsonata(
                                        watcher.thenValue
                                    );
                                    this.VW_onInput(
                                        {
                                            model: watcher.thenKey,
                                            value: thenExpression.evaluate(
                                                this
                                            ),
                                        },
                                        true
                                    );
                                }
                            }
                        },
                    };
                }
            } catch {
                /* not catched */
            }

            // Template to build
            const VW_fieldStyle = component.data.templateGridStackStyle;
            const templateGridStack = Object.assign(
                {
                    grid: [],
                    colCount: 12,
                    rowCount: 1,
                },
                JSON.parse(component?.data?.templateGridStack || "{}")
            );
            let k = -1;
            let template = component.data.templateUseHtml
                ? VueTemplate.splitPipe(
                      component.data.templateHtml,
                      (content, attr) => {
                          // eg: {{ toto |  fontSize='14px' }}
                          if (VW_schema[content]) {
                              // found property
                              k++;
                              return `<field-view
                            key="${content}_${k}"
                            :widget="VW_schema.${content}"
                            :models="VW_data"
                            :objectId="VW_objectId"
                            :x="${k}"
                            :positionId="VW_positionId"
                            @elFormChange="VW_onInput( $event, false )"
                            @elFormBlur="VW_onInput( $event, true )"
                            :focus="VW_focus"
                            @focus="VW_onFocus( '${content}', $event )"
                            :abacus="VW_abacus?.${content} || VW_componentAbacus?.${content}"
                            :syncFontSize="VW_syncFontSize"
                            @syncFontSize="VW_onSyncFontSize"
                            ${attr}
                            />`;
                          } else {
                              // computed & other
                              return `{{ ${content} }}`; // TODO: remove when computed properties (jsonata or blockly) are available
                          }
                      }
                  )
                : templateGridStack.grid
                      .map((field) => {
                          const key = `${field.fieldId}_${field.x}_${field.y}_${field.w}_${field.h}`;
                          return `<field-view
                        key="${key}"
                        :widget="VW_schema['${field.fieldId}'] || { type: 'computed', model:'${key}' }"
                        :models="VW_data"
                        :objectId="VW_objectId"
                        :positionId="VW_positionId"
                        :fieldStyle="VW_fieldStyle['${field.id}'] || VW_fieldStyle['${field.fieldId}']"
                        :x="${field.x}" :y="${field.y}" :w="${field.w}" :h="${field.h}"
                        @elFormChange="VW_onInput( $event, false )"
                        @elFormBlur="VW_onInput( $event, true )"
                        :focus="VW_focus"
                        @focus="VW_onFocus( '${field.fieldId}', $event )"
                        :abacus="VW_abacus?.['${key}'] || VW_abacus?.['${field.fieldId}'] || VW_componentAbacus?.['${field.fieldId}']"
                        :syncFontSize="VW_syncFontSize"
                        @syncFontSize="VW_onSyncFontSize"
                        />`;
                      })
                      .join("");
            template = `<div
                        style="display: ${
                            component.data.templateUseHtml ? "unset" : "grid"
                        };
                        overflow: hidden;
                        grid-auto-columns: ${
                            component.data.templateUseHtml
                                ? "unset"
                                : 100 / templateGridStack.colCount + "%"
                        };
                        grid-auto-rows:    ${
                            component.data.templateUseHtml
                                ? "unset"
                                : 100 / templateGridStack.rowCount + "%"
                        };"
                        :style="VW_style"
                        class="el-form-wrapper ${
                            component.data.templateUseHtml
                                ? "component-html"
                                : "component-grid"
                        }"
                        >
                            ${template}
                        </div>`.replace(/\s+/gi, " ");

            // Build the component
            try {
                const compiledTemplate = VueTemplate.compile(template);
                if (compiledTemplate?.errors?.length) {
                    throw compiledTemplate.errors;
                }

                Vue.component(
                    component.name,
                    {
                        render: compiledTemplate.render,
                        staticRenderFns: compiledTemplate.staticRenderFns,
                        components: {
                            // TODO: set only necessary components
                            FieldView,
                            ChartJs,
                            DrawingView,
                        },
                        props: {
                            VW_data: Object,
                            VW_abacus: Object,
                            VW_objectId: String,
                            VW_positionId: String,
                        },
                        inject: ["$view"],
                        computed,
                        data() {
                            return {
                                VW_schema,
                                VW_fieldStyle,
                                VW_focuses: {},
                                VW_componentAbacus:
                                    component.data?.fitTextAbacus || {},
                                VW_syncFontSizes: {},
                                VW_syncFontSize: null,
                            };
                        },
                        methods: {
                            // Immediately set focus
                            // wait a short time before removing focus (wait if another field got the focus)
                            VW_onFocus(id, evt) {
                                if (evt) {
                                    Vue.set(this.VW_focuses, id, true);
                                } else {
                                    setTimeout(() => {
                                        Vue.set(this.VW_focuses, id, false);
                                    }, DELAY_BEFORE_LOST_FOCUS);
                                }
                            },

                            VW_onInput(data, reply) {
                                this.$emit("input", { data, reply });
                            },

                            // Not optimized font-size sync beetween all "fitWidthOnly" fields of an object
                            // TODO: improve when this behaviour is validated
                            VW_onSyncFontSize({ key, value }) {
                                if (this.VW_syncFontSizes[key] != value) {
                                    this.VW_syncFontSizes[key] = value;

                                    let res = app.board.size.width;
                                    for (let key in this.VW_syncFontSizes) {
                                        if (res > this.VW_syncFontSizes[key]) {
                                            res = this.VW_syncFontSizes[key];
                                        }
                                    }
                                    if (
                                        this.VW_syncFontSize != res &&
                                        0 < res &&
                                        res < app.board.size.width
                                    ) {
                                        this.VW_syncFontSize = res;
                                    }
                                }
                            },
                        },
                    },
                    { hash }
                );
            } catch (e) {
                component.error = e;
            }
        };
    },
};
