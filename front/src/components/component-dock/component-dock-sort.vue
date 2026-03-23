<!--
    This component allows the addition and sorting of a favorite component to a board in their dock.
    Ce component permet l'ajout et le tri des composants favoris d'un tableau dans leur dock.

    cf: https://github.com/SortableJS/sortablejs#options for draggable options
-->
<script>
export default {
    name: "ComponentDockSort",

    inject: ["$view"],

    methods: {
        // Sort templates displayed in the component-dock
        componentDockSort_do(evt) {
            let data = Array.from(evt.to.childNodes)
                .map((component) => component.dataset.componentId)
                .filter((componentId) => componentId);

            this.$store.dispatch(`boardComponent/update`, {
                worldId: this.$view.worldId,
                boardId: this.$view.boardId,
                isBackground:
                    this.$store.getters[
                        `app/objectsInBoard/activeLayerIsBackground`
                    ],
                data,
            });
        },
    },
};
</script>
