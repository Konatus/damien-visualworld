<script>
export default {
    name: "ObjectToolbarShared",
    inject: ["$view"],
    methods: {
        selectedPositions() {
            return this.$store.getters[
                `app/objectsInBoard/selectedPositionIds`
            ].map((positionId) =>
                this.$store.getters[`positionAlive/byId`](positionId)
            );
        },

        // @param {int} order: 1 for ascending, -1 for descending
        selectedPositionsByZIndex(order = 1) {
            return this.selectedPositions().sort(
                (a, b) => order * (a?.data?.zIndex - b?.data?.zIndex)
            );
        },
    },
};
</script>
