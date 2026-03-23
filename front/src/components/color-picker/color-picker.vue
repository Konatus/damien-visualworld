<template>
    <div class="color-picker" :class="colorPickerClass">
        <label v-if="label" class="el-form-item__label">
            {{ label }}
        </label>
        <el-color-picker
            class="vw-link-color color-picker-original vw-triangle"
            popper-class="color-picker-dropdown"
            color-format="rgb"
            size="mini"
            ref="native"
            show-alpha
            :data-color="$t('links.color')"
            :predefine="colors"
            :value="myColor"
            @active-change="onChange"
            @change="onChange"
        />
        <div
            class="color-picker-font-char"
            :style="{ color: myColor }"
            v-if="isFont"
        >
            A
        </div>
    </div>
</template>
<script>
const BACKGROUND = "background";
const OUTLINE = "outline";
const FONT = "font";
const LINK = "link";
import app from "../../conf/app";
import colorParser from "element-ui/packages/color-picker/src/color";
import { hasBeenRecentlyExecuted } from "../../utils/frequency-limit";
export default {
    name: "ColorPicker",
    props: {
        label: String,
        value: String,
        mode: {
            type: String,
            default: "",
            validator(value) {
                return ["", BACKGROUND, OUTLINE, FONT, LINK].includes(value);
            },
        },
    },
    computed: {
        colorPickerClass() {
            return (
                {
                    [BACKGROUND]: "color-picker-background",
                    [OUTLINE]: "color-picker-outline",
                    [FONT]: "color-picker-font",
                    [LINK]: "color-picker-link",
                }[this.mode] || ""
            );
        },
        colors() {
            return app.colors;
        },
        isFont() {
            return this.mode === FONT;
        },
    },
    data() {
        return {
            myColor: this.value,
            elColorSvpanel: document.querySelector(".el-color-svpanel"),
        };
    },
    watch: {
        value(value) {
            this.myColor = value;
        },
    },
    methods: {
        onChange(value) {
            // Limiting the Number of Requests to API
            if (
                !hasBeenRecentlyExecuted("color-picker", app.color_picker.delay)
            ) {
                if (
                    this.myColor == "#00000000" ||
                    this.myColor == "rgba(0, 0, 0, 0)"
                ) {
                    const colorParserInstance = new colorParser({
                        enableAlpha: false,
                    });
                    colorParserInstance.fromString(value);
                    value = colorParserInstance.value; // alpha = 100
                }

                this.$emit("input", value);
            }
        },
    },
};
</script>
<style>
.el-color-dropdown.color-picker-dropdown {
    margin-left: 122px;
    margin-top: 4px;
}

.el-color-dropdown.color-picker-dropdown,
.el-color-dropdown .el-color-alpha-slider {
    width: 355px;
}

.el-color-dropdown .el-color-svpanel {
    width: 337px;
}

.el-color-dropdown.color-picker-dropdown > .el-color-predefine {
    width: 370px;
}

.el-color-predefine__color-selector:nth-child(1n) {
    margin-left: 8px !important;
}

.el-color-predefine__color-selector:nth-child(0n + 1),
.el-color-predefine__color-selector:nth-child(0n + 14),
.el-color-predefine__color-selector:nth-child(0n + 27) {
    margin-left: 0px !important;
}

.el-color-predefine__color-selector:nth-child(0n + 14) {
    border: 1px solid rgba(147, 154, 169, 0.2);
    box-sizing: border-box;
}

.color-picker {
    position: relative; /* allows absolute position of color-picker-font-char */
}
.color-picker .el-color-picker__icon,
.color-picker .el-color-picker__empty {
    display: none;
}
.color-picker-original .el-color-picker__trigger {
    border: none;
}
.color-picker .vw-triangle:before {
    bottom: -7px;
    right: -4px;
}

.color-picker-background .el-color-picker__color,
.color-picker-background .el-color-picker__color-inner {
    border-radius: 100%;
}

.color-picker-outline .el-color-picker__color,
.color-picker-outline .el-color-picker__color-inner {
    border-radius: 100%;
}
.color-picker-outline .color-picker-original:after {
    pointer-events: none;
    content: " ";
    position: absolute;
    left: 10px;
    top: 10px;
    right: 10px;
    bottom: 10px;
    border-radius: 100%;
    background: white;
    border: 1px solid grey;
    display: flex;
    justify-content: center;
    align-items: center;
}

:root {
    --color-picker-font-height: 6px;
    --color-picker-font-offset: 3px;
}
.color-picker-font .el-color-picker__color {
    top: calc(
        100% - var(--color-picker-font-height) + var(--color-picker-font-offset)
    );
    height: var(--color-picker-font-height);
}
.color-picker-font .color-picker-font-char {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: var(--color-picker-font-height);
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    pointer-events: none;
    text-shadow: 0 0 1px black;
}
</style>
