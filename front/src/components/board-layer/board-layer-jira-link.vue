<script>
import app from "../../conf/app";
export default {
    name: "BoardLayerJiraLink",

    inject: ["$view"],

    computed: {
        objects() {
            return this.$store.getters["object/asArray"] || [];
        },
        jiraIssueLinkModel() {
            return this.$store.getters["linkModelAlive/byId"](
                app.jiraLinkModel.jiraIssueLinkModel
            );
        },
        jiraParentLinkModel() {
            return this.$store.getters["linkModelAlive/byId"](
                app.jiraLinkModel.jiraParentLinkModel
            );
        },
    },
    watch: {
        positionsOfAllLayers(value) {
            if (this.boardLayerSelect_activeLayer === this.$attrs.id) {
                const jiraObjectId = this.objects
                    .filter((item) => {
                        return (
                            (item.data.issuelinks &&
                                item.data.issuelinks.length) ||
                            item.data.parentKey
                        );
                    })
                    .map((item) => item.objectId);
                const jiraPosition = value
                    .filter((item) => jiraObjectId.includes(item.objectId))
                    .map((item) => {
                        return {
                            objectId: item.objectId,
                            ...this.objects
                                .filter((x) => x.objectId == item.objectId)
                                .map((item) => ({
                                    issuelinks: item.data.issuelinks,
                                    parentKey: item.data.parentKey,
                                    key: item.data.jira_key,
                                }))[0],
                        };
                    });
                this.doCreateJiraLink(jiraPosition);
            }
        },
    },

    methods: {
        doCreateJiraLink(jiraPosition) {
            let links = [];
            jiraPosition.forEach((item) => {
                if (item.issuelinks) {
                    links = links.concat(...this.createIssueLink(item));
                }
                if (item.parentKey) {
                    links = links.concat(...this.createParentLink(item));
                }
            });
            this.$store.commit("linkAlive/set", links);
        },
        createIssueLink({ issuelinks, objectId, key }) {
            return issuelinks.map(({ name, outwardIssue }) => {
                const [targetObjectId] = this.objects
                    .filter((x) => x.data.jira_key == outwardIssue)
                    .map((x) => x.objectId);
                const linkModel = this.jiraIssueLinkModel;
                if (!linkModel) return {};

                return {
                    _id: linkModel._id + key + outwardIssue,
                    linkModelId: linkModel._id,
                    data: {
                        ...linkModel.data,
                        title: name,
                    },
                    objects: [
                        {
                            positions: this.positions.filter(
                                (x) => x.objectId == objectId
                            ),
                            data: linkModel.data.anchors[0].data,
                            objectId: objectId,
                        },
                        {
                            positions: this.positions.filter(
                                (x) => x.objectId == targetObjectId
                            ),
                            data: linkModel.data.anchors[1].data,
                            objectId: targetObjectId,
                        },
                    ],
                };
            });
        },

        createParentLink({ parentKey, objectId, key }) {
            const [targetObjectId] = this.objects
                .filter((x) => x.data.jira_key == parentKey)
                .map((x) => x._id);
            let linkModel = this.jiraParentLinkModel;
            if (!linkModel) return [];
            return [
                {
                    _id: linkModel._id + key + parentKey,
                    linkModelId: linkModel._id,
                    data: linkModel.data,
                    objects: [
                        {
                            data: linkModel.data.anchors[0].data,
                            positions: this.positions.filter(
                                (x) => x.objectId == objectId
                            ),
                            objectId: objectId,
                        },
                        {
                            positions: this.positions.filter(
                                (x) => x.objectId == targetObjectId
                            ),
                            data: linkModel.data.anchors[1].data,
                            objectId: targetObjectId,
                        },
                    ],
                },
            ];
        },
    },
};
</script>
