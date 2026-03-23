<!--
        This component displays the data of an object, in a specific component.
        Ce component affiche les données d'un objet, dans un component spécifique.
-->
<template>
    <div class="component-wrapper">
        <el-alert
            class="component component-error vw-absolute-0"
            v-if="(component && component.error) || renderError"
            type="error"
            :closable="false"
            show-icon
        >
            {{ (component && component.error) || renderError }}
        </el-alert>
        <component
            class="component vw-absolute-0"
            :class="{
                'component-sample': staticData,
            }"
            v-if="$store.getters[`object/isInitialized`]"
            :is="component.name"
            :VW_objectId="$vnode.key"
            :VW_positionId="positionId"
            :VW_data="dataOfObject"
            :VW_abacus="abacusOfObject"
            @input="onInput"
            @renderError="onRenderError"
        />
    </div>
</template>

<script>
import isEqual from "lodash.isequal";
export default {
    name: "ObjectView",
    props: {
        componentId: String,
        positionId: String,
        staticData: Object,
    },
    inject: ["$view"],

    created() {
        if (!this.staticData && this.$vnode.key !== this.componentId) {
            this.$store.dispatch("object/read", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                objectId: this.$vnode.key,
            });
        }
        this.dataOfObject = this.liveDataOfObject;
    },

    computed: {
        component() {
            try {
                const component =
                    this.$store.getters[`componentTrash/byId`](
                        this.componentId
                    ) ||
                    this.$store.getters[`componentAlive/byId`](
                        this.componentId
                    );
                if (!component || !component.name) {
                    throw new Error("not-found-component");
                }
                return component;
            } catch (e) {
                return this.$store.getters[`componentAlive/byId`](null);
            }
        },
        liveDataOfObject() {
            try {
                const { data } = this.$store.getters[`recursiveData/full`]({
                    positionId: this.positionId,
                    componentId: this.componentId,
                    staticData: this.staticData,
                });
                return data;
            } catch {
                return {};
            }
        },
        abacusOfObject() {
            try {
                return (
                    this.$store.getters[`object/byId`](this.$vnode.key)
                        .protect || {}
                );
            } catch (e) {
                return undefined;
            }
        },
    },
    data() {
        return {
            dataOfObject: {}, // liveDataOfObject updates that data only in case of deep inequality (avoid render at each computation)
            updatedDataOfObject: {}, // Deduplicate input event (from el.form.change events) before re-emitting them
            renderError: null,
        };
    },
    watch: {
        liveDataOfObject() {
            if (!isEqual(this.dataOfObject, this.liveDataOfObject)) {
                this.dataOfObject = this.liveDataOfObject;
                this.$store.commit(`recursiveData/set`, {
                    _id: this.positionId,
                    data: this.liveDataOfObject,
                });
            }
        },
    },
    methods: {
        onInput({ data, reply }) {
            if (this.staticData) {
                return;
            }
            if (!data) {
                return;
            }
            if (isEqual(this.updatedDataOfObject, data) && !reply) {
                return;
            }
            this.updatedDataOfObject = data;

            const { model, value, abacus } = data;
            const payload = {};
            if (Object.prototype.hasOwnProperty.call(data, "value")) {
                payload.data = { [model]: value };
            }
            if (Object.prototype.hasOwnProperty.call(data, "abacus")) {
                payload.protect = { [model]: abacus };
            }
            this.$store.dispatch("object/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                payload: [
                    {
                        objectId: this.$vnode.key,
                        ...payload,
                    },
                ],
                reply,
            });
        },
        onRenderError(error) {
            this.renderError = error;
        },
    },
};
</script>
<style scoped>
.component-wrapper {
    position: relative;
}
.component {
    border-radius: var(--style-border-radius);
    outline-style: solid;
    outline-color: transparent;
    text-decoration: "inherit";

    height: 100%;
    box-sizing: border-box;
}
.component:not(.component-from-field) {
    padding: var(--object-view-padding);
}
.component >>> .el-form-item,
.component >>> .el-form-item__content {
    border-radius: var(--style-border-radius);
    margin-bottom: 0px !important;
}
.component >>> textarea {
    overflow: hidden;
}
/* Remove element-ui default not-allowed cursor over disabled form-item */
.component-sample >>> * {
    cursor: default !important;
    pointer-events: none;
}
.component-error {
    font-weight: bold;
}
</style>
