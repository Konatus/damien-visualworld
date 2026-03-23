<template>
    <div id="grid-stack-wrapper" :style="wrapperStyle" @click="onClick">
        <section id="grid-stack-main" class="grid-stack grid-stack-n">
            <grid-view :colCount="colCount" :rowCount="rowCount" />

            <div
                class="grid-stack-item field-dock-item"
                v-for="field of parsedValue.grid"
                :key="field.fieldId + field.x + field.y"
                :data-id="field.id"
                :data-field-id="field.fieldId"
                :gs-x="field.x"
                :gs-y="field.y"
                :gs-w="field.w"
                :gs-h="field.h"
            >
                <div class="object-body grid-stack-item-content">
                    <field-icon
                        ref="field-dock-item"
                        class="field-icon component component-grid component-field-builder"
                        :class="{
                            'selected-field':
                                field.id === selectFieldId ||
                                field.fieldId === selectFieldId,
                        }"
                        :data-field-id="field.fieldId"
                        :fieldId="field.fieldId"
                        :fieldStyle="component.templateGridStackStyle[field.id]"
                        :key="
                            field.fieldId +
                            '-' +
                            component.templateGridStackStyle[field.id].content
                        "
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import app from "../../conf/app";

import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import { GridStack } from "gridstack";
import "gridstack/dist/h5/gridstack-dd-native";

import FieldIcon from "../field-icon/field-icon";
import GridView from "../grid-view/grid-view";

import { getMinScale } from "../../utils/scale";

export default {
    name: "ComponentGrid",
    components: {
        FieldIcon,
        GridView,
    },
    props: {
        value: {
            type: String, // TODO: Array or String?
            default: "[]",
        },
        component: {
            //
            type: Object,
            default: () => ({}),
        },
        templateGridStackStyleAsString: String,
        gridSize: Object,
    },
    mounted() {
        this.grid = GridStack.init({
            // Global config
            disableOneColumnMode: true,
            float: true,
            margin: "0",

            // Grid: cell size & number
            cellHeight: `${this.cellHeight}px`, // TODO: make reactive
            cellWidth: `${this.cellWidth}px`, // TODO: make reactive
            minRow: this.rowCount,
            maxRow: this.rowCount,
            column: this.colCount,

            // Add field
            acceptWidgets: true,
            dragIn: ".field-dock-item", // TODO: move to a config file?
            dragInOptions: {
                revert: "invalid",
                scroll: false,
                appendTo: "#grid-stack-main",
                helper: "clone",
            },

            // Resize field
            alwaysShowResizeHandle: true,

            // Remove field
            removable: true,
            removeTimeout: 100,
        });

        // Emit gridstack data, as 'input' event
        this.onEmitGridstack();

        this.resizeObserver = new ResizeObserver(() => {
            this.refreshScale++;
        }).observe(this.$el.parentNode);
    },
    beforeDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.$el.parentNode);
        }
    },

    data() {
        return {
            grid: undefined,
            refreshScale: 0,
            resizeObserver: null,
            templateGridStackStyle: {},
        };
    },
    computed: {
        colCount() {
            return this.gridSize.colCount; // No more than 12 columns, even if large object and small font
        },

        cellWidth() {
            return this.gridSize.cellWidth; // TODO: round?
        },

        rowCount() {
            return this.gridSize.rowCount;
        },

        cellHeight() {
            return this.gridSize.cellHeight; // TODO: round?
        },

        parsedValue() {
            const parsed = JSON.parse(this.value);
            if (Array.isArray(parsed.grid)) {
                for (let field of parsed.grid) {
                    if (!field.id) {
                        field.id = field.fieldId; // retro compatibility
                    }
                }
            }
            return parsed;
        },

        scale() {
            const ignoredOnlyNeededForReactivity = this.refreshScale;
            try {
                const parentSize = this.$el.parentNode.getBoundingClientRect();
                return getMinScale(
                    parentSize.right - parentSize.left,
                    parentSize.bottom - parentSize.top,
                    this.component.defaultWidth,
                    this.component.defaultHeight,
                    0.2
                );
            } catch (e) {
                return 1;
            }
        },

        wrapperStyle() {
            const out = {};
            try {
                if (this.component) {
                    Object.assign(out, {
                        backgroundColor: this.component.styleBackgroundColor,
                        border: `1px solid ${
                            this.component.styleOutlineColor
                                ? this.component.styleOutlineColor
                                : "transparent"
                        }`,
                        width: `${this.component.defaultWidth}px`,
                        height: `${this.component.defaultHeight}px`,
                        color: this.component.styleColor,
                        transform: `scale( ${this.scale} )`,
                    });
                }
            } catch {
                /* Nothing to do */
            }
            return out;
        },

        selectFieldId: {
            get() {
                return this.$store.getters[`app/componentEdit/fieldId`];
            },
            set(fieldId) {
                this.$store.commit(`app/componentEdit/fieldId`, fieldId);
            },
        },
    },

    watch: {
        templateGridStackStyleAsString(value) {
            this.templateGridStackStyle = JSON.parse(value);
        },

        colCount() {
            this.grid = GridStack.init({
                minRow: this.rowCount,
                maxRow: this.rowCount,
                column: this.colCount,
                cellWidth: this.cellWidth,
                cellHeight: this.cellHeight,
            });
            this.onEmitGridstack();
        },
    },
    methods: {
        removeField() {
            const fields = this.grid.getGridItems();
            for (let field of fields) {
                if (field.attributes["data-id"].value == this.selectFieldId) {
                    this.grid.removeWidget(field);
                }
            }
            this.selectFieldId = undefined;
        },

        onEmitGridstack() {
            // Emit gridstack data, as 'input' event
            for (let eventName of ["added", "change", "removed"]) {
                this.grid.on(eventName, (event) => {
                    this.onGridChange(event);
                });
            }

            this.onGridChange();

            // Scale may be computed because $el is available
            this.refreshScale++;
        },

        onClick(event) {
            try {
                let id;
                let node = event.target || event.srcElement;

                for (let k = 0; k < 1000; k++) {
                    if (node?.dataset?.fieldId && node?.dataset?.id) {
                        id = node.dataset.id;
                        break;
                    } else if (node.parentElement) {
                        node = node.parentElement;
                    } else {
                        break;
                    }
                }

                this.selectFieldId = id;
            } catch {
                /* not catched */
            }
        },

        onGridChange(event) {
            if (event?.type === "removed") {
                this.removeField();
            }

            const eventIsAdd = event?.type === "added";
            const nodes = (event?.detail?.[0]?.grid || this.grid).engine.nodes;

            // List of item positions in the grid
            const grid = nodes.map((node) => {
                if (eventIsAdd && !node.el.dataset.id) {
                    node.el.dataset.id = `${node.el.dataset.fieldId}${
                        eventIsAdd ? "_" + Date.now() : ""
                    }`;
                }
                return {
                    id: node.el.dataset.id,
                    fieldId: node.el.dataset.fieldId,
                    x: node.x,
                    y: node.y,
                    w: node.w,
                    h: node.h,
                };
            });

            // Set default style for field
            if (!this.component.templateGridStackStyle) {
                // eslint-disable-next-line vue/no-mutating-props
                this.component.templateGridStackStyle = {};
            }
            grid.map((node) => {
                if (!this.component.templateGridStackStyle[node.id]) {
                    // eslint-disable-next-line vue/no-mutating-props
                    this.component.templateGridStackStyle[node.id] = {
                        id: node.id,
                        content: app.templateGridStackStyle.content,
                        styleBackgroundColor:
                            app.templateGridStackStyle.styleBackgroundColor,
                        styleColor: app.templateGridStackStyle.styleColor,
                        styleTextAlign:
                            app.templateGridStackStyle.styleTextAlign,
                        styleFontWeightBold:
                            app.templateGridStackStyle.styleFontWeightBold,
                        styleTextDecorationUnderline:
                            app.templateGridStackStyle
                                .styleTextDecorationUnderline,
                        styleFontStyleItalic:
                            app.templateGridStackStyle.styleFontStyleItalic,
                    };
                }
            });

            // Emit the grid and its css config
            this.$emit(
                "input",
                JSON.stringify({
                    grid,
                    colCount: this.colCount,
                    rowCount: this.rowCount,
                })
            );
        },
    },
};
</script>

<style scoped>
#grid-stack-wrapper {
    padding: var(--object-view-padding);
}

/* Hide shadow on drag or resize */
.grid-stack >>> .ui-resizable-resizing > .grid-stack-item-content,
.grid-stack >>> .ui-draggable-dragging > .grid-stack-item-content {
    box-shadow: none;
}

/* Cell content */
.grid-stack >>> .grid-stack-item {
    box-sizing: border-box;
}
.grid-stack >>> .grid-stack-item-content {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: var(--style-border-radius);
    margin-left: 1px;
    margin-top: 1px;
}
.grid-stack >>> .field-icon {
    width: 100%;
    height: 100%;
    border-radius: calc(1px + var(--style-border-radius));
    border: 1px solid #aeb1bb;
    box-sizing: border-box;
}
.grid-stack >>> .field-name,
.grid-stack >>> .field-mini {
    display: none;
}
.grid-stack >>> .field-preview {
    display: block;
    border: none;
}

.grid-stack >>> .grid-stack-item .el-input__inner {
    border: none;
}

.grid-stack-item >>> .ui-resizable-se {
    background-size: contain;
    background-repeat: no-repeat;
    width: 8px;
    height: 8px;
    margin-right: 1px;
    margin-bottom: 1px;
}

/* Removing field from grid-stack */
.grid-stack >>> .grid-stack-item-removing::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: var(--color-trash);
    opacity: 0.3;
}

/* Currently selected field */
.selected-field:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    pointer-events: none;
    background: var(--color-drag-alpha);
}
</style>
