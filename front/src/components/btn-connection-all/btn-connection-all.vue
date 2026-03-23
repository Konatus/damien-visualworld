<template>
    <div
        id="btn-connection-all"
        class="vw-flex-col vw-flex-center"
        v-if="userList.length"
    >
        <!-- Additional user count, displayed if the common one is overflowed -->
        <el-button
            size="small"
            slot="reference"
            class="btn-connection-all-overflow vw-link-filter"
            @mousedown.native.stop
            @touchstart.native.stop
            @click="onOverflowClick"
            circle
        >
            <span v-if="userListOverFlow"
                >+&hairsp;{{ 1 + userListOverFlow }}</span
            >
            <img
                v-else
                style="width: 100%"
                src="../../assets/icons/user.svg"
                :alt="$t('icon.users')"
            />
        </el-button>

        <!-- Common user list, always displayed -->
        <el-popover
            placement="right"
            trigger="hover"
            v-for="user in commonUserList"
            :key="user._id"
            :visible-arrow="false"
        >
            <user-icon slot="reference" :email="user._id" />
            <user-card :email="user._id" />
        </el-popover>
    </div>
</template>

<script>
const MAX_SHOW_USERS = 4;
import UserCard from "../user-card/user-card.vue";
import UserIcon from "../user-icon/user-icon.vue";
export default {
    name: "BtnConnectionAll",

    components: {
        UserCard,
        UserIcon,
    },

    computed: {
        // email of current user will be removed of user list
        emailMe() {
            try {
                return this.$store.state.connectionMe.user.identity.email;
            } catch (e) {
                return null;
            }
        },

        // Sorted full user list, last connected people on top
        userList() {
            return this.$store.getters["connectionAll/asArray"]
                .filter((connection) => connection._id !== this.emailMe)
                .sort(
                    (a, b) =>
                        a.data.identity.connected - b.data.identity.connected
                );
        },

        // Number of people in excess for the common user list
        userListOverFlow() {
            if (MAX_SHOW_USERS && this.userList.length - MAX_SHOW_USERS > 0) {
                return this.userList.length - MAX_SHOW_USERS;
            } else {
                return 0;
            }
        },

        // People displayed inside the common user list
        commonUserList() {
            if (this.userListOverFlow && MAX_SHOW_USERS) {
                return this.userList.slice(0, MAX_SHOW_USERS - 1);
            } else {
                return this.userList;
            }
        },
    },
    methods: {
        onOverflowClick() {
            if (this.$store.getters["app/objectsInBoard/drawerIsUser"]) {
                this.$store.commit("app/objectsInBoard/setDrawerNone");
            } else {
                this.$store.commit("app/objectsInBoard/setDrawerUser");
            }
        },
    },
};
</script>
<style>
:root {
    --btn-connection-all-child-size: 30px;
    --btn-connection-all-child-margin: 6px;
}
#btn-connection-all {
    padding-top: var(--btn-connection-all-child-margin);
}
.btn-connection-all-overflow,
#btn-connection-all .user-icon-reference {
    width: var(--btn-connection-all-child-size);
    height: var(--btn-connection-all-child-size);
    margin-top: calc(-1 * var(--btn-connection-all-child-margin));
}
.btn-connection-all-overflow {
    width: calc(
        var(--btn-connection-all-child-size) +
            var(--btn-connection-all-child-margin)
    );
    height: calc(
        var(--btn-connection-all-child-size) +
            var(--btn-connection-all-child-margin)
    );
    background: var(--style-color-white) !important;
    color: var(--style-color-main) !important;
    border-color: var(--style-color-main) !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
}
.btn-connection-all-overflow:hover {
    color: var(--style-color-lightblue) !important;
    border-color: var(--style-color-lightblue) !important;
}
</style>
