<template>
    <div id="modal-world-data" class="modal-data">
        <div id="data-header" class="modal-header">
            <span class="modal-title">{{
                $t("users_parameters.guestLink.title")
            }}</span>
        </div>

        <el-table id="user-invitation-link" size="mini" :data="user">
            <el-table-column
                sortable
                property="email"
                :label="$t('users_parameters.guestLink.email')"
            />

            <el-table-column
                sortable
                property="guestUrl"
                :label="$t('users_parameters.guestLink.guestUrl')"
            />
        </el-table>

        <div class="buttons">
            <el-button size="small" @click="onSubmit">{{
                $t("modal.ok")
            }}</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "UserInvitationLinks",

    props: {
        user: Array,
    },

    methods: {
        onSubmit() {
            this.$emit("close");
        },
    },
};
</script>
