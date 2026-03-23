<template>
    <a :href="pricingUrl">
        <el-button type="success" :size="size">{{
            $t("buy_world.btn")
        }}</el-button>
    </a>
</template>

<script>
export default {
    name: "btnBuyWorld",
    props: {
        size: String,
    },
    computed: {
        pricingUrl() {
            return this.$store.state["connectionMe"].user.pricingUrl;
        },
    },
};
</script>
