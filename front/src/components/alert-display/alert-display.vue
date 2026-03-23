<template>
    <div id="alert" v-if="alerts.length">
        <el-alert
            v-for="alert in alerts"
            :key="alert.id"
            :title="alert.title"
            :type="alert.type"
            :description="alert.description"
            @close="onClose(alert.id)"
            show-icon
        >
        </el-alert>
    </div>
</template>

<script>
export default {
    name: "AlertDisplay",
    computed: {
        alerts() {
            return this.$store.getters["alert/asArray"];
        },
    },
    methods: {
        onClose(payload) {
            setTimeout(() => {
                this.$store.commit("alert/remove", payload);
            }, 500);
        },
    },
};
</script>

<style>
#alert {
    top: 3px;
    position: relative;
    z-index: var(--nav-top-z-index);
}
</style>
