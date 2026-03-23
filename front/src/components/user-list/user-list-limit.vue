<script>
export default {
    name: "UserListLimit",

    inject: ["$view"],

    computed: {
        userListLimit() {
            try {
                return this.$store.getters["worldUse/byId"](this.$view.worldId)
                    .limitReached.user;
            } catch (e) {
                return false;
            }
        },
        userListLimit_guest() {
            try {
                return this.$store.getters["worldUse/byId"](
                    this.$view.worldId
                ).limitReached.guest.includes(this.$view.boardId);
            } catch (error) {
                return false;
            }
        },
        userBoardGrantLength() {
            try {
                return this.$store.getters["worldUse/byId"](this.$view.worldId)
                    .boardGrantLength;
            } catch (e) {
                return {};
            }
        },
    },
};
</script>
