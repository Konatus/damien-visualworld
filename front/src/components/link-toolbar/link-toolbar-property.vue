<template>
    <div>
        <el-submenu :index="conf.index">
            <template slot="title">
                <div class="board-toolbar-button vw-triangle">
                    <img
                        :src="require(`../../assets/icons/link/${conf.icon}`)"
                        :alt="conf.value"
                    />
                    <span v-if="label">{{ $t(conf.label) }}</span>
                </div>
            </template>
            <el-menu-item
                v-for="item of conf.list"
                :key="item.value"
                class="link-toolbar-property-item vw-link-filter"
                :class="{
                    'link-toolbar-property-selected':
                        computedValue === item.value,
                }"
                :style="conf.style"
                @click="computedValue = item.value"
            >
                <img
                    :src="require(`../../assets/icons/link/${item.icon}`)"
                    :alt="item.value"
                />
            </el-menu-item>
        </el-submenu>
    </div>
</template>
<script>
import app from "../../conf/app.js";
const CONF = {
    size: {
        index: "1",
        icon: "width-icon.svg",
        label: "links.thickness",
        path: "data.size",
        list: [
            {
                value: app.linkStyle.xSmall.size,
                icon: "width-option-xsmall.svg",
            },
            { value: app.linkStyle.small.size, icon: "width-option-small.svg" },
            {
                value: app.linkStyle.medium.size,
                icon: "width-option-medium.svg",
            },
            { value: app.linkStyle.large.size, icon: "width-option-large.svg" },
        ],
    },
    dash: {
        index: "2",
        icon: "style-icon.svg",
        label: "links.style",
        path: "data.dash",
        list: [
            { value: 0, icon: "style-option-solid.svg" },
            { value: 10, icon: "style-option-dotted.svg" },
            { value: 20, icon: "style-option-tight-dashed.svg" },
            { value: 30, icon: "style-option-spaced-dashed.svg" },
        ],
    },
    curve: {
        index: "3",
        icon: "curve-icon.svg",
        label: "links.form",
        path: "data.curve",
        list: [
            { value: 0, icon: "curve-option-straight.svg" },
            { value: 0.2, icon: "curve-option-gentle.svg" },
            { value: 0.6, icon: "curve-option-tight.svg" },
            { value: -1, icon: "curve-option-angular.svg" },
            { value: -2, icon: "curve-option-lightning.svg" },
        ],
    },
    "anchor-start": {
        index: "5",
        icon: "anchor-icon-left.svg",
        label: "links.link_start",
        path: "objects[0].data.type",
        list: [
            { value: "none", icon: "anchor-option-straight.svg" },
            { value: "arrow", icon: "anchor-option-arrow.svg" },
            { value: "triangle", icon: "anchor-option-triangle.svg" },
            { value: "circle", icon: "anchor-option-circle.svg" },
            { value: "square", icon: "anchor-option-square.svg" },
            { value: "rhombus", icon: "anchor-option-rhombus.svg" },
        ],
    },
    "anchor-end": {
        index: "6",
        icon: "anchor-icon-right.svg",
        label: "links.link_end",
        path: "objects[1].data.type",
        style: {
            transform: "scaleX(-1)",
        },
        list: [
            { value: "none", icon: "anchor-option-straight.svg" },
            { value: "arrow", icon: "anchor-option-arrow.svg" },
            { value: "triangle", icon: "anchor-option-triangle.svg" },
            { value: "circle", icon: "anchor-option-circle.svg" },
            { value: "square", icon: "anchor-option-square.svg" },
            { value: "rhombus", icon: "anchor-option-rhombus.svg" },
        ],
    },
};
import get from "lodash.get";
import set from "lodash.set";
export default {
    name: "LinkToolbarProperty",
    inject: ["$view"],
    props: {
        property: {
            type: String,
            validator(value) {
                return Object.keys(CONF).includes(value);
            },
        },
        value: {
            type: [Number, String],
        },
        label: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        conf() {
            return CONF[this.property];
        },
        computedValue: {
            get() {
                if (this.value !== undefined) {
                    // v-model use in component-model-edit
                    return this.value;
                } else {
                    // link-toolbar
                    const selectedLinks = this.$store.getters[
                        `app/objectsInBoard/selectedLinkIds`
                    ].map((linkId) =>
                        this.$store.getters[`linkAlive/byId`](linkId)
                    );
                    const values = selectedLinks.map((link) =>
                        get(link, this.conf.path)
                    );
                    const sameValue = values.every(
                        (value) => value == values[0]
                    );
                    return sameValue ? values[0] : false;
                }
            },
            set(value) {
                if (this.value !== undefined) {
                    // v-model use in component-model-edit
                    this.$emit("input", value);
                } else {
                    // link-toolbar
                    this.$store.getters[
                        `app/objectsInBoard/selectedLinkIds`
                    ].forEach((linkId) => {
                        this.$store.dispatch(
                            "linkAlive/update",
                            set(
                                {
                                    worldId: this.$view.worldId,
                                    boardId: this.$view.boardId,
                                    linkId,
                                    reply: false,
                                },
                                this.conf.path,
                                value
                            )
                        );
                    });
                }
            },
        },
    },
};
</script>
<style>
.link-toolbar-property-item {
    text-align: center;
}
.link-toolbar-property-selected {
    background: #dedee2 !important;
}
</style>
