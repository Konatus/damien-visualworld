<template>
    <div v-if="fields">
        <field-view
            ref="fieldView"
            v-for="field of fields"
            :key="field.model"
            :widget="field"
            :models="value"
            :isFullForm="true"
            :objectId="objectId"
            @elFormChange="onInput($event, false)"
            @elFormBlur="onInput($event, true)"
        />
    </div>
</template>
<script>
import isEqual from "lodash.isequal";
import jsonDeepCopy from "../../utils/json-deep-copy";
import FieldView from "../field-view/field-view";
export default {
    name: "FieldForm",
    components: {
        FieldView,
    },
    props: {
        objectId: {
            type: String,
        },
        schema: {
            type: Object,
        },
        value: {
            type: Object,
        },
    },
    inject: ["$view"],
    created() {
        this.onSchemaChange();
    },
    data() {
        return {
            cachedSchema: {},
            fields: [],
        };
    },
    watch: {
        schema: {
            deep: true,
            handler() {
                this.onSchemaChange();
            },
        },
    },
    computed: {
        isValid() {
            return this.$refs.fieldView.every(
                (field) => field.fieldViewData_isValid
            );
        },
    },
    methods: {
        onSchemaChange() {
            // Manage both string and object schema
            const schema =
                typeof this.schema === "string"
                    ? JSON.parse(this.schema)
                    : jsonDeepCopy(this.schema);

            // Check for schema changes
            if (!isEqual(this.cachedSchema, schema)) {
                this.cachedSchema = schema;
                this.fields = this.schema.list;
            }
        },
        onInput(event, reply) {
            const payload = {};
            if (this.objectId) {
                if (Object.prototype.hasOwnProperty.call(event, "value")) {
                    payload.data = { [event.model]: event.value };
                }
                if (Object.prototype.hasOwnProperty.call(event, "abacus")) {
                    payload.protect = { [event.model]: event.abacus };
                }
                this.$store.dispatch("object/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    payload: [
                        {
                            objectId: this.objectId,
                            ...payload,
                        },
                    ],
                    reply,
                });
            } else {
                // eslint-disable-next-line vue/no-mutating-props
                this.value[event.model] = event.value;
            }
        },
    },
};
</script>
