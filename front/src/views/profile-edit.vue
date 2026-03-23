<template>
    <div id="profile-edit">
        <div>
            <h2>
                {{ $t("user_profile.personal_information") }}
            </h2>
        </div>

        <el-form
            label-width="100px"
            :model="user"
            class="form-profile"
            :rules="rules"
            ref="ruleForm"
        >
            <el-form-item :label="$t('user_profile.email')">
                <el-input disabled v-model="user.email"></el-input>
            </el-form-item>
            <el-form-item
                prop="firstname"
                :label="$t('user_profile.firstname')"
            >
                <el-input v-model="user.firstname"></el-input>
            </el-form-item>
            <el-form-item prop="lastname" :label="$t('user_profile.lastname')">
                <el-input v-model="user.lastname"></el-input>
            </el-form-item>
            <el-form-item
                prop="locale"
                :label="$t('user_profile.locale')"
                id="profile-locale"
            >
                <el-radio-group
                    v-model="user.locale"
                    size="small"
                    :label="$t('user_profile.firstname')"
                >
                    <el-radio-button label="fr">Fr</el-radio-button>
                    <el-radio-button label="en">En</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item id="profile-btn">
                <el-button
                    size="small "
                    type="primary"
                    @click="onSubmit('ruleForm')"
                    >{{ $t("user_profile.edit") }}</el-button
                >
                <el-button size="small" @click="reset">{{
                    $t("user_profile.cancel")
                }}</el-button>
            </el-form-item>
            <el-alert
                v-if="error"
                :title="$t('user_profile.error')"
                type="error"
                effect="dark"
                :closable="false"
            ></el-alert>

            <div style="text-align: center">
                <a v-if="resetPasswordUrl" :href="resetPasswordUrl">{{
                    $t("user_profile.forgot_password")
                }}</a>
                <a v-if="tokenUrl" :href="tokenUrl">{{
                    $t("user.get_token")
                }}</a>
            </div>
        </el-form>
    </div>
</template>

<script>
import jsonDeepCopy from "../utils/json-deep-copy";
import Url from "../conf/url";
export default {
    name: "ProfileEdit",

    props: {
        worldId: String,
    },
    data() {
        return {
            user: jsonDeepCopy(this.$store.state["connectionMe"].user.identity),
            rules: {
                locale: [
                    {
                        required: true,
                        message: this.$t("user_profile.required_locale"),
                        trigger: "blur",
                    },
                ],
                firstname: [
                    {
                        required: true,
                        message: this.$t("user_profile.required_firstname"),
                        trigger: "change",
                    },
                ],
                lastname: [
                    {
                        required: true,
                        message: this.$t("user_profile.required_lastname"),
                        trigger: "change",
                    },
                ],
            },
            error: false,
        };
    },

    computed: {
        tokenUrl() {
            return this.$store.state["connectionMe"].user?.tokenUrl;
        },
        resetPasswordUrl() {
            return this.$store.state["connectionMe"].user?.resetPasswordUrl;
        },
    },
    created() {
        if (this.user.locale == undefined) {
            this.$set(
                this.user,
                "locale",
                (navigator.languages && navigator.languages.length
                    ? navigator.languages[0]
                    : navigator.language
                ).split("-")[0]
            );
        }
    },
    methods: {
        reset() {
            const identity = jsonDeepCopy(
                this.$store.state["connectionMe"].user.identity
            );
            this.user.email = identity.email;
            this.user.firstname = identity.firstname;
            this.user.lastname = identity.lastname;
            if (identity.locale) {
                this.user.locale = identity.locale;
            }
        },
        onSubmit(formName) {
            this.error = false;
            this.$refs[formName].validate(async (valid) => {
                if (valid) {
                    const editProfile = await fetch(
                        Url.profile({
                            worldId: this.worldId,
                        }),
                        {
                            method: "PUT",
                            headers: new Headers({
                                "Content-Type": "application/json",
                            }),
                            body: JSON.stringify(this.user),
                        }
                    );

                    if (editProfile.status == "204") {
                        const LOCAL_DOMAINS = "localhost";
                        if (window.location.hostname != LOCAL_DOMAINS) {
                            window.location.href = `/oauth2/sign_in?rd=${this.$route.path}`;
                        }
                    } else {
                        this.error = true;
                    }
                } else {
                    return false;
                }
            });
        },
    },
};
</script>

<style scoped>
h2 {
    text-transform: uppercase;
    color: #aeb1bb;
    font-size: 16px;
    margin-bottom: 30px;
}
#profile-edit {
    padding: 20px;
}
#profile-locale >>> .el-form-item__content {
    display: flex;
}
#profile-locale >>> .el-form-item__content div:first-child {
    flex: auto;
}

#profile-btn {
    display: flex;
    justify-content: center;
}
#profile-btn >>> div.el-form-item__content {
    margin-left: 0 !important;
}
#get-token {
    bottom: 7%;
    position: fixed;
}
a {
    font-size: 14px;
    line-height: 2;
    display: block;
}
a:hover {
    color: var(--style-color-lightblue);
}
.el-alert.el-alert--error {
    margin-bottom: 20px;
}
</style>
