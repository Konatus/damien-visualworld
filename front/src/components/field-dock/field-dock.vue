<!--
    This component provides the elements that can be used to model a component.
    Ce component fournit les éléments pouvant être utilisés pour modeler un composant.

    cf: https://github.com/SortableJS/sortablejs#options for draggable options
-->
<!-- TODO: move 'field-dock-item' class name to a config file? -->
<template>
    <div id="field-dock-wrapper">
        <span class="field-dock-title" v-if="staticId && staticId.length">
            {{ $t("component_edit.field_dock.properties") }}
        </span>
        <div class="field-dock field-dock-library">
            <div
                class="wrapper-field-dock-item"
                v-for="id of staticId"
                :key="id"
            >
                <div
                    class="grid-stack-item field-dock-item"
                    :key="id"
                    :data-field-id="id"
                    :style="{
                        width: `${gridSize.cellWidth * 2}px`,
                        height: `${gridSize.cellHeight}px`,
                    }"
                >
                    <div class="object-body grid-stack-item-content">
                        <field-icon
                            ref="field-dock-item"
                            class="field-icon"
                            :data-field-id="id"
                            :fieldId="id"
                        />
                    </div>
                </div>
            </div>
        </div>

        <span class="field-dock-title" v-if="propId && propId.length">
            {{ $t("component_edit.field_dock.properties") }}
        </span>
        <div class="field-dock field-dock-library">
            <div class="wrapper-field-dock-item" v-for="id of propId" :key="id">
                <div
                    class="grid-stack-item field-dock-item"
                    :key="id"
                    :data-field-id="id"
                    :style="{
                        width: `${gridSize.cellWidth * 2}px`,
                        height: `${gridSize.cellHeight}px`,
                    }"
                >
                    <div class="object-body grid-stack-item-content">
                        <field-icon
                            ref="field-dock-item"
                            class="field-icon"
                            :data-field-id="id"
                            :fieldId="id"
                        />
                    </div>
                </div>
            </div>
        </div>

        <span class="field-dock-title" v-if="compId && compId.length">
            {{ $t("component_edit.field_dock.computed") }}
        </span>
        <div class="field-dock field-dock-library">
            <div class="wrapper-field-dock-item" v-for="id of compId" :key="id">
                <div
                    class="grid-stack-item field-dock-item"
                    :key="id"
                    :data-field-id="id"
                    :style="{
                        width: `${gridSize.cellWidth * 2}px`,
                        height: `${gridSize.cellHeight}px`,
                    }"
                >
                    <div class="object-body grid-stack-item-content">
                        <field-icon
                            ref="field-dock-item"
                            class="field-icon"
                            :data-field-id="id"
                            :fieldId="id"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import FieldIcon from "../field-icon/field-icon";
export default {
    name: "FieldDock",

    components: {
        FieldIcon,
    },

    inject: ["$view"],

    props: {
        gridSize: Object,
    },

    computed: {
        // Fields displayed in the dock
        staticId() {
            return this.$store.getters[`field/staticIdAsArray`];
        },
        propId() {
            return this.$store.getters[`field/propertyIdAsArray`];
        },
        compId() {
            return this.$store.getters[`field/computedIdAsArray`];
        },
    },
};
</script>
<style scoped>
#field-dock-wrapper {
    width: 20%;
    height: 100%;
    padding-top: 20px;
    background: white;
    position: relative;
    z-index: var(--max-z-index);
    overflow: scroll;
}

.field-dock {
    z-index: var(--level1-z-index);
    border-radius: 0px;

    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;

    overflow-y: visible;
    overflow-x: visible;
    user-select: none;

    margin: 0px 10px;
}

.field-dock .wrapper-field-dock-item {
    width: 45%;
    background: var(--layer-background);
    margin: 4px;
    height: 32px;
}

.field-dock .wrapper-field-dock-item:hover {
    border: 1px dashed var(--style-color-lightblue) !important;
    box-sizing: border-box;
}

.field-dock.field-dock-library:before {
    opacity: 1;
}

.field-dock > li {
    list-style-type: none;
}

.field-dock >>> .field-icon:not(.sortable-fallback) {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    margin: 1px 4px 1px 0px;
    padding: 4px 0px 0px 4px;
    border: none;
    background: var(--layer-background);
}

.field-dock >>> .field-mini {
    border: none;
}
.field-dock >>> .field-name {
    align-self: center;
    font-size: 11px;
    margin-left: 4px;
    text-shadow: 0 0 3px white;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
.field-dock >>> .field-preview {
    display: none !important;
}

.object-body {
    width: 100px;
}

.field-remove {
    position: relative;
    top: 0;
    right: 0;
    height: 0;
    padding: 0;
}

.field-dock-title {
    margin: 0px 0px 10px 10px;
    color: var(--style-color-grey);
    display: block;
    padding: 5px;
    font-weight: 700;
    font-size: 13px;
}

.field-icon {
    cursor: move;
}

.field-icon >>> .ql-editor,
.field-icon >>> .el-textarea__inner,
.field-icon >>> .el-input__inner {
    padding: 0px !important;
    background: transparent;
    line-height: 0px;
    height: inherit;
    font-size: 0.5em;
    padding-top: 10% !important;
    overflow: inherit;
}

.field-icon >>> .el-textarea__inner {
    line-height: 10px;
}
</style>
<style>
/* From field-dock to grid-stack dragged field */
.field-dock-item.ui-draggable-dragging .field-name,
.field-dock-item.ui-draggable-dragging .field-mini {
    display: none;
}
.field-dock-item.ui-draggable-dragging .field-preview,
.field-dock-item.ui-draggable-dragging .field-preview * {
    display: block;
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
}
</style>
