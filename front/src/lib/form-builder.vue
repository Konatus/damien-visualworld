<template>
    <MakingForm ref="making-form" class="making-form" style="height: 500px" />
</template>

<script>
import Vue from "vue";

import VueEditor from "vue2-editor";
Vue.use(VueEditor);

import { MakingForm } from "form-making";
import "form-making/dist/FormMaking.css";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

export default {
    name: "FormMaker",

    components: {
        MakingForm,
    },

    props: {
        value: String,
    },
    watch: {
        value(newVal, oldVal) {
            if (oldVal && oldVal.length < 3) {
                // only set value if component is empty
                this.set();
            }
        },
    },

    created() {
        let thisComponent = this;
        MakingForm.watch.widgetForm = {
            deep: true,
            handler: function (val) {
                thisComponent.emit(val);
            },
        };
    },
    mounted() {
        this.set();
    },

    methods: {
        set() {
            if (this.value && this.value.length > 2) {
                const parsedValue = JSON.parse(this.value);

                // Set default config
                parsedValue.config = {
                    labelPosition: "top",
                    labelWidth: 100,
                    size: "small",
                };

                if (parsedValue && parsedValue.list) {
                    this.$refs["making-form"].setJSON(parsedValue);
                }
            }
        },
        emit(value) {
            const string = JSON.stringify(value, function (k, v) {
                if (v === Infinity) {
                    return "Infinity";
                }
                if (v === -Infinity) {
                    return "-Infinity";
                }
                return v;
            });
            this.$emit("input", string);
        },
    },
};
</script>

<style>
.making-form {
    display: block;
}
.making-form .btn-bar {
    display: none;
}
.making-form footer.el-footer {
    display: none;
}
</style>
