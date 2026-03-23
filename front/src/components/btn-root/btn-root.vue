<template>
    <div class="vw-flex-col vw-flex-center" v-show-granted:root>
        <el-button
            class="btn-root"
            :title="isDebugMode ? 'DEBUG IS ON' : 'DEBUG IS OFF'"
            :style="{
                background: isDebugMode ? 'var(--style-color-main)' : 'inherit',
            }"
            icon="el-icon-bangzhu"
            circle
            @click="onDebugClick"
        />
        <el-button
            class="btn-root"
            title="ROOT LOG"
            icon="el-icon-takeaway-box"
            circle
            @click="onLogClick"
        />
    </div>
</template>
<script>
import app from "../../conf/app";
import ReactiveDialog from "../../lib/reactive-dialog.vue";
export default {
    name: "BtnRoot",
    computed: {
        isDebugMode() {
            return this.$store.getters[`root/isDebugMode`];
        },
    },
    methods: {
        onDebugClick() {
            this.$store.commit(`root/debugMode`, !this.isDebugMode);
        },
        onLogClick() {
            this.$modal.show(
                ReactiveDialog,
                {
                    title: () => "ROOT LOG",
                    texts: () => this.$store.getters[`root/log`],
                    buttons: [
                        {
                            title: this.$t("modal.ok"),
                            default: true,
                        },
                    ],
                },
                app.modal.parameters
            );
        },
    },
};
</script>
<style scoped>
.btn-root {
    padding: 10px !important;
    margin-left: 0 !important;
}
.btn-root:hover {
    color: var(--style-color-lightblue) !important;
    border-color: var(--style-color-lightblue) !important;
}
</style>
