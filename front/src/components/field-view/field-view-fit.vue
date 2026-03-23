<script>
import app from "../../conf/app";
import DataSample from "../../utils/data-sample";
import { execAfterPause } from "../../utils/frequency-limit";
import FontSize from "../../utils/font-size";
import VueTemplate from "../../utils/vue-template";
import fieldViewJira from "../field-view/field-view-jira.vue";
const SIZE_MIN = app?.dynamicComponent?.minFontSize;
const SIZE_MAX = app?.dynamicComponent?.maxFontSize;
const ABACUS_RATIO = [
    0.085, 0.1, 0.12, 0.17, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.7, 1, 1.1, 1.5, 2,
    2.25, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 24, 50,
];
const ARBITRARY_SIZE = 1000;
const COEFF = 1; // 0.95

export default {
    name: "FieldViewFit",

    data() {
        return {
            fieldViewFit_abacus: this.abacus || [],
            fieldViewFit_intersectionObserver: null,
            fieldViewFit_resizeObserver: null,
            fieldViewFit_resizeSize: null,
            fieldViewFit_debug: null, // TODO: remove after debug
        };
    },
    mixins: [fieldViewJira],

    watch: {
        abacus: {
            deep: true,
            handler() {
                this.fieldViewFit_abacus = this.abacus;
            },
        },
        "$store.state.app.objectsInBoard.event"(event) {
            if (event.name === "refreshAbacus") {
                const data = {
                    model: this.widget.model,
                    abacus: this.fieldViewFit_onContentChangedFromFieldView({
                        reply: true,
                    }),
                };
                if (this.isProperty) {
                    data.value = this.value;
                }
                this.$emit("elFormBlur", data);
            }
        },
    },

    mounted() {
        this.fieldViewFit_resizeObserver = new ResizeObserver((evt) => {
            const { width, height } = evt[0].contentRect;
            this.fieldViewFit_resizeSize = { width, height };
        }).observe(this.$el);

        if (!this.isFullForm && !this.abacus && this.value) {
            this.fieldViewFit_intersectionObserver = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        this.fieldViewFit_intersectionObserver.unobserve(
                            this.$el
                        );
                        this.$nextTick(() => {
                            const data = {
                                model: this.widget.model,
                                abacus: this.fieldViewFit_onContentChangedFromFieldView(
                                    { reply: true }
                                ),
                            };
                            if (this.isProperty) {
                                data.value = this.value;
                            }
                            this.$emit("elFormBlur", data);
                        });
                    }
                },
                {
                    threshold: 0.1,
                }
            );
            this.fieldViewFit_intersectionObserver.observe(this.$el);
        }
    },
    beforeDestroy() {
        if (this.fieldViewFit_intersectionObserver) {
            this.fieldViewFit_intersectionObserver.unobserve(this.$el);
        }
        if (this.fieldViewFit_resizeObserver) {
            this.fieldViewFit_resizeObserver.unobserve(this.$el);
        }
    },

    computed: {
        // Does the fit be made on width & height or fit only
        fieldViewFit_fitWidthOnly() {
            return this.fieldViewFit_fitWidthOnly_(this);
        },
        fieldViewFit_fitWidthAndHeight() {
            return this.fieldViewFit_fitWidthAndHeight_(this);
        },

        // Style & content of sandbox used for font-size computation
        fieldViewFit_padding() {
            return this.fieldViewFit_padding_(this);
        },
        fieldViewFit_sandboxContent() {
            return this.fieldViewFit_sandboxContent_(this);
        },

        // Font-size & line-height of current component
        fieldViewFit_style() {
            const ignoredOnlyNeededForReactivity1 =
                this.fieldViewFit_resizeSize;
            const ignoredOnlyNeededForReactivity2 = this.fieldViewFit_abacus;
            try {
                if (!this.$el) {
                    throw new Error("$el is null");
                }
                if (this.fontSize) {
                    // Modeler may set static font-size with an attribute
                    return {
                        fontSize: this.fontSize,
                    };
                }

                const padding =
                    this.widget.type === "fit_text"
                        ? {
                              h:
                                  parseFloat(
                                      window
                                          .getComputedStyle(this.$el, null)
                                          .getPropertyValue("padding-left")
                                  ) +
                                  parseFloat(
                                      window
                                          .getComputedStyle(this.$el, null)
                                          .getPropertyValue("padding-right")
                                  ),
                              v:
                                  parseFloat(
                                      window
                                          .getComputedStyle(this.$el, null)
                                          .getPropertyValue("padding-top")
                                  ) +
                                  parseFloat(
                                      window
                                          .getComputedStyle(this.$el, null)
                                          .getPropertyValue("padding-bottom")
                                  ),
                          }
                        : this.fieldViewFit_padding;

                const width = this.fieldViewFit_resizeSize.width - padding.h;
                const height = this.fieldViewFit_resizeSize.height - padding.v;
                const ratio = width / height;

                const nearestAbacus = this.fieldViewFit_abacus
                    .map((abacusItem) => ({
                        ratio: abacusItem.ratio,
                        fontSize: abacusItem.fontSize,
                        usedHeight: abacusItem.usedHeight,
                        ratioGap: abacusItem.ratio / ratio,
                        ratioSort:
                            ratio > abacusItem.ratio
                                ? ratio / abacusItem.ratio
                                : abacusItem.ratio / ratio, // estimate nearest ratio in the abacus
                    }))
                    .sort((a, b) => a.ratioSort - b.ratioSort)[0];
                if (!nearestAbacus) {
                    throw new Error("nearestAbacus is null");
                }

                let fontSize = nearestAbacus.fontSize * width;
                fontSize =
                    COEFF *
                    (this.fieldViewFit_fitWidthOnly
                        ? Math.min(fontSize, height / 1.15)
                        : fontSize);
                if (fontSize > SIZE_MAX) {
                    fontSize = SIZE_MAX;
                }

                // Not optimized font-size sync beetween all "fitWidthOnly" fields of an object
                // TODO: improve when this behaviour is validated
                if (this.fieldViewFit_fitWidthOnly) {
                    this.$emit("syncFontSize", {
                        key: this.$vnode.key,
                        value: this.value ? fontSize : Infinity,
                    });
                    if (this.syncFontSize && this.syncFontSize < fontSize) {
                        fontSize = this.syncFontSize;
                    }
                }

                return {
                    fontSize: `${fontSize}px`, // Set font-size, based on width
                    // lineHeight: this.fieldViewFit_fitWidthOnly ? '0' : 1.5
                    lineHeight: this.fieldViewFit_fitWidthOnly
                        ? "0"
                        : `${Math.max(
                              1,
                              Math.min(
                                  (1 * nearestAbacus.ratioGap) / // adjust the gap between real ratio and the best one found in the abacus
                                      nearestAbacus.usedHeight, // adjust original ratio height use
                                  1.3
                              )
                          )}`,
                };
            } catch {
                return {
                    lineHeight: this.fieldViewFit_fitWidthOnly ? "0" : "1em",
                };
            }
        },
    },
    methods: {
        // Rules of computation for cached computed
        fieldViewFit_fitWidthOnly_(that) {
            if (that.widget.type === "select") {
                return !that.widget.options.multiple;
            } else {
                return [
                    "input",
                    "number",
                    "radio",
                    "checkbox",
                    "time",
                    "date",
                    "rate",
                ].includes(that.widget.type);
            }
        },
        fieldViewFit_fitWidthAndHeight_(that) {
            return !this.fieldViewFit_fitWidthOnly_(that);
        },
        fieldViewFit_padding_(that) {
            switch (that.widget.type) {
                case "input":
                    return { h: 0, v: 0 };
                case "textarea":
                    return { h: 4, v: 0 };
                case "number":
                    return { h: 0, v: 0 };
                case "radio":
                    return { h: 36 * that.widget.options.options.length, v: 0 };
                case "checkbox":
                    return { h: 36 * that.widget.options.options.length, v: 0 };
                case "time":
                    return { h: 0, v: 0 };
                case "date":
                    return { h: 0, v: 0 };
                case "rate":
                    return { h: 0, v: 0 };
                case "color":
                    return {
                        /* Not fitted */
                    };
                case "select":
                    return { h: 0, v: 0 };
                case "switch":
                    return {
                        /* Not fitted */
                    };
                /* case 'slider':
                    return { /* Not fitted  }*/
                case "imgupload":
                    return {
                        /* Not fitted */
                    };
                case "editor":
                    return {
                        /* TODO or not fitted? */
                    };
                case "metaTag":
                    return {
                        /* TODO */
                    };
                case "computed":
                    return { h: 4, v: 0 };
                default:
                    return {
                        /* TODO */
                    };
            }
        },
        fieldViewFit_sandboxContent_(that) {
            switch (that.widget.type) {
                case "input":
                    return `${that.value}_X`;
                case "textarea":
                    return `${that.value} `;
                case "number":
                    return `${that.value}_X`;
                case "radio":
                    return that.widget.options.options
                        .map((x) =>
                            that.widget.options?.showLabel
                                ? x.label || x.value
                                : x.value
                        )
                        .join("");
                case "checkbox":
                    return that.widget.options.options
                        .map((x) =>
                            that.widget.options?.showLabel
                                ? x.label || x.value
                                : x.value
                        )
                        .join("");
                case "time":
                    return `XXX_${that.value}_XXX`;
                case "date":
                    return `XXX_${that.value}_XXX`;
                case "rate":
                    return "X_".repeat(that.widget.options.max);
                case "color":
                    return ""; /* Not fitted */
                case "select": {
                    const { componentId } = this.$store.getters[
                        "positionAlive/byId"
                    ](this.positionId);
                    let options = [];
                    if (
                        componentId == app.visualWorldComponent.VW_jira_us_model
                    ) {
                        options = that.optionsSelect;
                    } else {
                        options = that.widget.options.options;
                    }
                    return options
                        .filter(
                            (x) =>
                                x.value === that.value ||
                                that.value.includes(x.value)
                        )
                        .map(
                            (x) =>
                                `X_${
                                    that.widget?.options?.showLabel
                                        ? x.label || x.value
                                        : x.value
                                }_X`
                        )
                        .join(" | ");
                }
                case "switch":
                    return ""; /* Not fitted */
                /*case 'slider':
                    return ''  Not fitted */
                case "imgupload":
                    return ""; /* Not fitted */
                case "editor":
                    return ""; /* TODO or not fitted? */
                case "metaTag":
                    return ""; /* TODO */
                case "computed":
                    return `${that.value} `;
                default:
                    return that.value;
            }
        },

        // Current component's value has changed
        fieldViewFit_onContentChangedFromFieldView({ reply }) {
            if (this.widget.type === "textarea" && !reply) {
                return execAfterPause(
                    `fieldViewFit_onContentChangedFromFieldView${this.positionId}_${this.fieldId}`,
                    200 /* ms*/,
                    () => {
                        return this.fieldViewFit_computeFieldAbacus();
                    }
                ).catch(() => {} /* Dont catch rejection of execAfterPause */);
            } else {
                return this.fieldViewFit_computeFieldAbacus();
            }
        },
        fieldViewFit_onContentChangedFromObjectData() {
            if (this.widget.type === "textarea") {
                return execAfterPause(
                    `fieldViewFit_onContentChangedFromObjectData_${this.positionId}_${this.fieldId}`,
                    200 /* ms*/,
                    () => {
                        return this.fieldViewFit_computeFieldAbacus();
                    }
                ).catch(() => {} /* Dont catch rejection of execAfterPause */);
            } else {
                return this.fieldViewFit_computeFieldAbacus();
            }
        },
        fieldViewFit_computeFieldAbacus(that) {
            try {
                if (!that) {
                    that = this;
                }

                const newAbacus = (
                    that.fieldViewFit_fitWidthAndHeight ? ABACUS_RATIO : [1]
                ).map((ratio) => {
                    const { fontSize, usedHeight } = FontSize.fit({
                        text: that.fieldViewFit_sandboxContent,
                        width: ARBITRARY_SIZE,
                        height: that.fieldViewFit_fitWidthAndHeight
                            ? ARBITRARY_SIZE / ratio
                            : null,
                    });
                    return {
                        ratio,
                        usedHeight,
                        fontSize: fontSize / ARBITRARY_SIZE,
                    };
                });

                that.fieldViewFit_abacus = newAbacus; // Size re-computed by front will be applyed even before API reply
                return newAbacus;
            } catch {
                /* not catched */
            }
        },

        // "Public" util called by ComponentEdit: compute static-text font-size abacus on compoent create or update
        fieldViewFit_computeStaticAbacusTemplate(templateVue) {
            // Mount the sandbox that is necessary to computeAbacusItem, make the computation in a callback, then remove the sandbox
            function mountAbacusSandbox(node, html, css, cb) {
                const wrapper = document.createElement("div"); // TODO: apply components'CSS rules
                wrapper.style.opacity = 0;
                wrapper.style.zIndex = -9999999;
                wrapper.style.pointerEvents = "none";

                const sandbox = document.createElement("div");
                if (html) sandbox.innerHTML = html;
                if (css) Object.assign(sandbox.style, css);
                sandbox.classList.add("sandbox");

                wrapper.appendChild(sandbox);
                node.appendChild(wrapper);

                let out;
                try {
                    out = cb(wrapper, sandbox);
                } catch {
                    /* not catched */
                }

                wrapper.remove();
                return out;
            }

            // Compute best font-size to make the sandbox fit the wrapper
            function computeAbacusItem({
                wrapper,
                sandbox,
                fitWidthOnly,
                fitWidthAndHeight,
            }) {
                let fontSize, wrapperHeight;
                try {
                    if (!wrapper) {
                        throw new Error("NOT_RENDERED");
                    }

                    wrapperHeight = wrapper.offsetHeight - 4; // 2 * 2px border on top & bottom
                    if (
                        !sandbox ||
                        !sandbox.innerText ||
                        !sandbox.innerText.length
                    ) {
                        fontSize = wrapperHeight;
                    }

                    // Resize to fill width (input)
                    else if (fitWidthOnly) {
                        const sizeMin = 0;
                        const sizeMax = wrapperHeight;

                        fontSize = parseFloat(
                            window
                                .getComputedStyle(sandbox, null)
                                .getPropertyValue("font-size")
                        );
                        for (let k = 0; k < 3; k++) {
                            const newFontSize =
                                (fontSize * wrapper.offsetWidth) /
                                sandbox.offsetWidth;
                            if (newFontSize < sizeMin) {
                                fontSize = sizeMin;
                                break;
                            } else if (newFontSize > sizeMax) {
                                fontSize = sizeMax;
                                break;
                            } else {
                                sandbox.style.fontSize = `${newFontSize}px`;
                                fontSize = newFontSize;
                            }
                        }
                    }

                    // Resize to fill the height (textarea)
                    else if (fitWidthAndHeight) {
                        let sizeMin = 0;
                        let sizeMax = wrapperHeight;
                        fontSize = (sizeMax + sizeMin) / 2;
                        for (let k = 0; k < wrapperHeight; k++) {
                            // loop count ~ Math.log2( wrapperHeight )

                            sandbox.style.fontSize = `${fontSize}px`;

                            // Replace bounds
                            if (sandbox.scrollWidth - wrapper.clientWidth > 0) {
                                sizeMax = fontSize;
                            } else if (wrapperHeight > sandbox.scrollHeight) {
                                sizeMin = fontSize;
                            } else {
                                sizeMax = fontSize;
                            }

                            // Break if it has converged enough (1px or 1%)
                            if (
                                sizeMax - sizeMin < 1 ||
                                sizeMax - sizeMin < 0.01 * sizeMax
                            ) {
                                fontSize = sizeMin;
                                break;
                            }

                            // Approximate a right size for next try
                            // Probably nothing is more efficient than dichotomy since function fontSize=>sandboxHeight isnt continious (because of line breaks)
                            fontSize = (sizeMax + sizeMin) / 2;
                        }
                    }
                } catch (e) {
                    fontSize = SIZE_MIN;
                    sandbox.style.fontSize = `${fontSize}px`; // ease debug
                }
                return {
                    fontSize: Number.parseFloat(fontSize.toPrecision(4)),
                    usedHeight: fitWidthAndHeight
                        ? Number.parseFloat(
                              (
                                  sandbox.scrollHeight / wrapperHeight
                              ).toPrecision(4)
                          )
                        : undefined,
                };
            }

            // Extract static content to be fitted from template
            const compiledTemplate = VueTemplate.compile(templateVue);
            const infos = compiledTemplate.infos.filter(
                (info) => info.tag === "fit"
            );
            const templates = {};
            for (const info of infos) {
                templates[info.hash] = info.text;
            }

            // Create the sandbox used to compute every abacus entries
            return mountAbacusSandbox(
                document.body,
                null,
                null,
                (wrapper, sandbox) => {
                    const abacus = {};

                    // Loop on contents
                    for (let template in templates) {
                        abacus[template] = [];
                        // sandbox.innerHTML = `<div${ templates[ template ].attr }>${ templates[ template ].content }</div>` // Set the content of the sandbox
                        sandbox.innerHTML = `<div>${templates[template]}</div>`; // Set the content of the sandbox
                        for (let ratio of ABACUS_RATIO) {
                            // Set the size of the sandbox, based on the ratio
                            wrapper.style.width = `${ARBITRARY_SIZE}px`;
                            wrapper.style.height = `${
                                ARBITRARY_SIZE / ratio
                            }px`;

                            // Format return
                            const computedFontSize = computeAbacusItem({
                                wrapper,
                                sandbox,
                                fitWidthAndHeight: true,
                            });
                            abacus[template].push({
                                ratio,
                                fontSize:
                                    computedFontSize.fontSize / ARBITRARY_SIZE,
                                usedHeight: computedFontSize.usedHeight,
                            });
                        }
                    }

                    return abacus;
                }
            );
        },

        // "Public" util called by ComponentEdit: compute sample-data fields' font-size abacus on compoent create or update
        fieldViewFit_computeFieldAbacusTemplate(fields) {
            const abacus = {};
            for (let field of fields) {
                field.value = DataSample(field.widget);
                abacus[field.widget.model] =
                    this.fieldViewFit_computeFieldAbacus({
                        fieldViewFit_fitWidthOnly:
                            this.fieldViewFit_fitWidthOnly_(field),
                        fieldViewFit_fitWidthAndHeight:
                            this.fieldViewFit_fitWidthAndHeight_(field),
                        fieldViewFit_sandboxContent:
                            this.fieldViewFit_sandboxContent_(field),
                    });
            }
            return abacus;
        },
    },
};
</script>
