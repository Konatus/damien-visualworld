<template>
    <div class="vw-flex-payload vw-flex-col user-dock">
        <user-card v-for="user in userList" :key="user._id" :email="user._id" />
    </div>
</template>
<script>
import UserCard from "../user-card/user-card.vue";
export default {
    name: "UserDock",
    components: {
        UserCard,
    },
    computed: {
        userList() {
            const currentUserEmail = this.$store.getters["connectionMe/email"];
            return this.$store.getters["connectionAll/asArray"]
                .filter((connection) => connection._id !== currentUserEmail)
                .sort(
                    (a, b) =>
                        a.data.identity.connected - b.data.identity.connected
                );
        },
    },
};
</script>
