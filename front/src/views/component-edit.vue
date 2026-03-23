<template>
    <component-form id="component-edit" :componentAsString="componentAsString">
        <template #header>
            {{ title }}

            <!-- Cancel & submit button, if displayed in a modal -->
            <div
                id="component-edit-buttons"
                class="buttons"
                v-if="displayedInModal"
            >
                <el-button
                    size="small"
                    ype="submit"
                    @click="onSubmit('form')"
                    class="el-button--success"
                >
                    <template v-if="componentId">
                        {{ $t("component_edit.submit.validate") }}
                    </template>
                    <template v-else>
                        {{ $t("component_edit.submit.create") }}
                    </template>
                </el-button>
                <el-button
                    class="vw-link-color"
                    size="small"
                    v-if="displayCancel"
                    @click="onCancel()"
                    >{{ $t("component_edit.submit.cancel") }}</el-button
                >
            </div>
        </template>
        <template #default>
            <el-tabs v-model="activeTab">
                <!-- Name & description -->
                <el-tab-pane
                    id="component-edit-definition"
                    name="component-edit-definition"
                    :label="$t('component_edit.tabs.definition')"
                >
                    <el-form
                        id="component-edit-definition-form"
                        ref="form"
                        :model="component"
                        :rules="rules"
                        @submit.prevent.native
                    >
                        <el-form-item
                            class="label"
                            prop="data.name"
                            :label="$t('component_edit.definition_form.name')"
                        >
                            <el-input
                                id="component-edit-definition-name"
                                type="text"
                                v-model="component.data.name"
                            />
                        </el-form-item>

                        <el-form-item
                            class="label"
                            prop="data.description"
                            :label="
                                $t('component_edit.definition_form.description')
                            "
                        >
                            <el-input
                                id="component-edit-definition-description"
                                type="textarea"
                                v-model="component.data.description"
                                autosize
                                :rows="4"
                            />
                        </el-form-item>
                    </el-form>
                </el-tab-pane>

                <!-- Properties -->
                <el-tab-pane
                    id="component-edit-properties"
                    name="component-edit-properties"
                    :label="$t('component_edit.tabs.properties')"
                >
                    <form-builder
                        v-if="activeTab === 'component-edit-properties'"
                        v-model="component.data.schemaForm"
                    />
                </el-tab-pane>

                <!-- Computed properties -->
                <el-tab-pane
                    id="component-edit-computed"
                    name="component-edit-computed"
                    :label="$t('component_edit.tabs.computed')"
                >
                    <component-computed
                        :componentAsString="componentAsString"
                        v-if="activeTab === 'component-edit-computed'"
                        v-model="component.data.computed"
                    />
                </el-tab-pane>

                <!-- Watcher -->
                <el-tab-pane
                    id="component-edit-watcher"
                    name="component-edit-watcher"
                    :label="$t('component_edit.tabs.watcher')"
                >
                    <component-watcher
                        :componentAsString="componentAsString"
                        v-if="activeTab === 'component-edit-watcher'"
                        v-model="component.data.watch"
                    />
                </el-tab-pane>

                <!-- Template -->
                <el-tab-pane
                    id="component-edit-template"
                    name="component-edit-template"
                    :label="$t('component_edit.tabs.template')"
                >
                    <component-template
                        v-if="activeTab === 'component-edit-template'"
                        v-model="component.data"
                    />
                </el-tab-pane>
            </el-tabs>
        </template>
    </component-form>
</template>
<script>
// Components
import ComponentComputed from "../components/component-computed/component-computed";
import ComponentForm from "../components/component-form/component-form";
import ComponentTemplate from "../components/component-template/component-template";
import ComponentWatcher from "../components/component-watcher/component-watcher";
import FormBuilder from "../lib/form-builder";

// Util
import FieldViewFit from "../components/field-view/field-view-fit.vue";
import merge from "lodash.merge";
import jsonDeepCopy from "../utils/json-deep-copy";

// Vue integration
export default {
    name: "ComponentEdit",

    components: {
        ComponentComputed,
        ComponentForm,
        ComponentTemplate,
        ComponentWatcher,
        FormBuilder,
    },

    props: {
        worldId: String,
        componentId: String,

        title: String,
        displayCancel: Boolean,
        submitCallback: Function,
    },

    // Descendant-provided properties of the view
    provide() {
        return {
            $view: this.$view,
        };
    },

    computed: {
        $view() {
            return {
                name: this.$options.name,
                worldId: this.worldId,
                componentId: this.componentId,
            };
        },

        // Component as defined in the store
        componentFromStoreAsString() {
            return JSON.stringify(
                this.$store.getters[`componentAlive/byId`](this.componentId)
            );
        },

        // Live definition of the component as string
        // used to provide current colours to component-form
        componentAsString() {
            return JSON.stringify(this.component);
        },

        // Is that component a child of a modal
        displayedInModal() {
            try {
                return this.$parent.$options._componentTag === "modal";
            } catch (e) {
                return false;
            }
        },
    },

    watch: {
        // Apply update made in store to current component
        // nb: current changes are preserved
        componentFromStoreAsString(value) {
            this.component = merge(JSON.parse(value), this.component);
        },
    },

    data() {
        const component = this.$store.getters[`componentAlive/byId`](
            this.componentId
        );
        return {
            activeTab: this.componentId
                ? "component-edit-template"
                : "component-edit-definition",
            rules: {
                "data.name": {
                    trigger: "change",
                    validator: (rule, value, callback) => {
                        if (!value || !value.length) {
                            return callback(
                                new Error(
                                    this.$i18n.t(
                                        "component_edit.validation.name.required"
                                    )
                                )
                            );
                        }
                        if (
                            this.$store.getters[`componentAlive/nameIsSet`](
                                value
                            )
                        ) {
                            return callback(
                                new Error(
                                    this.$i18n.t(
                                        "component_edit.validation.name.existing",
                                        { componentName: value }
                                    )
                                )
                            );
                        }
                        return callback();
                    },
                },
            },

            component: jsonDeepCopy(component), // Live definition of the edited component
        };
    },

    methods: {
        onSubmit(refToForm) {
            this.$refs[refToForm].validate((/* valid */) => {
                if (
                    this.component.data.name == undefined ||
                    this.component.data.name == ""
                ) {
                    this.activeTab = "component-edit-definition";
                    return;
                }

                let staticFit, fieldFit;
                try {
                    staticFit = this.component.data.templateUseHtml
                        ? FieldViewFit.methods.fieldViewFit_computeStaticAbacusTemplate(
                              this.component.data.templateHtml
                          )
                        : [];
                } catch {
                    staticFit = [];
                }
                try {
                    fieldFit =
                        FieldViewFit.methods.fieldViewFit_computeFieldAbacusTemplate(
                            JSON.parse(this.component.data.schemaForm).list.map(
                                (widget) => ({ widget })
                            )
                        );
                } catch {
                    fieldFit = [];
                }
                this.component.data.fitTextAbacus = {
                    ...staticFit,
                    ...fieldFit,
                };

                if (this.submitCallback) {
                    this.submitCallback({
                        componentId: this.componentId,
                        data: this.component.data,
                    });
                }

                // Close modal if necessary
                this.doCloseModal();
            });
        },

        // On cancel, close the modal
        onCancel() {
            this.doCloseModal();
        },

        // If opened in a modal, close it
        doCloseModal() {
            if (this.displayedInModal) {
                this.$emit("close");
            }
        },
    },
};
</script>
<style scoped>
.vw-link-color.el-button:hover {
    background: #fff;
}

/* Component edit name and desciption tab */
#component-edit-buttons {
    margin: 0px;
    position: absolute;
    right: 28px;
    top: 33px;
}

#component-edit-definition-form {
    padding: 30px;
}

#component-edit >>> #component-edit-definition-description {
    height: inherit !important;
}

/* Component edit object's display tab */
#component-edit >>> #board-2d {
    border-radius: var(--style-border-radius) !important;
}

/* Component edit general aspect ( tabs ) */
/* Following rule have intentionally removed.
       Please dont restablish it, it has already been done once.
    #component-edit >>> .el-tabs {
        margin-top: -38px;
    }*/

#component-edit >>> .el-tabs__nav-wrap {
    padding-left: 30px;
    margin-bottom: -2px;
}

#component-edit >>> .el-tabs__item {
    font-size: 0.8em;
}

#component-edit >>> .el-tabs__header {
    margin: 0px;
    z-index: calc(1 + var(--max-z-index));
    border-bottom: 1px solid var(--style-color-grey);
    margin-bottom: -1px;
}

#component-edit >>> .el-tabs__nav-wrap::after {
    background: none;
}

#component-edit >>> .el-tab-pane {
    min-height: 300px;
    margin-top: 1px;
}

#component-edit >>> .el-tabs__content {
    position: absolute;
    top: 125px;
    bottom: 0px;
    left: 0px;
    right: 0px;
}

#component-edit-template {
    height: 100%;
}

#component-edit-properties {
    height: 100%;
}

#component-edit-properties >>> .el-header {
    display: none;
}

#component-edit-properties >>> .widget-config-container .el-form-item {
    padding-bottom: 15px;
    margin-bottom: 10px;
}
#component-edit-properties >>> .widget-config-container .el-form-item__label {
    line-height: 30px;
}

#component-edit-properties >>> .widget-config-container .el-checkbox-group li,
#component-edit-properties >>> .widget-config-container .el-radio-group li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    line-height: 10px;
}

#component-edit-properties >>> .widget-config-container .el-checkbox-group,
#component-edit-properties >>> .widget-config-container .el-radio-group {
    display: flex;
}

#component-edit-properties >>> .widget-config-container .el-input {
    font-size: 14px;
}
#component-edit-properties
    >>> .widget-config-container
    .el-input
    .el-input__inner {
    font-size: 14px;
}
</style>
