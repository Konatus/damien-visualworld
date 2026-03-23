<template>
    <div class="user-icon-reference" :class="grantClass">
        {{ initials }}
    </div>
</template>
<script>
export default {
    name: "UserIcon",
    props: {
        email: String,
    },
    inject: ["$view"],
    computed: {
        initials() {
            return this.$store.getters["connectionAll/initialsByEmail"](
                this.email
            );
        },
        grantClass() {
            return this.$store.getters["connectionAll/grantClassByEmail"](
                this.email,
                this.$view
            );
        },
    },
};
</script>
<style>
.user-icon-reference {
    --size: 30px;
    width: var(--size);
    height: var(--size);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    border: 2px solid var(--style-color-white);
    font-weight: 700;
    cursor: pointer;
}
</style>
