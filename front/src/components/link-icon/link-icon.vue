<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="conf.width"
        :height="conf.height"
        :viewBox="`0 0 ${conf.width / conf.scale} ${conf.height / conf.scale}`"
        v-if="cleanLinkModel"
    >
        <link-view
            :isSelectable="false"
            :isSelected="false"
            :linkId="cleanLinkModel.linkId || cleanLinkModel._id"
            :linkModelData="cleanLinkModel.data"
            :objectAndPosition="objectAndPosition"
        />
    </svg>
</template>
<script>
const MINI = "mini";
const SMALL = "small";
const LARGE = "large";
import linkView from "../link-view/link-view.vue";
export default {
    components: {
        linkView,
    },
    name: "LinkIcon",

    props: {
        linkModel: Object,
        linkModelId: String,
        size: {
            default: LARGE,
            validator(value) {
                if ([LARGE, SMALL, MINI].includes(value)) {
                    return true;
                }
                if (
                    value &&
                    Object.prototype.hasOwnProperty.call(value, "marginX") &&
                    Object.prototype.hasOwnProperty.call(value, "marginY") &&
                    Object.prototype.hasOwnProperty.call(value, "width") &&
                    Object.prototype.hasOwnProperty.call(value, "height") &&
                    Object.prototype.hasOwnProperty.call(value, "scale")
                ) {
                    return true;
                }
                return false;
            },
        },
    },
    inject: ["$view"],

    computed: {
        conf() {
            return (
                {
                    [MINI]: {
                        marginX: 8,
                        marginY: 4,
                        width: 35,
                        height: 35,
                        scale: 0.15,
                    },
                    [SMALL]: {
                        marginX: 50,
                        marginY: 20,
                        width: 250,
                        height: 138,
                        scale: 0.5,
                    },
                    [LARGE]: {
                        marginX: 100,
                        marginY: 100,
                        width: 450,
                        height: 400,
                        scale: 0.5,
                    },
                }[this.size] || this.size
            );
        },
        cleanLinkModel() {
            if (this.linkModel) {
                return this.linkModel;
            } else if (this.linkModelId) {
                return this.$store.getters[`linkModelAlive/byId`](
                    this.linkModelId
                );
            }
            return null;
        },
        objectAndPosition() {
            return [
                {
                    index: 0,
                    object: {
                        objectId: "0",
                        ...this.cleanLinkModel.data.anchors[0],
                    },
                    position: {
                        data: {
                            height: 0,
                            width: 0,
                            left: this.conf.marginX / this.conf.scale,
                            top: this.conf.marginY / this.conf.scale,
                        },
                    },
                },
                {
                    index: 1,
                    object: {
                        objectId: "1",
                        ...this.cleanLinkModel.data.anchors[1],
                    },
                    position: {
                        data: {
                            height: 0,
                            width: 0,
                            left:
                                (this.conf.width - this.conf.marginX) /
                                this.conf.scale,
                            top:
                                (this.conf.height - this.conf.marginY) /
                                this.conf.scale,
                        },
                    },
                },
            ];
        },
    },
};
</script>
<style scoped>
svg {
    background-color: var(--layer-background);
    overflow: visible;
    pointer-events: none;
    height: auto;
}
</style>
