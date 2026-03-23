<template>
    <el-popover
        placement="right"
        trigger="hover"
        class="user-icon"
        popper-class="user-icon-popover"
        :visible-arrow="false"
    >
        <user-icon id="btn-connection-me" slot="reference" :email="email" />
        <user-card :email="email" :displayEmail="true" />
    </el-popover>
</template>
<script>
import UserCard from "../user-card/user-card.vue";
import UserIcon from "../user-icon/user-icon.vue";
export default {
    name: "BtnConnectionMe",
    components: {
        UserCard,
        UserIcon,
    },
    computed: {
        email() {
            return this.$store.getters["connectionMe/email"];
        },
    },
};
</script>
<style>
#btn-connection-me {
    --size: 36px;
    width: var(--size);
    height: var(--size);
    margin-top: 6px;
    font-size: 15px;
}
</style>
