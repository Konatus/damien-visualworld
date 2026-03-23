<template>
    <div id="users">
        <user-list-warning :guest="guest" />

        <user-invitation :guest="guest" />

        <div id="users-header">
            <el-input
                size="small"
                prefix-icon="el-icon-search"
                :placeholder="$t('users_parameters.search')"
                v-model="search"
            />

            <el-button
                size="small"
                icon="el-icon-link"
                v-if="guest"
                @click="onShowGuestUrl"
                :disabled="!selection.length"
            >
                {{ $t("users_parameters.showUrlGuest") }}
            </el-button>

            <el-button
                v-if-granted:for="['user-alive/remove', $view]"
                v-if="grantLevel == 'world' || guest"
                size="small"
                icon="el-icon-delete"
                @click="onUserDelete"
                :disabled="!selection.length"
            >
                {{ $t("users_parameters.delete") }}
            </el-button>
        </div>

        <el-table
            :default-sort="{ prop: 'email', order: 'ascending' }"
            :row-class-name="tableRowClassName"
            id="users-list"
            size="mini"
            :data="userList"
            max-height="400"
            @selection-change="onSelectionChange"
        >
            <el-table-column
                type="selection"
                width="55"
                :selectable="selectable"
                v-if-granted:forOne="[
                    'user-alive/remove',
                    'guest/remove',
                    $view,
                ]"
                v-if="grantLevel == 'world' || guest"
            />

            <el-table-column
                sortable
                :property="guest ? 'guestOriginalEmail' : 'email'"
                min-width="250"
                :label="$t('users_parameters.email')"
            />

            <el-table-column
                sortable
                :sort-method="sortGrant"
                :min-width="guest ? 210 : 320"
                class-name="user-list-grants"
                :label="$t(`users_parameters.${grantLevel}Grant`)"
            >
                <template slot-scope="scope">
                    <div
                        v-if="
                            grantLevel == 'board' &&
                            ['modeler', 'administrator', 'owner'].includes(
                                scope.row.grant
                            )
                        "
                        :style="{ color: grantColor[scope.row.grant] }"
                    >
                        {{ $t(`user.grant_level.${scope.row.grant}`) }}
                    </div>
                    <div v-else>
                        <el-checkbox-group
                            v-for="grant in sortedGrantList"
                            v-model="scope.row.grants[grant]"
                            :key="grant"
                            :class="
                                !(
                                    scope.row.grants[grant] ||
                                    scope.row.grants[grant] === false
                                ) && 'owner'
                            "
                            :fill="grantColor[grant]"
                            @input="onGrantUpdate(scope.row, grant)"
                        >
                            <el-checkbox-button
                                v-if="
                                    scope.row.grants[grant] ||
                                    scope.row.grants[grant] === false
                                "
                                class="el-checkbox-button--small"
                                :disabled="
                                    (scope.row.isOwner && grant == 'owner') ||
                                    scope.row.self ||
                                    ((guest
                                        ? userListLimit_guest
                                        : userListLimit) &&
                                        !scope.row.availableGrantWhenLimitReached.includes(
                                            grant
                                        ))
                                "
                                :label="
                                    $t(
                                        `user.grant_level.${
                                            scope.row.isOwner &&
                                            grant == 'owner'
                                                ? 'owner'
                                                : grant
                                        }`
                                    )
                                "
                            />
                        </el-checkbox-group>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                v-if="grantLevel == 'world'"
                min-width="150"
                :label="$t('users_parameters.boardGrant')"
            >
                <template slot-scope="scope">
                    <div
                        :style="{
                            color: scope.row.boardGrant ? 'inherit' : '#F56C6C',
                        }"
                    >
                        {{
                            $tc(
                                "users_parameters.boardLength",
                                scope.row.boardGrant
                            )
                        }}
                    </div>
                </template>
            </el-table-column>

            <el-table-column
                v-if="guest"
                sortable
                property="guestUntil"
                min-width="150"
                :label="$t('users_parameters.guestUntil')"
            >
                <template slot-scope="scope">
                    {{ $d(new Date(scope.row.guestUntil), "long") }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
const WORLD = "world";
const BOARD = "board";

import app from "../../conf/app";
import Url from "../../conf/url";
import UserInvitation from "../user-invitation/user-invitation";
import UserInvitationLinks from "../user-invitation/user-invitation-links";
import UserListWarning from "./user-list-warning";
import UserListLimit from "./user-list-limit";
import isEqual from "lodash.isequal";
export default {
    name: "UserList",

    components: {
        UserInvitation,
        UserListWarning,
    },
    mixins: [UserListLimit],

    props: {
        guest: Boolean,
    },
    inject: ["$view"],

    data() {
        return {
            search: "",
            selection: [],
        };
    },

    created() {
        this.refreshUse();
    },

    computed: {
        grantLevel() {
            return this.$view.boardId ? BOARD : WORLD;
        },

        sortedGrantList() {
            return this.grantLevel === WORLD
                ? ["modeler", "administrator", "owner"]
                : this.grantLevel === BOARD && !this.guest
                ? ["observer", "participant", "animator", "owner"]
                : ["observer", "participant"];
        },
        ownerMail() {
            return this.$store.getters["worldAlive/byId"](this.$view.worldId)
                .data.owner;
        },

        userList() {
            let list = this.$store.getters["userAlive/asArray"].filter(
                (item) => item.data.email
            );
            if (this.search) {
                list = list.filter((user) =>
                    user.data.email.match(new RegExp(this.search, "i"))
                );
            }
            if (this.guest === true || this.guest === false) {
                list = list.filter(
                    (user) => this.guest == !!user.data.guestUntil
                );
            }

            const me = this.$store.getters[`connectionMe/email`];
            return list.map((user) => {
                const isOwner = user.data.email == this.ownerMail;
                const ownerGrant = { owner: true };
                const grantId = this.$store.getters[
                    `grant/${this.grantLevel}/boardId`
                ](user.userId);
                const worldGrant = this.$store.getters[`grant/world/byId`](
                    user.userId
                );
                const grantLevel =
                    Object.keys(worldGrant).some((item) => worldGrant[item]) ||
                    this.grantLevel === WORLD
                        ? "world"
                        : "board";
                const grants = isOwner
                    ? ownerGrant
                    : this.$store.getters[`grant/${grantLevel}/byId`](
                          user.userId
                      );

                const grantRules = {
                    [WORLD]: ["modeler", "administrator"],
                    [BOARD]: ["observer", "participant", "animator"],
                };
                const [grant] = Object.keys(grants).filter(
                    (item) => grants[item]
                );
                let availableGrantWhenLimitReached = [];
                for (let grant in grants) {
                    if (grants[grant]) {
                        availableGrantWhenLimitReached =
                            availableGrantWhenLimitReached.concat(
                                grantRules[grantLevel]
                            );
                    }
                }
                availableGrantWhenLimitReached = [
                    ...new Set(availableGrantWhenLimitReached),
                ];
                return {
                    isOwner,
                    userId: user.userId,
                    email: user.data.email,
                    guestOriginalEmail: user.data.guestOriginalEmail,
                    guestUntil: user.data.guestUntil,
                    guestUrl: user.data.guestToken
                        ? Url.guest({
                              email: user.data.email,
                              token: user.data.guestToken,
                          })
                        : null,
                    self: user.data.email === me,
                    grantId,
                    grants,
                    grant,
                    availableGrantWhenLimitReached,
                    boardGrant: (this.userBoardGrantLength[user.userId] || [])
                        .length,
                    sortGrant: [
                        "observer",
                        "participant",
                        "animator",
                        "noGrant",
                        "modeler",
                        "administrator",
                        "owner",
                    ].indexOf(grant || "noGrant"),
                };
            });
        },

        grantColor() {
            return app.grantColor;
        },
    },

    watch: {
        userList: {
            deep: false,
            handler(newVal, oldVal) {
                if (!isEqual(newVal, oldVal)) {
                    this.refreshUse();
                }
            },
        },
    },

    methods: {
        sortGrant(a, b) {
            return a.sortGrant - b.sortGrant;
        },
        refreshUse() {
            this.$store.dispatch("worldUse/get", this.$view);
        },

        selectable(row /* index */) {
            return !row.self && !row.isOwner;
        },

        onSelectionChange(evt) {
            this.selection = evt;
        },

        onGrantUpdate({ grants, grantId, userId }, modifiedKey) {
            // One or zero user profile may be selected, no more
            for (let key in grants) {
                if (key !== modifiedKey) {
                    grants[key] = false;
                }
            }

            // Dispatch to store
            this.$store.dispatch(
                `grant/${this.grantLevel}/${grantId ? "update" : "create"}`,
                {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId, // may be null if grant is set at world level
                    grantId, // may be null if it is a grant creation
                    userId, // may be null if it is a grant update
                    data: grants,
                }
            );
            if (!grantId) {
                this.$nextTick(() => this.refreshUse());
            }
        },

        onUserDelete() {
            this.$modal.show(
                "dialog",
                {
                    text: this.$t(
                        `world.user.modal.${this.guest ? "guest" : "user"}_${
                            this.selection.length < 2 ? "singular" : "plural"
                        }`
                    ),
                    buttons: [
                        {
                            title: this.$t("modal.yes"),
                            handler: () => {
                                this.$store.dispatch(`userAlive/delete`, {
                                    worldId: this.$view.worldId,
                                    data: this.selection,
                                });
                                this.$modal.hide("dialog");
                            },
                        },
                        {
                            title: this.$t("modal.no"),
                            default: true,
                        },
                    ],
                },
                app.modal.parameters
            );
        },

        onShowGuestUrl() {
            this.$modal.show(
                UserInvitationLinks,
                {
                    user: this.selection,
                },
                app.modal.parameters
            );
        },

        tableRowClassName({ row }) {
            if (row.guestUntil) {
                let startDay = new Date();
                let endDay = new Date(row.guestUntil);
                return (endDay.getTime() - startDay.getTime()) /
                    (1000 * 3600 * 24) <=
                    0
                    ? "error-row"
                    : "";
            }
            return "";
        },
    },
};
</script>

<style scoped>
.el-object {
    margin-bottom: 20px;
}

/* Users */
#users {
    display: flex;
    flex-direction: column;
}

#users-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-direction: row-reverse;
}

#users-header >>> .el-input {
    width: 200px;
}

#users-header #users-input-header,
#users-header #users-checkbox-header {
    display: flex;
    justify-content: space-around;
    text-align: center;
    width: 50%;
}

#users-header #users-input-header span {
    width: 165px;
}

#users-header #users-checkbox-header span {
    width: 120px;
    display: inline-block;
    vertical-align: top;
}

#users-header span {
    font-weight: 700;
}

#users-list >>> .el-table__body-wrapper {
    min-height: 65%;
    overflow-y: auto;
    overflow-x: hidden;
}

#users-list >>> .el-table::before {
    background: none;
}

#users-list >>> .user-list-grants > .cell > div {
    display: flex;
}

#users-list >>> .el-checkbox-group {
    margin-right: 12px;
}
#users-list >>> .el-checkbox-group.owner {
    margin-right: 0px;
}

#users-list >>> .el-checkbox-button__inner {
    border-radius: var(--style-border-radius);
}
#users >>> .el-table .error-row,
#users >>> .el-table .error-row:hover > td.el-table__cell {
    background: #f56c6c;
}
</style>
