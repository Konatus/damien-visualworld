<!--
    This mixin allows the creation of links.
    Ce mixin permet la création de liens.
-->
<script>
import app from "../../conf/app";
import Position from "../../utils/position";
export default {
    name: "BoardLayerLinkCreate",

    inject: ["$view"],
    data() {
        return {
            boardLayerLinkCreate_originObjectId: "",
            boardLayerLinkCreate_ghostLink: null,
        };
    },

    watch: {
        boardLayerLinkCreate_selectedObjectIds: {
            deep: true,
            handler(value) {
                switch (value.length) {
                    case 1:
                        this.boardLayerLinkCreate_originObjectId = value[0]; // necessary to distinguish source and target
                        break;
                    case 2:
                        this.boardLayerLinkCreate_onSelectSecond(
                            this.boardLayerLinkCreate_originObjectId,
                            value.find(
                                (objectId) =>
                                    objectId !==
                                    this.boardLayerLinkCreate_originObjectId
                            )
                        );
                        break;
                    default: // reset "ghost" link
                        this.boardLayerLinkCreate_ghostLink = null;
                        break;
                }
            },
        },
    },

    computed: {
        boardLayerLinkCreate_selectedObjectIds() {
            return this.positions
                .filter((x) =>
                    Object.keys(this.boardLayerSelect_getPosition).includes(
                        x.positionId
                    )
                )
                .map((x) => x.objectId);
        },

        // Is a link being created?
        boardLayerLinkCreate_isInProgress() {
            return (
                this.$store.getters[`app/objectsInBoard/modeIsLink`] &&
                this.boardLayerLinkCreate_selectedObjectIds.length > 0
            );
        },

        boardLayerLinkCreate_defaultLinkData() {
            const linkModelId =
                this.$store.getters["latestLinkModel/model"].linkModelId;
            if (
                linkModelId &&
                app.visualWorldComponent.VW_default != linkModelId
            ) {
                return this.$store.getters["linkModelAlive/byId"](linkModelId);
            } else {
                return this.$store.getters["latestLinkModel/model"];
            }
        },
    },

    methods: {
        // Update the "ghost" link when pointer moves
        boardLayerLinkCreate_onMove(evt) {
            // Reset temporary link, if no link is being created
            if (this.boardLayerLinkCreate_isInProgress) {
                // Selected objects
                const objects = this.boardLayerLinkCreate_selectedObjectIds.map(
                    (objectId) => ({
                        objectId,
                    })
                );

                // Pointer's position if a link is being created
                const panzoom = this.$store.getters[`panzoom/panzoom`];
                const cursorPosition = Position.eventToLayer(evt, panzoom)[0]; // TODO: use full list in case of touch event
                objects.push({
                    position: {
                        data: {
                            width: 1,
                            height: 1,
                            top: cursorPosition.top,
                            left: cursorPosition.left,
                            zIndex: app.board.zIndex.max,
                        },
                    },
                });

                // Add default data of the ObjectLink
                objects.forEach((object, index) => {
                    const anchors =
                        this.boardLayerLinkCreate_defaultLinkData?.anchors ||
                        this.boardLayerLinkCreate_defaultLinkData?.data.anchors;
                    object.data = anchors.filter(
                        (x) => x.data.arrowhead == index
                    )[0].data;
                });
                // Set value into data
                this.boardLayerLinkCreate_ghostLink = {
                    linkId: JSON.stringify(cursorPosition).replace(
                        /[^a-z0-9]/gi,
                        ""
                    ),
                    data: this.boardLayerLinkCreate_defaultLinkData.data,
                    objects,
                };
            }
        },

        // A second object has been selected
        boardLayerLinkCreate_onSelectSecond(objectId1, objectId2) {
            if (!this.boardLayerLinkCreate_isInProgress) {
                return;
            }

            this.boardLayerLinkCreate_doCreate([objectId1, objectId2]);

            // Deselect object position used to create thelink
            this.boardLayerSelect_doResetPosition();

            // TODO: wonder if the selection of new link may be useful
        },

        // Do create the link
        boardLayerLinkCreate_doCreate(objectIds) {
            const anchors =
                this.boardLayerLinkCreate_defaultLinkData.anchors ||
                this.boardLayerLinkCreate_defaultLinkData.data.anchors;
            const linkModelId =
                this.boardLayerLinkCreate_defaultLinkData.linkModelId;

            this.$store.dispatch("linkAlive/create", {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                data: this.boardLayerLinkCreate_defaultLinkData.data,
                object: objectIds.map((objectId, index) => ({
                    objectId,
                    data: anchors.filter((x) => x.data.arrowhead == index)[0]
                        .data,
                })),
                linkModelId,
            });
        },
    },
};
</script>
<style>
#board-layer-link-create {
    pointer-events: none;
}
</style>
