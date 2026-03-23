<template>
    <div class="vw-flex-col">
        <div class="vw-flex-row vw-flew-center user-card-line">
            <user-icon :style="{ alignSelf: 'center' }" :email="email" />
            <div class="vw-flex-payload vw-flex-col">
                <div class="user-card-name">{{ fullname }}</div>
                <div class="user-card-info" v-if="displayEmail">
                    {{ email }}
                </div>
                <div class="user-card-info">{{ grantLevel }}</div>
            </div>
            <el-button
                v-if="!myUrl && $view.worldId && $view.boardId && email"
                class="user-icon-goto vw-link-color"
                size="small"
                :disabled="userCardGoto_requested"
                @click="userCardGoto_onRequest"
            >
                {{ $t("user.joinUserScreen") }}
            </el-button>
        </div>
        <el-button
            size="small"
            class="vw-link-color vw-link-filter"
            @click="openEdiProfile"
        >
            <i class="el-icon-user"></i>
            <span> {{ $t("user_profile.edit_profile") }} </span>
        </el-button>
        <div
            class="vw-flex-col vw-flew-center user-card-line user-card-links"
            v-if="myUrl"
        >
            <el-link
                class="vw-link-color vw-link-filter user-card-logout"
                v-if="myUrl.signoutUrl"
                :href="myUrl.signoutUrl"
                :underline="false"
            >
                <img
                    src="../../assets/icons/sign-out.svg"
                    :alt="$t('user.sign_out')"
                />
                <span>{{ $t("user.sign_out") }}</span>
            </el-link>
        </div>
    </div>
</template>
<script>
import userIcon from "../user-icon/user-icon.vue";
import UserCardGoto from "./user-card-goto.vue";
import ProfileEdit from "../../views/profile-edit";
import app from "../../conf/app";
export default {
    name: "UserCard",
    components: {
        userIcon,
    },
    mixins: [UserCardGoto],
    props: {
        email: String,
        displayEmail: Boolean,
    },
    inject: ["$view"],
    computed: {
        fullname() {
            return this.$store.getters["connectionAll/fullnameByEmail"](
                this.email
            );
        },
        grantLevel() {
            const grantClass = this.$store.getters[
                "connectionAll/grantClassByEmail"
            ](this.email, this.$view);
            const grantName = {
                "user-icon-root": "root",
                "user-icon-ow": "owner",
                "user-icon-wm": "administrator",
                "user-icon-cm": "modeler",
                "user-icon-bm": "animator",
                "user-icon-su": "participant",
                "user-icon-so": "observer",
            }[grantClass];
            if (grantName) {
                return this.$t(`user.grant_level.${grantName}`);
            } else {
                return "";
            }
        },
        myUrl() {
            return this.email === this.$store.getters["connectionMe/email"]
                ? this.$store.state["connectionMe"].user
                : undefined;
        },
    },
    methods: {
        openEdiProfile() {
            this.$modal.show(
                ProfileEdit,
                {
                    worldId: this.$view.worldId,
                },
                app.modal.parameters_profile_edit,
                {
                    "before-close": () => document.activeElement.blur(),
                }
            );
        },
    },
};
</script>
<style>
.user-card-line {
    margin: 8px;
}
.user-card-line > * {
    margin-right: 8px;
}
.user-card-name {
    font-weight: 700;
}
.user-card-info,
.user-card-links {
    font-size: 80%;
}
.user-card-logout svg {
    width: 18px;
    height: auto;
}
.user-card-line .el-link {
    justify-content: left;
}
.user-card-line .el-link--inner {
    display: flex;
    align-content: center;
}
.user-icon-goto.el-button:hover {
    background: none;
}
</style>
