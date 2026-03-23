<template>
    <div class="object-toolbar-color" v-if="areAllOverloadable">
        <color-picker
            class="board-toolbar-button"
            mode="background"
            v-model="background"
        />
        <color-picker
            class="board-toolbar-button"
            mode="outline"
            v-model="border"
        />
        <color-picker
            v-if="areAllOverloadableFont"
            class="board-toolbar-button"
            mode="font"
            v-model="font"
        />
    </div>
</template>
<script>
import ColorPicker from "../color-picker/color-picker.vue";
import { hasBeenRecentlyExecuted } from "../../utils/frequency-limit";
import app from "../../conf/app";
export default {
    name: "ObjectToolbarColor",
    inject: ["$view"],
    components: {
        ColorPicker,
    },
    computed: {
        // Component's data
        components() {
            const positionIds =
                this.$store.getters[`app/objectsInBoard/selectedPositionIds`];
            const componentIds = positionIds.map(
                (positionId) =>
                    this.$store.getters["positionAlive/byId"](positionId)
                        ?.componentId
            );
            return componentIds.map((componentId) =>
                this.$store.getters["componentAlive/byId"](componentId)
            );
        },
        areAllOverloadable() {
            const overloadables = this.components.map(
                (component) => component.data?.styleOverloadable
            );
            return overloadables.every((overloadable) => !!overloadable);
        },
        areAllOverloadableFont() {
            const overloadables = this.components.map(
                (component) => component.data?.styleOverloadableFont !== false
            );
            return overloadables.every((overloadable) => !!overloadable);
        },

        // Overload color settings
        // background, border, font are `null` if not set, `undefined` if different depending on the objects
        objectStyles() {
            const positionIds =
                this.$store.getters[`app/objectsInBoard/selectedPositionIds`];
            const objectIds = positionIds.map(
                (positionId) =>
                    this.$store.getters["positionAlive/byId"](positionId)
                        ?.objectId
            );
            const objectStyles = objectIds.map(
                (objectId) =>
                    this.$store.getters["object/byId"](objectId)?.protect
            );
            return objectStyles;
        },
        background: {
            get() {
                const objectValues = this.objectStyles.map(
                    (objectStyle) => objectStyle?.styleBackgroundColor
                );
                const sameObjectValue = objectValues.every(
                    (value) => value == objectValues[0]
                );
                if (!sameObjectValue) {
                    return undefined;
                }
                if (objectValues[0]) {
                    return objectValues[0];
                }
                const componentValues = this.components.map(
                    (component) => component.data?.styleBackgroundColor
                );
                const sameComponentValue = componentValues.every(
                    (value) => value == componentValues[0]
                );
                if (!sameComponentValue) {
                    return undefined;
                }
                return componentValues[0];
            },
            set(value) {
                this.setColor("styleBackgroundColor", value);
            },
        },
        border: {
            get() {
                const objectValues = this.objectStyles.map(
                    (objectStyle) => objectStyle?.styleOutlineColor
                );
                const sameObjectValue = objectValues.every(
                    (value) => value == objectValues[0]
                );
                if (!sameObjectValue) {
                    return undefined;
                }
                if (objectValues[0]) {
                    return objectValues[0];
                }
                const componentValues = this.components.map(
                    (component) => component.data?.styleOutlineColor
                );
                const sameComponentValue = componentValues.every(
                    (value) => value == componentValues[0]
                );
                if (!sameComponentValue) {
                    return undefined;
                }
                return componentValues[0];
            },
            set(value) {
                this.setColor("styleOutlineColor", value);
            },
        },
        font: {
            get() {
                const objectValues = this.objectStyles.map(
                    (objectStyle) => objectStyle?.styleColor
                );
                const sameObjectValue = objectValues.every(
                    (value) => value == objectValues[0]
                );
                if (!sameObjectValue) {
                    return undefined;
                }
                if (objectValues[0]) {
                    return objectValues[0];
                }
                const componentValues = this.components.map(
                    (component) => component.data?.styleColor
                );
                const sameComponentValue = componentValues.every(
                    (value) => value == componentValues[0]
                );
                if (!sameComponentValue) {
                    return undefined;
                }
                return componentValues[0];
            },
            set(value) {
                this.setColor("styleColor", value);
            },
        },
    },
    methods: {
        setColor(property, value) {
            if (
                hasBeenRecentlyExecuted(
                    "object-toolbar-color",
                    app.color_picker.delay
                )
            ) {
                return;
            }

            const objectIds = this.$store.getters[
                `app/objectsInBoard/selectedPositionIds`
            ].map((item) => {
                return this.$store.getters[`positionAlive/byId`](item).objectId;
            });

            this.$store.dispatch(`object/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                payload: objectIds.map((objectId) => {
                    return {
                        objectId,
                        protect: { [property]: value },
                    };
                }),
                reply: false,
            });
        },
    },
};
</script>
<style>
.object-toolbar-color {
    display: flex;
}
.object-toolbar-color .el-color-picker__trigger {
    border: none;
}
.object-toolbar-color .board-toolbar-button {
    margin: 6px 12px !important;
    padding: 0 !important;
}
</style>
