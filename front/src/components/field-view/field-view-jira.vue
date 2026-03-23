<script>
export default {
    watch: {
        value: {
            handler(newVal, oldVal) {
                if (this.object?.data.jira_error) {
                    this.updatObjectJira({ jira_error: "" });
                }
                if (this.widget.model == "jira_project" && newVal != oldVal) {
                    const { jira_issuetype } = this.object.data;
                    if (jira_issuetype) {
                        this.updatObjectJira({ jira_issuetype: "" });
                    }
                }
            },
        },
    },
    methods: {
        updatObjectJira(data) {
            this.$store.dispatch("object/update", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                payload: [
                    {
                        objectId: this.object.objectId,
                        data,
                    },
                ],
                reply: true,
            });
        },
        jiraFieldDisabled() {
            if (!this.object?.data) return false;
            if (this.widget.model == "jira_issuetype")
                return !this.object.data.jira_project;
            if (this.widget.model == "jira_summary")
                return !this.object.data.jira_issuetype;
            return false;
        },
    },
    computed: {
        projects() {
            try {
                return (
                    this.$store.getters["boardAlive/byId"](this.$view.boardId)
                        .data.jira.projects || []
                );
            } catch {
                return [];
            }
        },
        optionsSelect() {
            const project = this.projects;
            const model = this.widget.model;
            const { issuetype, status } =
                project.filter(
                    (item) => item.id == this.object?.data.jira_project
                )[0] || {};
            const { jira_issuetype } = this.object?.data || {};

            if (model == "jira_project") {
                return project
                    .filter((item) => item.activatedProject && !item.jira_key)
                    .map((item) => ({ label: item.name, value: item.id }));
            }
            if (model == "jira_issuetype" && issuetype) {
                return issuetype
                    .filter((item) => !item.subtask)
                    .map((item) => ({ label: item.name, value: item.id }));
            }
            if (model == "jira_status" && status && jira_issuetype) {
                return status
                    .find((item) => item.id == jira_issuetype)
                    .statuses.map((item) => ({
                        label: item.name,
                        value: item.id,
                    }));
            }
            return this.widget.options.options;
        },
    },
};
</script>
