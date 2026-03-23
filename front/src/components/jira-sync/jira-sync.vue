<template>
    <div>
        <el-form
            ref="jira"
            label-position="right"
            label-width="100px"
            :model="jira"
            :rules="rules"
        >
            <el-alert
                v-if="error || useLimit"
                style="margin: 10px 0"
                :title="
                    useLimit ? useLimit && useLimit.title : $t('jira.api_error')
                "
                :description="
                    (useLimit && useLimit.description) || errorDescription
                "
                :closable="false"
                type="error"
                effect="dark"
            >
            </el-alert>
            <el-form-item prop="host" :label="$t('jira.host')">
                <el-input
                    :disabled="isConnected"
                    v-model="jira.host"
                ></el-input>
            </el-form-item>
            <el-form-item prop="username" :label="$t('jira.username')">
                <el-input
                    :disabled="isConnected"
                    v-model="jira.username"
                ></el-input>
            </el-form-item>
            <el-form-item
                v-if="!isConnected"
                prop="jiraApiToken"
                :label="$t('jira.api_token')"
            >
                <el-input
                    show-password
                    :disabled="isConnected"
                    type="jiraApiToken"
                    v-model="jira.jiraApiToken"
                ></el-input>
            </el-form-item>
            <el-form-item size="large" style="text-align: right">
                <el-button
                    v-if="!isConnected"
                    :disabled="!validate"
                    type="primary"
                    @click="onSubmit"
                    >{{ $t("jira.validate") }}</el-button
                >
                <el-popconfirm
                    v-show="isConnected"
                    :confirm-button-text="$t('jira.confirm_reset')"
                    :cancel-button-text="$t('jira.cancel_reset')"
                    style="margin: 10px"
                    :title="$t('jira.reset_sync')"
                    @confirm="resetForm"
                >
                    <el-button slot="reference">{{
                        $t("jira.reset_button")
                    }}</el-button>
                </el-popconfirm>
                <el-button
                    v-show="isConnected"
                    @click="doRefresh"
                    icon="el-icon-refresh"
                    >{{ $t("jira.refresh") }}</el-button
                >
            </el-form-item>
        </el-form>
        <el-select
            v-if="isConnected"
            style="width: 100%"
            v-model="key"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="$t('jira.project_sync_placeholder')"
        >
            <el-option
                v-for="item in boardJiraData"
                :key="item.key"
                :label="`${item.key} : ${item.name}`"
                :value="item.key"
            >
            </el-option>
        </el-select>
    </div>
</template>

<script>
import isEqual from "lodash.isequal";
export default {
    name: "JiraSync",

    inject: ["$view"],

    data() {
        return {
            key: [],
            validate: false,
            jira: {
                host: "",
                username: "",
                jiraApiToken: "",
            },

            rules: {
                host: [
                    {
                        required: true,
                        message: this.$t("jira.url_error"),
                        trigger: "blur",
                    },
                    {
                        type: "url",
                        message: this.$t("jira.wrong_url"),
                        trigger: ["blur"],
                    },
                ],
                username: [
                    {
                        required: true,
                        message: this.$t("jira.username_error"),
                        trigger: "blur",
                    },
                ],
                jiraApiToken: [
                    {
                        required: true,
                        message: this.$t("jira.password_error"),
                        trigger: "blur",
                    },
                ],
            },
        };
    },

    mounted() {
        if (this.settings.username && this.settings.host) {
            this.jira.host = this.settings.host;
            this.jira.username = this.settings.username;
        }
        if (this.boardJiraData) {
            this.key = this.boardJiraData
                .filter((item) => item.activatedProject)
                .map((item) => item.key);
        }
    },
    computed: {
        isConnected() {
            return !!(
                this.settings &&
                this.settings.host &&
                this.settings.username
            );
        },
        error() {
            return this.$store.getters["jiraUse/project/asError"];
        },
        errorDescription() {
            if (this.error) {
                const { message } = this.error[Object.keys(this.error)[0]];
                if (message) return message;
            }
            return undefined;
        },

        useLimit() {
            try {
                const maxUse = this.$store.getters["worldUse/byId"](
                    this.$view.worldId
                ).private.useMaxJiraProjects;
                const currentUse =
                    this.$store.state.worldUse[this.$view.worldId].data
                        .jiraProject;
                if (currentUse >= maxUse) {
                    return {
                        title: this.$t("jira_use_warning.title"),
                        description: this.$t("jira_use_warning.warn", {
                            supportMail: this.supportMail,
                        }),
                    };
                } else return null;
            } catch (e) {
                return null;
            }
        },
        supportMail() {
            return this.$store.state["connectionMe"].user.supportMail;
        },
        project() {
            if (this.error) return [];
            return this.$store.getters["jiraUse/project/asArray"] || [];
        },
        settings() {
            const { host, username } =
                this.$store.getters["boardAlive/byId"](this.$view.boardId).data
                    .jira || {};
            return { host, username };
        },
        boardJiraData() {
            const { projects } =
                this.$store.getters["boardAlive/byId"](this.$view.boardId).data
                    .jira || {};
            return projects || [];
        },
    },

    watch: {
        jira: {
            deep: true,
            handler() {
                this.$refs["jira"].validate((valid) => (this.validate = valid));
            },
        },
        project(project) {
            this.updateBoardJiraProject(project);
        },
    },

    methods: {
        onSubmit() {
            if (this.validate) {
                this.$store.dispatch("boardAlive/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data: {
                        jiraApiToken: this.jira.jiraApiToken,
                        jira: {
                            username: this.jira.username,
                            host: this.jira.host.replace(/\/$/, ""),
                        },
                    },
                    reply: true,
                });
            }
        },
        updateBoardJiraProject(project) {
            const data = {
                jira: {},
            };
            data.jira["projects"] = project.map((item) => {
                return {
                    ...item,
                    activatedProject: this.key.includes(item.key),
                };
            });

            if (this.isConnected) {
                this.$store.dispatch("boardAlive/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    data,
                    reply: true,
                });
            }
        },
        resetForm() {
            this.validate = true;
            this.jira.host = "";
            this.jira.username = "";
            this.jira.jiraApiToken = "";

            this.$store.dispatch("boardAlive/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: {
                    jira: null,
                },
                reply: true,
            });
            this.key = [];
            this.$store.commit("jiraUse/project/reset");
        },
        doRefresh() {
            this.$store.dispatch("jiraUse/project/get", this.$view);
        },
    },
    beforeDestroy() {
        if (
            this.boardJiraData &&
            !isEqual(
                this.boardJiraData
                    .filter((item) => item.activatedProject)
                    .map((item) => item.key),
                this.key
            )
        ) {
            this.updateBoardJiraProject(this.boardJiraData);
        }
    },
};
</script>
