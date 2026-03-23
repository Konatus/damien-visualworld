<template>
    <el-menu-item
        class="board-toolbar-button board-toolbar-jira-sync-button"
        @click="doSyncObjectJira"
        v-if="selectedObject.some((item) => item.data.jira_key === null)"
    >
        <i class="el-icon-refresh"></i>
    </el-menu-item>
</template>
<script>
import app from "../../conf/app";
export default {
    name: "ObjectToolbarJiraSync",
    inject: ["$view"],
    computed: {
        boardJira() {
            return (
                this.$store.getters["boardAlive/byId"](this.$view.boardId).data
                    ?.jira || {}
            );
        },
        jiraUser() {
            return (
                this.$store.getters[`connectionMe/email`] == this.boardJira &&
                this.boardJira.username
            );
        },
        projects() {
            const { projects } = this.boardJira || {};
            return projects || [];
        },
        selectedObject() {
            const selectedObject = this.$store.getters[
                `app/objectsInBoard/selectedPositionIds`
            ]
                .map((positionId) => {
                    const position =
                        this.$store.getters[`positionAlive/byId`](positionId);

                    return (
                        position.componentId ==
                            app.visualWorldComponent.VW_jira_us_model &&
                        position.objectId
                    );
                })
                .map((objectId) =>
                    this.$store.getters[`object/byId`](objectId)
                );

            return selectedObject.filter((item) => item && !item.data.jira_key);
        },
        issue() {
            return this.selectedObject.map((item) => {
                const {
                    jira_project,
                    jira_summary,
                    jira_storypoint,
                    jira_issuetype,
                    jira_priority,
                    jira_epicname,
                } = item.data || {};

                const issue = { objectId: item.objectId };
                const { customFieldKey, issuetype } =
                    this.projects?.find((item) => item.id == jira_project) ||
                    {};
                const { fields } =
                    (issuetype &&
                        issuetype.find((item) => item.id == jira_issuetype)) ||
                    {};
                const { storyPoint, epicName } = customFieldKey || {};
                let error = null;

                if (!jira_project) error = "jira_project";
                else if (!jira_issuetype) error = "jira_issuetype";
                else if (!jira_summary) error = "jira_summary";
                else if (
                    epicName &&
                    !jira_epicname &&
                    !!Object.values(fields).find(
                        (item) => item.name == "Epic Name"
                    )?.required
                ) {
                    error = "jira_epicname";
                }

                if (error) {
                    issue["jiraError"] = this.$i18n.t(
                        `jira_issue.error.${error}`
                    );
                    return issue;
                }

                issue["fields"] = {
                    project: {
                        id: jira_project,
                    },
                    issuetype: {
                        id: jira_issuetype,
                    },
                    summary: jira_summary,
                };

                if (jira_priority && !!fields?.priority) {
                    issue["fields"]["priority"] = { id: jira_priority };
                }

                if (jira_storypoint && storyPoint && !!fields?.[storyPoint]) {
                    issue["fields"][storyPoint] = jira_storypoint;
                }
                if (jira_epicname && epicName && !!fields?.[epicName]) {
                    issue["fields"][epicName] = jira_epicname;
                }

                if (jira_project && jira_issuetype && jira_summary) {
                    issue["jiraIssueBoardId"] = this.$view.boardId;
                    return issue;
                }
                return null;
            });
        },
    },
    methods: {
        doSyncObjectJira() {
            if (!this.issue.some((x) => !x)) {
                this.$store.dispatch("object/update", {
                    worldId: this.$view.worldId,
                    boardId: this.$view.boardId,
                    payload: this.issue
                        .filter((item) => item.jiraError)
                        .map((item) => {
                            return {
                                objectId: item.objectId,
                                data: {
                                    jira_error: item.jiraError,
                                },
                            };
                        }),
                    reply: true,
                });

                const validIssue = this.issue.filter(
                    (item) => item.fields && !item.fields.jira_key
                );
                if (validIssue.length) {
                    this.$store.dispatch(`jiraUse/issue/create`, {
                        worldId: this.$view.worldId,
                        boardId: this.$view.boardId,
                        data: validIssue,
                    });
                }
            }
        },
    },
};
</script>
