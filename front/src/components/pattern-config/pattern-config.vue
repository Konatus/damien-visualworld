<template>
    <div id="pattern-config" :class="[theme]">
        <el-button
            size="mini"
            class="modal-btn-close"
            icon="el-icon-close"
            type="info"
            @click="doCloseModal"
        />

        <div :class="['title', tabPosition]">
            <slot name="title" />
        </div>

        <el-tabs :tab-position="tabPosition">
            <slot />
        </el-tabs>

        <div class="buttons">
            <slot name="buttons" />
        </div>
    </div>
</template>
<script>
const LEFT = "left";
const RIGHT = "right";

const DARK = "dark";
const LIGHT = "light";

import VueModalFinder from "../../utils/vue-modal-finder";
export default {
    name: "PatternConfig",
    props: {
        tabPosition: {
            type: String,
            default: LEFT,
            validator(value) {
                return [LEFT, RIGHT].indexOf(value) !== -1;
            },
        },
        theme: {
            type: String,
            default: DARK,
            validator(value) {
                return [DARK, LIGHT].indexOf(value) !== -1;
            },
        },
    },
    methods: {
        doCloseModal() {
            VueModalFinder(this, (_, modalChild) => {
                modalChild.$emit("close");
            });
        },
    },
};
</script>
<style>
:root {
    --header-width: 25%;

    --title-height: 70px;
    --header-buttons-margin: 1em;
    --buttons-height: 33%;
}

/* General display */
.modal {
    padding-bottom: 0 !important;
}
.modal > div,
#pattern-config .el-tabs {
    height: 100%;
}
#pattern-config .el-tabs {
    display: flex;
}
#pattern-config .el-tabs--left {
    flex-direction: row;
}
#pattern-config .el-tabs--right {
    flex-direction: row-reverse;
}
#pattern-config .title,
#pattern-config .el-tabs__header {
    width: var(--header-width);
    margin: 0;
}
#pattern-config .el-tabs__content {
    width: calc(100% - var(--header-width));
    padding: 30px 65px 30px 45px;
    overflow-y: scroll;
    box-sizing: border-box;
}

/* Split title, tab-header & button zones */
#pattern-config .title.left {
    left: 0;
}
#pattern-config .title.right {
    right: 60px;
    width: 190px;
}
#pattern-config .el-tabs__nav-prev {
    top: var(--title-height);
}
#pattern-config .el-tabs__nav-scroll {
    margin-top: var(--title-height);
    height: calc(
        100% - var(--title-height) - var(--buttons-height) -
            var(--header-buttons-margin)
    );
    border: 1px solid;
}
#pattern-config .el-tabs__active-bar {
    width: 4px;
}
#pattern-config .is-left > .el-tabs__nav-scroll {
    margin-right: 3px;
}
#pattern-config .is-right.el-tabs__nav-scroll {
    margin-left: 3px;
}
#pattern-config .el-tabs__nav-next {
    bottom: calc(var(--buttons-height));
}
#pattern-config .buttons {
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: var(--header-width);
    height: var(--buttons-height);
    text-align: center;
}
#pattern-config .buttons > button {
    margin: 0;
}

#pattern-config .buttons .el-button:hover {
    background: #fff !important;
}

/* Title display */
#pattern-config .title {
    position: absolute;
    top: 0;
    z-index: 1;
    height: var(--title-height);

    /* Self position */
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: flex-start;
    padding: 6px 10px 6px 15px;

    /* Content */
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    margin: auto;
}

#pattern-config .title .item-name {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    text-transform: none;
}

/* Tab headers display */
#pattern-config .el-tabs__item {
    font-size: 0.8em;
    font-weight: 600;
}

/* Shared colours */
#pattern-config.dark .title {
    color: #aeb1bb;
}

/* Dark colours */
#pattern-config.dark .el-tabs__header {
    background: var(--style-color-main) !important;
}
#pattern-config.dark .el-tabs__item,
#pattern-config.dark .el-tabs__item:hover {
    color: white;
}
#pattern-config.dark .el-tabs__item.is-active {
    background: #171e36;
}
#pattern-config.dark .el-tabs__active-bar {
    background: #aeb1bb;
}
#pattern-config.dark .el-tabs__nav-scroll {
    border-color: #171e36;
}
#pattern-config.dark .el-tabs__nav-wrap::after {
    display: none;
}

/* Light colours */
#pattern-config.light .el-tabs__header {
    background: white !important;
}
#pattern-config.light .el-tabs__item,
#pattern-config.light .el-tabs__item:hover {
    color: black;
}
#pattern-config.light .el-tabs__item.is-active {
    background: #f7f7f7;
}
#pattern-config.light .el-tabs__active-bar {
    background: var(--style-color-main) !important;
}
#pattern-config.light .el-tabs__nav-scroll {
    border-color: transparent;
}

#pattern-config .el-button--default:hover {
    background: none;
}

#pattern-config .el-button--default.is-disabled:hover {
    color: #aeb1bb !important;
}
</style>
<style scoped>
.modal-btn-close {
    z-index: var(--max-z-index);
}
</style>
