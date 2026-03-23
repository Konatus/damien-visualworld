<template>
    <div class="v--modal-box vue-dialog">
        <div class="dialog-content">
            <div class="dialog-c-title">{{ resolvedTitle }}</div>
            <div
                class="dialog-c-text"
                v-for="resolvedText of resolvedTexts"
                :key="resolvedText.id"
            >
                {{ resolvedText }}
            </div>
        </div>
        <div class="vue-dialog-buttons">
            <button
                v-for="button of buttons"
                :key="button.id"
                @click="onClick(button)"
                type="button"
                class="vue-dialog-button"
                :style="`flex: 1 1 ${100 / buttons.length}%;`"
            >
                {{ button.title }}
            </button>
        </div>
    </div>
</template>
<script>
export default {
    name: "ReactiveDialog",

    props: {
        title: Function,
        texts: Function,
        buttons: Array,
    },

    computed: {
        resolvedTitle() {
            return this.title();
        },
        resolvedTexts() {
            return this.texts();
        },
    },

    methods: {
        onClick({ handler }) {
            if (handler) {
                handler();
            }
            this.$emit("close");
        },
    },
};
</script>
