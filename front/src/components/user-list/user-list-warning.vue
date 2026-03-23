<template>
    <div>
        <template v-for="scope of warnScope">
            <i18n
                :key="scope"
                :title="$t('user_use_warning.title')"
                :closable="false"
                path="user_use_warning.warn"
                tag="el-alert"
                type="warning"
                show-icon
            >
                <template #grant> {{ scope }} </template>
                <template #supportMail>
                    <a :href="`mailto:${supportMail}`">{{ supportMail }}</a>
                </template>
            </i18n>
        </template>
    </div>
</template>

<script>
import UserListLimit from "./user-list-limit";
export default {
    name: "UserListWarning",

    mixins: [UserListLimit],

    props: {
        guest: Boolean,
    },

    computed: {
        warnScope() {
            let warnScope = [];
            if (this.userListLimit_guest && this.guest) {
                warnScope.push(this.$t("user_use_warning.guest"));
            }
            if (this.userListLimit && !this.guest) {
                warnScope.push(this.$t("user_use_warning.user"));
            }
            return warnScope;
        },
        supportMail() {
            return this.$store.state["connectionMe"].user.supportMail;
        },
    },
};
</script>
<style scoped>
.el-alert {
    margin-bottom: 5px;
}
</style>
