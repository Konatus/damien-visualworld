<!--
    This component displays an icon representing a property.
    Ce component affiche une icône représentant une propriété.
-->
<template>
    <div>
        <div class="field-name" :title="name">
            {{ name }}
        </div>

        <div class="field-mini">
            <i class="icon iconfont" :class="miniSvg"></i>
        </div>

        <field-view
            class="field-preview"
            :widget="field"
            :models="models"
            :fieldStyle="fieldStyle"
            :w="6"
            :h="3"
        />
    </div>
</template>
<script>
import FieldView from "../field-view/field-view.vue";
import dataSample from "../../utils/data-sample";
export default {
    name: "FieldIcon",
    components: {
        FieldView,
    },

    props: {
        fieldId: String,
        fieldStyle: Object,
    },
    inject: ["$view"],

    computed: {
        // Definition of field, from the store
        field() {
            try {
                return this.$store.getters[`field/byId`](this.fieldId) || {};
            } catch (e) {
                return {};
            }
        },

        // SVG to be displayed in
        // icon-json is set for computed
        miniSvg() {
            return this.field.icon;
        },

        // Name of the field
        name() {
            try {
                return this.field?.name || this.fieldId;
            } catch (e) {
                return "";
            }
        },

        models() {
            const data = {
                [this.field?.model]: dataSample(this.field),
            };
            return {
                ...data,
                CALC: data,
            };
        },
    },
};
</script>
<style scoped>
.field-preview,
.field-mini {
    border-style: solid;
    border-color: transparent; /* Default color, maybe overrided */
}
.field-preview {
    box-sizing: border-box;
    border-width: 2px;
}
.field-preview >>> * {
    cursor: default !important;
    pointer-events: none;
}
.field-mini {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    width: 25px;
    height: 25px;
    text-align: center;
    border-width: 1px;
    border-radius: var(--style-border-radius);
    cursor: move;
    padding: 10px;
}
.field-mini img {
    width: 20px;
}
</style>
