<template>
    <el-form
        ref="userRules"
        class="user-form"
        :inline="true"
        :model="user"
        :rules="rules"
        @submit.prevent.native
    >
        <el-button
            id="btn-cancel-user-edit"
            icon="el-icon-close"
            v-if="enabled"
            @click="onCancel"
        />
        <span id="user-form-title">
            {{
                $t(
                    guest === true
                        ? "users_parameters.iWantToInvite"
                        : "users_parameters.iWantToAdd"
                )
            }}
        </span>

        <el-form-item class="user-checkbox">
            <template v-for="(value, grant) in grants">
                <el-checkbox-group
                    :key="grant"
                    :fill="grantColor[grant]"
                    v-model="grants[grant]"
                    @input="onInput(grant)"
                >
                    <el-checkbox-button
                        class="el-checkbox-button--small"
                        :label="$t(`user.grant_level.${grant}`)"
                        :disabled="
                            (guest ? userListLimit_guest : userListLimit) ||
                            isDemoAdministrator
                        "
                    />
                </el-checkbox-group>
            </template>
        </el-form-item>
        <el-alert
            v-if="isDemoAdministrator"
            :title="$t('users_parameters.demoWarning')"
            type="warning"
            center
            :closable="false"
            show-icon
        >
        </el-alert>
        <div v-if="enabled">
            <div class="user-input">
                <span>{{ $t("users_parameters.addUserTitle") }}</span>
                <el-form-item prop="email">
                    <el-input
                        :rows="2"
                        size="mini"
                        type="textarea"
                        v-model="user.email"
                        @focus="focus = true"
                        @blur="focus = false"
                        :maxlength="
                            displayLimite.limiteUsed >=
                                displayLimite.limiteMax &&
                            /[ ;]+$/.test(user.email)
                                ? user.email && user.email.length
                                : null
                        "
                    /><!-- TODO: press enter should not cause a page refresh -->
                    <div
                        style="float: right"
                        :style="{
                            color:
                                displayLimite.limiteUsed >=
                                displayLimite.limiteMax
                                    ? '#F56C6C'
                                    : 'inherit',
                        }"
                    >
                        {{
                            displayLimite.limiteUsed +
                            " / " +
                            displayLimite.limiteMax +
                            " " +
                            $tc(
                                `user_use_warning.${
                                    guest ? "guests" : "users"
                                }`,
                                displayLimite.limiteMax
                            )
                        }}
                    </div>
                </el-form-item>
            </div>
            <div class="user-input" v-if="guest === true">
                <span>{{ $t("users_parameters.guestUntil") }}</span>
                <el-form-item prop="guestUntil">
                    <el-date-picker
                        popper-class="guest-until"
                        type="datetime"
                        default-time="23:59:59"
                        v-model="guestUntil"
                        :picker-options="guestUntilOptions"
                    />
                </el-form-item>
            </div>
            <div id="user-validate">
                <el-button
                    size="small"
                    type="success"
                    @click="onCreate('userRules')"
                    :disabled="!submittable || (!guestUntil && guest)"
                >
                    {{ $t("users_parameters.addUserValidate") }}
                </el-button>
            </div>
        </div>
    </el-form>
</template>

<script>
import app from "../../conf/app";
import Url from "../../conf/url";
import dayjs from "../../utils/dayjs";
import UserInvitationLinks from "./user-invitation-links";
import UserListLimit from "../user-list/user-list-limit";
export default {
    name: "UserInvitation",

    mixins: [UserListLimit],

    props: {
        guest: Boolean,
    },
    inject: ["$view"],

    data() {
        const grants = !this.$view.boardId
            ? {
                  modeler: false,
                  administrator: false,
              }
            : !this.guest
            ? {
                  observer: false,
                  participant: false,
                  animator: false,
              }
            : {
                  observer: false,
                  participant: false,
              };
        return {
            grants,
            user: {},
            guestUntil: null,
            submittable: false,
            focus: false,
            usersAdded: 0,
        };
    },

    computed: {
        grantColor() {
            return app.grantColor;
        },

        // Regexp that will be used to split emails
        splitRegexp() {
            return /[ ;]+/;
        },

        // Is the invitation form enabled?
        // id: at least one grant is selected
        enabled() {
            return Object.values(this.grants).filter((x) => !!x).length;
        },

        // Validation rules of the invitation form
        rules() {
            return {
                email: {
                    validator: (rule, value, callback) => {
                        this.submittable = true;

                        if (!value) {
                            this.submittable = false;
                            this.usersAdded = 0;
                            callback(
                                new Error(
                                    this.$i18n.t("world.user.required_email")
                                )
                            );
                        } else {
                            const requestedEmails = value
                                .split(this.splitRegexp)
                                .map((email) => email.toLowerCase().trim());
                            const malformedEmail = requestedEmails.filter(
                                (email) =>
                                    email &&
                                    !email.match(
                                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                                    )
                            );
                            if (malformedEmail.length) {
                                this.submittable = false;
                                if (!this.focus) {
                                    callback(
                                        new Error(
                                            this.$i18n.t(
                                                "world.user.wrong_email",
                                                {
                                                    email: malformedEmail.join(
                                                        ", "
                                                    ),
                                                }
                                            )
                                        )
                                    );
                                }
                            }

                            const usedEmails = this.$store.getters[
                                "userAlive/asArray"
                            ].map((user) => user.data.email);
                            const alreadyUsedEmail = requestedEmails.filter(
                                (email) => usedEmails.includes(email)
                            );
                            if (alreadyUsedEmail.length) {
                                this.submittable = false;
                                callback(
                                    new Error(
                                        this.$i18n.t("world.user.used_email", {
                                            email: alreadyUsedEmail.join(", "),
                                        })
                                    )
                                );
                            }

                            this.usersAdded =
                                requestedEmails.filter((item) => item).length -
                                malformedEmail.length;
                        }
                        if (
                            this.displayLimite.limiteUsed >
                            this.displayLimite.limiteMax
                        ) {
                            this.submittable = false;
                        }
                    },
                    trigger: ["change", "blur"],
                },
                guestUntil: {
                    validator: (rule, value, callback) => {
                        if (!this.guestUntil) {
                            callback(
                                new Error(
                                    this.$i18n.t("world.user.required_date")
                                )
                            );
                        }
                    },
                    trigger: ["change", "blur"],
                },
            };
        },

        // Shortcuts for guestUntil date-time picker
        guestUntilOptions() {
            return {
                disabledDate: (time) => {
                    const today = new Date();
                    const startDate = today.setDate(today.getDate() - 1);
                    const endDate = today.setDate(today.getDate() + 8);

                    return !dayjs(time).isBetween(startDate, endDate);
                },
                shortcuts: [
                    {
                        text: this.$t("users_parameters.date.tonight"),
                        onClick(picker) {
                            picker.$emit(
                                "pick",
                                new Date().setHours(23, 59, 59, 999)
                            );
                        },
                    },
                    {
                        text: this.$t("users_parameters.date.tomorrow"),
                        onClick(picker) {
                            picker.$emit(
                                "pick",
                                new Date().setHours(23, 59, 59, 999) +
                                    3600 * 1000 * 24
                            );
                        },
                    },
                    {
                        text: this.$t("users_parameters.date.withinSevenDays"),
                        onClick(picker) {
                            picker.$emit(
                                "pick",
                                new Date().setHours(23, 59, 59, 999) +
                                    3600 * 1000 * 24 * 7
                            );
                        },
                    },
                ],
            };
        },

        isDemoAdministrator() {
            return this.$store.getters[`connectionMe/isDemoAdministrator`](
                this.$view
            );
        },
        userGrant() {
            return this.$store.getters[
                `grant/${this.$view.boardId ? "board" : "world"}/asArray`
            ];
        },
        limites() {
            return this.$store.getters["worldUse/byId"](this.$view.worldId);
        },
        displayLimite() {
            try {
                if (this.guest) {
                    return {
                        limiteUsed:
                            (this.limites.data.guest[this.$view.boardId] || 0) +
                            this.usersAdded,
                        limiteMax: this.limites.private.useMaxGuest,
                    };
                } else {
                    return {
                        limiteUsed: this.limites.data.user + this.usersAdded,
                        limiteMax: this.limites.private.useMaxUser,
                    };
                }
            } catch (error) {
                return {};
            }
        },
    },
    watch: {
        displayLimite(displayLimite) {
            this.submittable =
                displayLimite.limiteUsed <= displayLimite.limiteMax;
        },
    },
    methods: {
        // One or zero user profile may be selected, no more
        onInput(modifiedKey) {
            for (let key in this.grants) {
                if (key !== modifiedKey) {
                    this.grants[key] = false;
                }
            }
        },

        onCancel() {
            this.usersAdded = 0;
            this.doResetForm();
        },

        async onCreate() {
            if (!this.submittable) {
                return;
            }
            // Get data from the form
            let emails = [
                ...new Set(
                    this.user.email
                        .trim()
                        .split(this.splitRegexp)
                        .map((email) => {
                            if (this.guestUntil)
                                return {
                                    email: email.toLowerCase().trim(),
                                    guestUntil: new Date(this.guestUntil),
                                };
                            else return email.toLowerCase().trim();
                        })
                ),
            ];
            const grant = {
                data: this.grants,
                boardId: this.$view.boardId,
                collection: this.$view.boardId ? "BoardGrant" : "Grant",
            };

            let temporaryAccount = [];
            if (this.guest === true) {
                // Generate temporary accounts
                this.$store.commit("overlay/spinner", true);
                const temporaryAccountRequest = JSON.stringify(emails);
                const temporaryAccountResponse = await fetch(
                    Url.guest({
                        worldId: this.$view.worldId,
                        boardId: this.$view.boardId,
                    }),
                    {
                        method: "POST",
                        headers: new Headers({
                            "Content-Type": "application/json",
                            "Content-Length":
                                temporaryAccountRequest.length.toString(),
                        }),
                        body: temporaryAccountRequest,
                    }
                );
                temporaryAccount = await temporaryAccountResponse.json(); // TODO: manage errors, if response isnt a json
                temporaryAccount.forEach((account) => {
                    account.guestUrl = Url.guest(account);
                });
                this.$store.commit("overlay/spinner", false);

                // Show link access
                this.$modal.show(
                    UserInvitationLinks,
                    {
                        user: temporaryAccount,
                    },
                    app.modal.parameters
                );
            }
            const userTrashRestore = this.$store.getters[
                "userTrash/asArray"
            ].filter((user) => emails.includes(user.data.email));
            if (userTrashRestore) {
                this.usersAdded = 0;
                userTrashRestore.forEach((user) => {
                    const [grantId] = this.userGrant
                        .filter((grant) => grant.userId == user.userId)
                        .map((user) => user._id);
                    this.$store.dispatch(
                        `grant/${
                            this.$view.boardId ? "board" : "world"
                        }/update`,
                        {
                            worldId: this.$view.worldId,
                            boardId: this.$view.boardId, // may be null if grant is set at world level
                            grantId,
                            userId: user.userId,
                            data: grant.data,
                        }
                    );
                });
                this.$store.dispatch(`userTrash/restore`, {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data: userTrashRestore.map((user) => ({
                        _id: user.userId,
                    })),
                });
            }

            this.$store.dispatch(`userAlive/create`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data:
                    this.guest === true
                        ? temporaryAccount.map((account) => ({
                              email: account.email,
                              guestOriginalEmail: account.originalEmail,
                              guestToken: account.token,
                              guestUntil: new Date(this.guestUntil),
                          }))
                        : emails
                              .filter(
                                  (email) =>
                                      !userTrashRestore
                                          .map((user) => user.data.email)
                                          .includes(email)
                              )
                              .map((email) => ({ email })),
                grant,
            });
            this.doResetForm();
        },

        doResetForm() {
            this.user = {};
            for (let grant in this.grants) {
                this.grants[grant] = false;
            }
            this.$refs["userRules"].resetFields();
        },
    },
};
</script>

<style scoped>
.user-form {
    font-size: 14px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 100%;
    background: #f1f1f4;
    padding: 20px;
    border-bottom: 5px solid #dedee2;
    margin-bottom: 20px;
    box-sizing: border-box;
}

#btn-cancel-user-edit {
    position: absolute;
    right: 20px;
    top: 20px;
    height: 25px;
    width: 25px;
    padding: 0px;
}

.user-form >>> .el-checkbox-button .el-checkbox-button__inner {
    border-radius: var(--style-border-radius);
}

#user-form-title {
    text-align: center;
    /* color: var( --color-main-font ); */
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
}

.user-input {
    display: flex;
    flex-direction: column;
}

.user-input > span {
    color: #6d7385;
    font-size: 12px;
    margin-bottom: 10px;
}

.user-input >>> .el-form-item__content {
    width: 80%;
}

#user-validate {
    text-align: right;
}

.user-input >>> .el-input.is-disabled .el-input__inner {
    color: var(--style-color-main);
    opacity: 0.7;
}

.user-form .user-input {
    margin-left: 5vw;
}

.user-form .user-input,
.user-form >>> .user-checkbox > .el-form-item__content {
    display: flex;
    justify-content: center;
}

.user-checkbox >>> .el-checkbox-button {
    margin-left: 10px;
}

div >>> .el-form-item__error {
    position: relative;
    width: 150px;
}
.icons {
    display: flex;
    width: 50px;
    margin: 3px;
}
.icon {
    margin: 5px;
}
.icon > *:hover {
    cursor: pointer;
}
input {
    text-align: center;
}
</style>
