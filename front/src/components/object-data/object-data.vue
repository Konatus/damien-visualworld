<!--
    This component displays the data of an object, in a specific component.
    Ce component affiche les données d'un objet, dans un component spécifique.
-->
<template>
    <div @mousedown.stop @touchstart.stop id="object-data">
        <component-form
            id="object-data-header"
            :componentId="cachedComponentId"
        >
            <template v-slot:header>
                {{ title }}
            </template>

            <el-tabs v-model="activeTab" tab-position="right">
                <el-tab-pane
                    :label="$t('object_data.tabs.details')"
                    v-if="editableNote"
                    id="tab-details"
                >
                    <div id="errors" v-if="errors">{{ errors }}</div>

                    <field-form
                        id="object-data-form"
                        ref="objectDataForm"
                        :objectId="objectId"
                        :schema="schema"
                        :value="cachedDataOfObject"
                        @submit="onSubmit"
                    />
                </el-tab-pane>

                <el-tab-pane
                    :label="$t('object_data.tabs.links')"
                    v-if="hasLinks"
                >
                    <object-data-link
                        :objectId="objectId"
                        @select="onLinkModelChange"
                    />
                </el-tab-pane>

                <el-tab-pane
                    id="tab-data-calc"
                    v-if="dataCalc && Object.keys(dataCalc).length"
                    :label="$t('object_data.tabs.data_calc')"
                >
                    <table id="data-calc">
                        <caption style="display: none">
                            {{
                                $t("object_data.tabs.data_calc")
                            }}
                        </caption>
                        <tr :key="index" v-for="(item, index) in dataCalc">
                            <th>{{ index }}&nbsp;:</th>
                            <td>{{ item }}</td>
                            <!-- TODO: truncate long data -->
                        </tr>
                    </table>
                </el-tab-pane>

                <el-tab-pane
                    id="tab-data-trash"
                    v-if="Object.keys(dataTrash).length"
                    :label="$t('object_data.tabs.data_trash')"
                >
                    <table id="data-trash">
                        <caption style="display: none">
                            {{
                                $t("object_data.tabs.data_trash")
                            }}
                        </caption>
                        <tr :key="index" v-for="(item, index) in dataTrash">
                            <th>{{ index }}&nbsp;:</th>
                            <td>{{ item }}</td>
                            <!-- TODO: truncate long data -->
                        </tr>
                    </table>
                </el-tab-pane>
            </el-tabs>
        </component-form>

        <el-button
            @mouseup.native="objectId ? onSubmit() : onCancel()"
            @touchend.native="objectId ? onSubmit() : onCancel()"
            size="mini"
            id="btn-close-object-data"
            class="modal-btn-close"
            icon="el-icon-close"
            type="info"
        />

        <div
            id="object-data-buttons"
            class="buttons vw-link-color"
            v-if="displayedInModal"
        >
            <el-button
                v-if="!objectId"
                class="el-button--primary is-plain"
                @mouseup.native="onSubmit"
                @touchend.native="onSubmit"
                type="submit"
                size="small"
                icon="el-icon-plus"
            >
                {{ $t("object_data.submit") }}
            </el-button>
            <el-button
                v-if="objectId"
                class="el-button--primary is-plain"
                @click="onSubmit"
                size="small"
                icon="el-icon-close"
            >
                {{ $t("object_data.close") }}
            </el-button>
        </div>
    </div>
</template>

<script>
import jsonDeepCopy from "../../utils/json-deep-copy";
import VueModalFinder from "../../utils/vue-modal-finder";
import ComponentForm from "../component-form/component-form";
import FieldForm from "../field-form/field-form";
import ObjectDataLink from "./object-data-link";

export default {
    name: "ObjectData",

    components: {
        ComponentForm,
        FieldForm,
        ObjectDataLink,
    },

    props: {
        componentId: String,
        objectId: String,
        positionId: String,
        position: Object,

        isNew: Boolean,
        displayCancel: Boolean,
        submitCallback: Function,
    },
    inject: ["$view"],

    data() {
        return {
            activeTab: undefined,
            errors: null,
            cachedDataOfObject: {},
            cachedComponentId: this.componentId,
            cachedPositionOfObject: this.position,
        };
    },

    created() {
        // Read object
        this.cachedDataOfObject = this.cachedDataOfObject = jsonDeepCopy(
            this.dataOfObject
        );
    },

    beforeCreate() {
        if (this.$refs.objectDataForm) {
            const beforeCloseValidation = () => {
                this.$parent.$on("before-close", (evt) => {
                    if (
                        this.$refs.objectDataForm &&
                        !this.$refs.objectDataForm.isValid &&
                        this.objectId
                    ) {
                        evt.stop();
                    }
                });
            };
            VueModalFinder(this, beforeCloseValidation);
        }
    },

    watch: {
        dataOfObject: {
            deep: true,
            handler(value) {
                // Save received data in cache
                this.cachedDataOfObject = jsonDeepCopy(value);
            },
        },
    },

    computed: {
        // Title that is displayed in the header
        title() {
            const componentName = this.component.data.name
                ? this.component.data.name
                : this.$i18n.t("board_object.modal.title_default_model");
            return this.$t(
                this.isNew
                    ? "board_object.modal.create_title"
                    : "board_object.modal.edit_title",
                { componentName }
            );
        },

        // Does component of current object have properties?
        editableNote() {
            try {
                return this.schema.list.length;
            } catch (e) {
                return false;
            }
        },

        // Is the current object linked to any other object
        hasLinks() {
            return this.$store.getters["linkAlive/byObjectId"](this.objectId)
                .length;
        },

        // Is that component a child of a modal?
        displayedInModal() {
            try {
                return this.$parent.$options._componentTag === "modal";
            } catch (e) {
                return false;
            }
        },

        // Component retrieved with componentId prop
        component() {
            try {
                const component = this.$store.getters[`componentAlive/byId`](
                    this.cachedComponentId
                );
                if (!component || !component.name) {
                    throw new Error("not-found-component");
                }
                return component;
            } catch (e) {
                return this.$store.getters[`componentAlive/byId`](null);
            }
        },

        // Schema of the form
        schema() {
            try {
                return JSON.parse(this.component.data.schemaForm);
            } catch (e) {
                return {};
            }
        },

        // Read and save data
        dataOfObject() {
            // Return empty object if objectId isnt provided
            if (!this.objectId) {
                return {};
            }

            // Read the object
            const { data } = this.$store.getters[`recursiveData/full`]({
                positionId: this.positionId,
                componentId: this.componentId,
                staticData: this.staticData,
            });

            // Return empty object if data of the object isnt available
            if (!data) {
                return {};
            }

            // Return data of the object
            return data;
        },

        dataCalc() {
            return this.dataOfObject.CALC;
        },

        // Data that doesnt match field of the schema
        dataTrash() {
            const out = jsonDeepCopy(this.dataOfObject);

            // remove alive data
            if (this.schema.list) {
                for (let field of this.schema.list) {
                    delete out[field.model];
                }
            }

            // remove fit-text abacuses
            for (let key in out) {
                if (key[0] === "_") {
                    delete out[key];
                }
            }

            // Remove computeds
            if (out.VW) {
                delete out.VW;
            }
            if (out.CALC) {
                delete out.CALC;
            }

            return out;
        },

        defaultLink() {
            return this.$store.getters["latestLinkModel/model"];
        },
    },

    methods: {
        onLinkModelChange(evt) {
            const currentLinkModel = evt.linkModelIdChoice;

            const dataLinkModel =
                this.$store.getters["linkModelAlive/byId"](currentLinkModel);

            const link = [
                this.$store.getters["linkAlive/byId"](evt.currentLinkId),
            ];

            link.forEach((link) => {
                if (dataLinkModel && currentLinkModel !== link.linkModelId) {
                    link.linkModelId = currentLinkModel;
                    dataLinkModel.data.anchors.forEach(
                        (linkModelAnchor, index) =>
                            this.saveUpdatedData(
                                {
                                    linkId: link.linkId,
                                    data: { title: link.data.title },
                                    linkModelId: currentLinkModel,
                                },
                                [
                                    {
                                        _id: link.objects[index]._id,
                                        data: linkModelAnchor.data,
                                    },
                                ]
                            )
                    );
                } else {
                    this.defaultLink.anchors.forEach((defaultLinkAnchor) =>
                        this.saveUpdatedData(
                            {
                                linkId: link.linkId,
                                data: this.defaultLink.data,
                                linkModelId: "",
                            },
                            [
                                {
                                    _id: link.objects[
                                        defaultLinkAnchor.data.arrowhead
                                    ]._id,
                                    data: defaultLinkAnchor.data,
                                },
                            ]
                        )
                    );
                }
            });
        },

        saveUpdatedData(link, objects) {
            this.$store.dispatch("linkAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                linkId: link.linkId,
                data: link.data,
                linkModelId: link.linkModelId,
                reply: true,
                objects,
            });
        },

        // On submit, transmit event to parent
        onSubmit() {
            if (
                this.$refs.objectDataForm &&
                !this.$refs.objectDataForm?.isValid
            ) {
                this.$store.commit(
                    `app/objectsInBoard/event`,
                    "fieldViewData_showPopReset"
                );
                return;
            }
            this.doCloseModal();
            this.submitCallback({
                componentId: this.cachedComponentId,
                data: this.cachedDataOfObject,
                position: this.cachedPositionOfObject,
            });

            if (this.objectId) {
                this.$store.dispatch("object/update", {
                    worldId: this.$route.params.worldId,
                    boardId: this.$route.params.boardId,
                    payload: [
                        {
                            objectId: this.objectId,
                            data: this.cachedDataOfObject,
                        },
                    ],
                    reply: true,
                });
            }
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
#object-data {
    display: flex;
    min-height: 500px;
}

#object-data-header {
    width: 69%;
    overflow: auto;
    scrollbar-width: auto;
}

#object-data-header::-webkit-scrollbar {
    width: 16px;
}

#object-data >>> .object-data-title {
    display: block;
    width: 70%;
    color: #aeb1bb;
    font-size: 18px;
    margin-bottom: 20px;
}

#object-data >>> #object-data-edit span {
    display: flex;
    align-items: center;
}

/* Form tabs on the side */
#object-data >>> .el-tabs {
    margin: 40px 0px 36px 36px;
}

#object-data >>> .el-tabs__header {
    position: absolute;
    right: 0;
    top: 0px;
    width: 30%;
    height: 100%;

    padding-top: 75px;

    border-bottom: 1px solid #dedee2;
    border-left: 4px solid #dedee2;
}

#object-data >>> .el-tabs--right .el-tabs__header.is-right {
    padding-left: 4px;
    margin-left: 0px;
}

#object-data >>> .el-tabs__item {
    font-size: 0.8em;
    font-weight: 600;
}

#object-data >>> .el-tabs__item.is-active {
    background: rgba(241, 241, 244, 0.6);
    color: #000;
}

#object-data >>> .el-tabs--right .el-tabs__nav-wrap.is-right::after {
    width: 0px;
}

#object-data >>> .el-tabs--right .el-tabs__active-bar.is-right {
    width: 4px;
}

/* Form buttons */
#object-data-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    align-self: flex-end;

    width: 30%;
    height: 200px;
    z-index: var(--modal-z-index);

    padding-top: 30px;
    margin: 0px;

    border-top: 1px solid #dedee2;
}

#object-data-buttons button {
    width: 80%;
    text-align: left;
    font-size: 14px;
    background: #f1f1f4;
    border: none;
    margin-left: -13px;
}

#object-data-buttons .el-button--primary.is-plain:hover {
    color: initial;
}

/* Rendered form */
#object-data-form {
    font-size: 0.8em;
    margin-right: 100px;
    padding-bottom: 1px;
}

#object-data-form >>> img {
    max-width: 150px;
}

#object-data >>> .el-form-item__content {
    width: 100%;
}

#object-data >>> .el-radio-group,
#object-data >>> .el-checkbox-group {
    display: flex;
    flex-wrap: wrap;
}

#errors {
    color: var(--color-error-input);
    margin: 0 20px;
    padding: 4px 10px;
    font-size: 0.65em;
    border: 1px solid darkgray;
    border-radius: var(--style-border-radius);
}

#object-data >>> .ql-active {
    color: var(--style-color-lightblue) !important;
    filter: var(--style-filter-lightblue);
}

#object-data >>> .ql-picker-label {
    display: flex;
}

/* data-trash */

#data-trash {
    text-align: left;
}

#data-trash >>> tr {
    line-height: 30px;
    font-size: 14px;
}
</style>
