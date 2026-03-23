<script>
import AsyncValidator from "async-validator"; // Element-ui's validator
import jsonDeepCopy from "../../utils/json-deep-copy";
export default {
    name: "FieldViewData",

    data() {
        return {
            fieldViewData_hasBeenRequestedForFocus: false,
            fieldViewData_touchStartEvent: null,
            fieldViewData_resetValue: null,
            fieldViewData_showPopReset: false,
            fieldViewData_errors: undefined,
        };
    },

    computed: {
        // Async validator for current field
        fieldViewData_validator() {
            if (!this?.widget?.rules || !this.widget.rules.length) {
                return;
            }
            return new AsyncValidator({
                [this.widget.model]: this.widget.rules,
            });
        },

        fieldViewData_isValid() {
            return !this.fieldViewData_errors;
        },
    },
    watch: {
        "$store.state.app.objectsInBoard.event"(event) {
            if (
                event.name === "fieldViewData_showPopReset" &&
                this.$parent.$refs["fieldView"]
            ) {
                this.fieldViewData_onBlur();
            }
        },
    },
    mounted() {
        if (this.$parent.$refs["fieldView"]) {
            this.fieldViewData_doValid({ value: this.value });
        }
    },

    methods: {
        // On focus, by double-tap or double-click, save current value
        fieldViewData_onDblTap(evt) {
            if (
                evt.timeStamp - this.fieldViewData_touchStartEvent?.timeStamp <
                400
            ) {
                // TODO: move double-tap delay into a config file
                this.fieldViewData_onDblClick(evt);
            }
            this.fieldViewData_touchStartEvent = evt;
        },
        fieldViewData_onDblClick(evt) {
            if (
                !this.$store.getters[`connectionMe/isGrantedFor`](
                    ["object/update"],
                    this.$view
                )
            ) {
                return;
            }
            this.fieldViewData_hasBeenRequestedForFocus = true;
            (evt.target || evt.srcElement).focus();
        },
        fieldViewData_onFocus() {
            try {
                if (this.fieldViewData_isValid) {
                    this.fieldViewData_resetValue = jsonDeepCopy(
                        this.models[this.widget.model]
                    );
                }
            } catch {
                this.fieldViewData_resetValue = null;
            }
            this.$emit("focus", true);
        },

        // Data changes: input is live, blur is at focus lost
        async fieldViewData_onInput() {
            const valid = await this.fieldViewData_doValid({
                value: this.value,
            });
            const abacus = this.fieldViewFit_onContentChangedFromFieldView({
                reply: false,
            });
            const abacusIsPromise =
                typeof abacus === "object" && typeof abacus.then === "function";
            if (valid) {
                this.fieldViewData_showPopReset = false;
                if (this.isProperty) {
                    if (!abacusIsPromise) {
                        this.$emit("elFormChange", {
                            model: this.widget.model,
                            value: this.value,
                            abacus,
                        });
                    } else {
                        this.$emit("elFormChange", {
                            model: this.widget.model,
                            value: this.value,
                        });
                        abacus
                            .then((abacus) => {
                                if (abacus) {
                                    this.$emit("elFormChange", {
                                        model: this.widget.model,
                                        abacus,
                                    });
                                }
                            })
                            .catch(() => {
                                /* nothing to do */
                            });
                    }
                }
            }
        },
        async fieldViewData_onBlur(evt) {
            const valid = await this.fieldViewData_doValid({
                value: this.value,
            });
            if (valid) {
                this.fieldViewData_hasBeenRequestedForFocus = false;
                this.fieldViewData_showPopReset = false;
                const data = {
                    model: this.widget.model,
                    abacus: this.fieldViewFit_onContentChangedFromFieldView({
                        reply: true,
                    }), // never a promise when reply
                };
                this.$emit("focus", false);
                if (this.isProperty) {
                    data.value = this.value;
                }
                this.$emit("elFormBlur", data);
            } else {
                this.fieldViewData_hasBeenRequestedForFocus = true;
                if (evt) {
                    evt.srcElement?.focus();
                }
                this.fieldViewData_showPopReset = true;
            }

            // Case of select init
            if (
                ["select"].includes(this.widget?.type) &&
                evt?.length == 0 &&
                !this.models[this.widget.model]
            ) {
                this.fieldViewData_showPopReset = false;
            }
        },
        fieldViewData_onChange(currentValue, oldValue) {
            if (currentValue && currentValue != oldValue) {
                this.fieldViewData_onBlur();
            }
        },

        // Exit the form via escape or submit
        fieldViewData_onEscape() {
            this.fieldViewData_doReset();
            this.fieldViewData_doBlur();
        },
        fieldViewData_onSubmit() {
            this.fieldViewData_doBlur();
        },
        fieldViewData_doReset() {
            this.fieldViewData_showPopReset = false;
            this.fieldViewData_errors = undefined;
            this.value = this.fieldViewData_resetValue;
        },
        fieldViewData_doBlur() {
            const blur = (component) => {
                for (let child of component?.$children || []) {
                    blur(child);
                    if (child.blur) {
                        child.blur();
                    }
                }
            };
            blur(this);
        },

        // On input & blur events, determines whether a value is valid or not for current field
        async fieldViewData_doValid({ value }) {
            // Validation itself
            this.fieldViewData_errors = this.fieldViewData_validator
                ? await new Promise((resolve) => {
                      this.fieldViewData_validator.validate(
                          {
                              [this.widget.model]: value,
                          },
                          {
                              firstFields: false,
                          },
                          (errors) => {
                              resolve(errors);
                          }
                      );
                  })
                : undefined;
            return this.fieldViewData_isValid; //!this.fieldViewData_errors
        },
    },
};
</script>
