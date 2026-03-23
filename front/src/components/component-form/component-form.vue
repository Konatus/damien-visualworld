<!--
    This component provides colored header and border for a component model.
    Ce composant fournit un en-tête et une bordure colorés pour un composant spécifique.
-->
<template>
    <div
        :class="{
            'component-form': true,
            'component-form-component': isComponentEdit,
            'component-form-object': !isComponentEdit,
        }"
    >
        <div class="component-form-header" :style="header">
            <slot name="header" />
        </div>

        <slot name="default" />
    </div>
</template>
<script>
export default {
    name: "ComponentForm",

    props: {
        componentId: String,
        componentAsString: String,
    },
    inject: ["$view"],

    computed: {
        isComponentEdit() {
            return "componentId" in this.$view;
        },

        // Component retrieved with componentId prop
        component() {
            if (this.componentId) {
                return this.$store.getters[`componentAlive/byId`](
                    this.componentId
                );
            } else if (this.componentAsString) {
                return JSON.parse(this.componentAsString);
            } else {
                return undefined;
            }
        },

        // Style to be applied to the header
        header() {
            try {
                return {
                    backgroundColor: this.component.data?.styleBackgroundColor,
                    borderColor:
                        this.component.data?.styleOutlineColor || "transparent",
                    color: this.component.data?.styleColor,
                };
            } catch (e) {
                return {};
            }
        },
    },
};
</script>
<style scoped>
.component-form {
    margin-bottom: -1px;
}

.component-form-header {
    border-radius: var(--style-border-radius) var(--style-border-radius) 0 0;
    border-width: 0;
    border-bottom-width: 1px;
    border-style: solid;
    right: 0px;
    left: 0px;
    top: 0px;
    height: 38px;
    padding-top: 20px;
    padding-left: 30px;
    font-size: 15px;
}

.component-form-component > .component-form-header {
    margin: 20px;
    margin-bottom: 7px;
}
.component-form-object > .component-form-header {
    margin: 36px;
    margin-right: 100px;
    margin-bottom: 0;
}
</style>
