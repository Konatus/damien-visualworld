<!--
    This component displays a list of component choices.
    Ce component affiche un liste de choix de composant.
-->
<template>
    <el-select
        class="component-picker vw-link-color"
        v-if-granted:for="['object-model/update', $view]"
        ref="select"
        popper-class="component-picker-popover"
        filterable
        :disabled="disabled"
        :size="size"
        :placeholder="
            disabled
                ? $t('toolbar.no_transmute_object')
                : $t('toolbar.transmute_object')
        "
        v-model="componentId"
    >
        <el-option
            class="component-option"
            v-for="component in components"
            :key="component.componentId"
            :label="component.data.name"
            :value="component.componentId"
        >
            <component-icon
                size="small"
                :showPreview="false"
                :componentId="component.componentId"
            />
        </el-option>
    </el-select>
</template>
<script>
import jsonDeepCopy from "../../utils/json-deep-copy";
import ComponentIcon from "../component-icon/component-icon";
import app from "../../conf/app";
export default {
    name: "ComponentPicker",

    components: {
        ComponentIcon,
    },
    inject: ["$view"],
    props: {
        value: String,
        disabled: {
            Type: Boolean,
            default: false,
        },
        size: String,
    },

    computed: {
        componentId: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit("input", value);
            },
        },
        componentPicker_hasListTemplateGrant() {
            return this.$store.getters[`connectionMe/isGrantedForAll`](
                [
                    "board-alive/list-template",
                    "position-alive/create-front",
                    "position-alive/create-back",
                ],
                this.$view
            );
        },
        components() {
            try {
                const isBackground =
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ];
                let boardComponents = this.$store.getters[
                    `boardComponent/byLayer`
                ]({ isBackground }).map((item) => item.componentId);

                const components = jsonDeepCopy(
                    this.$store.getters[`componentAlive/asArray`]
                )
                    .sort((a, b) => {
                        const nameA = a?.data?.name || a.componentId;
                        const nameB = b?.data?.name || b.componentId;
                        return nameA.localeCompare(nameB);
                    })
                    .filter((item) => {
                        return (
                            boardComponents.includes(item._id) ||
                            this.componentPicker_hasListTemplateGrant ||
                            item._id == app.visualWorldComponent.VW_default
                        );
                    });

                if (this.disabled) {
                    return components;
                } else {
                    return components.filter(
                        (item) => item.data?.noObjectTransmutation !== true
                    );
                }
            } catch (e) {
                return [];
            }
        },
    },
};
</script>
<style scoped>
.component-picker >>> input {
    padding: 0 5px;
}
.component-option {
    padding: 4px;
    height: min-content;
}
.component-option >>> .component-summary {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
}
.component-icon >>> .component-summary-icon {
    cursor: pointer;
    margin-right: 4px;
    float: left;
}
</style>
<style>
.component-picker-popover {
    border: none !important;
}
.component-picker-popover .el-select-dropdown__item {
    line-height: 24px;
}
</style>
