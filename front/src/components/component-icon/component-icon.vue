<!--
    This component displays an icon representing a component.
    Ce component affiche une icône représentant un composant.
-->
<template>
    <div class="component-icon" :class="componentIconClass">
        <div class="component-summary">
            <div class="component-summary-name">
                {{ name }}
            </div>

            <div class="component-summary-icon" :style="miniStyle">
                <svg
                    width="15"
                    height="7"
                    viewBox="0 0 15 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.536133 6.02881C1.06199 5.04462 1.66847 1.05449 2.82639 1.33569C3.98431 1.61689 2.78367 6.12229 4.5 6.11514C5.97369 6.28883 5.89776 2.91986 7.5 2.5C8.31962 2.28522 12 4 11 5.5C9.4627 7.21659 8.71105 6.07161 9 5C9.48832 3.18905 12.9203 0.641687 14.4647 6.11514"
                        :stroke="miniStyle.color"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
        </div>
        <el-tooltip
            v-if="showPreview"
            popper-class="component-icon-description"
            placement="right"
            effect="light"
            :open-delay="openDelayTooltip"
        >
            <div
                class="component-icon-description-content"
                slot="content"
                v-if="component.data.description !== ''"
            >
                <span>{{ component.data.description }}</span>
            </div>
            <div
                class="component-icon-description-content"
                slot="content"
                v-else
            >
                <span>{{ $t("library.no_description") }}</span>
            </div>
            <object-view
                class="component-preview"
                :style="ghostStyle"
                :key="componentId"
                :componentId="componentId"
                :staticData="staticDataOrSample"
            />
        </el-tooltip>

        <slot />
    </div>
</template>
<script>
const LARGE = "large";
const SMALL = "small";
const MINI = "mini";
import app from "../../conf/app";
import dataSample from "../../utils/data-sample";
import ObjectView from "../object-view/object-view";
export default {
    name: "ComponentIcon",

    components: {
        ObjectView,
    },

    props: {
        componentId: String,
        staticData: Object,
        scaleOfGhost: Number,
        showPreview: {
            type: Boolean,
            default: true,
        },
        size: {
            type: String,
            default: LARGE,
            validator(value) {
                return [LARGE, SMALL, MINI].includes(value);
            },
        },
    },
    inject: ["$view"],

    computed: {
        componentIconClass() {
            return {
                [LARGE]: "component-icon-large",
                [SMALL]: "component-icon-small",
                [MINI]: "component-icon-mini",
            }[this.size];
        },

        // Definition of component, from the store
        component() {
            try {
                return (
                    this.$store.getters[`componentTrash/byId`](
                        this.componentId
                    ) ||
                    this.$store.getters[`componentAlive/byId`](this.componentId)
                );
            } catch {
                return {
                    data: {},
                };
            }
        },

        // SVG to be displayed in
        miniSvg() {
            const icon = this.component.icon;
            if (icon) {
                return icon; // a picture is displayed
            } else {
                return false; // a "T" is displayed
            }
        },

        // Style of the t-miniature: shows colors & shape (square or circle)
        miniStyle() {
            return {
                backgroundColor: this.component.data?.styleBackgroundColor,
                outlineColor:
                    this.component.data?.styleOutlineColor || "transparent",
                color: this.component.data?.styleColor,
                borderRadius: this.component.parsedStyle?.borderRadius, // shows if it is a square or a circle
            };
        },

        // Style of the ghost: shows the default size
        ghostStyle() {
            return {
                width: `${this.component.data.defaultWidth}px`,
                height: `${this.component.data.defaultHeight}px`,
                transform: `scale( ${this.scaleOfGhost} )`,
            };
        },

        // Return the static data provided as prop, or a sample otherwise
        // not managed by prop's defaut value, because an access to the store is necessary
        staticDataOrSample() {
            if (this.staticData) {
                return this.staticData;
            } else {
                const sample = {};
                const schema =
                    this.$store.getters[`componentTrash/schemaById`](
                        this.componentId
                    ) ||
                    this.$store.getters[`componentAlive/schemaById`](
                        this.componentId
                    );
                if (schema) {
                    for (let id in schema) {
                        sample[schema[id].model] = dataSample(schema[id]);
                    }
                }
                return sample;
            }
        },

        // Name of the component
        name() {
            try {
                if (this.componentId === undefined)
                    return this.$i18n.t("library.component.default_model");
                return this.component.data.name;
            } catch (e) {
                return "";
            }
        },

        openDelayTooltip() {
            return app?.tooltip_config?.delay;
        },
    },
};
</script>
<style scoped>
.component-summary {
    cursor: move;
}
.component-preview,
.component-summary-icon {
    outline-style: solid;
    outline-color: transparent; /* Default color, maybe overrided */
}
.component-preview {
    box-sizing: border-box;
    outline-width: 2px;
}
.component-summary-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    text-align: center;
    outline-width: 1px;
    border-radius: var(--style-border-radius);
}

.component-icon-description {
    width: 20em;
    max-height: 20em;
    min-height: 15px;
    min-width: 15px;
}
.component-icon-description-content {
    width: 20em;
    min-height: 4em;
    max-height: 20em;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
<style>
.component-icon-large .component-summary-icon {
    width: 32px;
    height: 32px;
    padding: 10px;
}
.component-icon-large .component-summary-icon img {
    width: 25px;
}
.component-icon-large .component-summary-icon svg {
    width: 15px;
    height: 10px;
}
.component-icon-large .component-summary-name {
    font-size: 90%;
}

.component-icon-small .component-summary-icon {
    width: 24px;
    height: 24px;
    padding: 2px;
}
.component-icon-small .component-summary-icon img {
    width: 15px;
}
.component-icon-small .component-summary-icon svg {
    width: 15px;
    height: 10px;
}
.component-icon-small .component-summary-name {
    font-size: 80%;
}

.component-icon-mini {
    border-radius: unset;
}
.component-icon-mini .component-summary-icon {
    width: 15px;
    height: 15px;
    padding: 4px;
}
.component-icon-mini .component-summary-icon img {
    width: 9px;
}
.component-icon-mini .component-summary-icon svg {
    width: 10px;
    height: 10px;
}
.component-icon-mini .component-summary-name {
    font-size: 70%;
}
</style>
