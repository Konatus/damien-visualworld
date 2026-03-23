<template>
    <div class="drawing-dock vw-card vw-flex-payload vw-flex-col">
        <color-picker mode="outline" v-model="color" />
        <el-dropdown
            trigger="click"
            @command="width = $event"
            placement="top-start"
        >
            <div class="drawing-dock-width vw-triangle">
                <img
                    :src="require(`../../assets/icons/link/width-icon.svg`)"
                    :alt="$t('draw.thickness')"
                />
            </div>
            <el-dropdown-menu slot="dropdown" class="drawing-dock-width-menu">
                <el-dropdown-item
                    class="drawing-dock-width-item vw-link-filter"
                    :class="{
                        'drawing-dock-width-selected':
                            availableWidth.value === width,
                    }"
                    v-for="availableWidth of availableWidths"
                    :key="availableWidth.value"
                    :command="availableWidth.value"
                >
                    <img
                        :src="
                            require(`../../assets/icons/link/${availableWidth.icon}`)
                        "
                        :alt="availableWidth.value"
                    />
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <el-button
            class="vw-link-filter"
            :class="{
                'drawing-dock-eraser': true,
                'drawing-dock-eraser-selected': eraser,
            }"
            @click="eraser = !eraser"
        >
            <img
                src="../../assets/icons/cursor/eraser.svg"
                :alt="$t('draw.eraser')"
            />
        </el-button>
    </div>
</template>
<script>
import app from "../../conf/app";
import ColorPicker from "../color-picker/color-picker.vue";
export default {
    name: "DrawingDock",
    components: {
        ColorPicker,
    },
    computed: {
        availableColors() {
            return app.colors;
        },
        availableWidths() {
            return [
                { value: 5, icon: "width-option-xsmall.svg" },
                { value: 8, icon: "width-option-small.svg" },
                { value: 13, icon: "width-option-medium.svg" },
                { value: 21, icon: "width-option-large.svg" },
            ];
        },

        color: {
            get() {
                let res =
                    this.$store.getters[`app/objectsInBoard/drawingColor`];
                if (!res) {
                    res = this.availableColors[0];
                    this.$store.commit(`app/objectsInBoard/drawingColor`, res);
                }
                return res;
            },
            set(value) {
                return this.$store.commit(
                    `app/objectsInBoard/drawingColor`,
                    value
                );
            },
        },
        eraser: {
            get() {
                return this.$store.getters[`app/objectsInBoard/drawingEraser`];
            },
            set(value) {
                return this.$store.commit(
                    `app/objectsInBoard/drawingEraser`,
                    value
                );
            },
        },
        width: {
            get() {
                let res =
                    this.$store.getters[`app/objectsInBoard/drawingWidth`];
                if (!res) {
                    res = this.availableWidths[0].value;
                    this.$store.commit(`app/objectsInBoard/drawingWidth`, res);
                }
                return res;
            },
            set(value) {
                this.$store.commit(`app/objectsInBoard/drawingWidth`, value);
            },
        },
    },
};
</script>
<style>
.drawing-dock {
    padding: 5px 6px 5px 5px;
    top: 102px;
    position: fixed;
    margin: 0;
}
.drawing-dock > * {
    width: 28px;
    margin: 4px 7px 7px 4px;
}
.drawing-dock-width > img {
    width: 29px;
}
.drawing-dock-width > img:hover {
    cursor: pointer;
}
.drawing-dock-width.vw-triangle:before {
    right: -5px;
}
.drawing-dock-width-selected {
    background: #dedee2 !important;
}
.el-dropdown-menu.el-popper.drawing-dock-width-menu {
    margin-top: -1px;
    margin-left: 49px;
}
.drawing-dock-width-menu.el-popper .popper__arrow {
    display: none;
}
.drawing-dock-eraser {
    width: 33px;
    margin: 4px 0 4px 3.5px !important;
    padding: 0 !important;
    padding-top: 5px !important;
    padding-left: 1px !important;
    border-color: transparent !important;
}
.drawing-dock-eraser.el-button:hover {
    background: none;
}
.drawing-dock-eraser-selected {
    background: var(--style-color-main) !important;
}
.drawing-dock-eraser-selected > * {
    filter: brightness(1000);
}
</style>
