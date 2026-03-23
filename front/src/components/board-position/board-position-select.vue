<!--
    This mixin regulates and transforms VDR select events, before transmitting them for synchronization of multiple movements.
    Ce mixin régule et transforme les événements de sélection VDR, avant de les transmettre pour synchronisation des mouvements multiples.
-->
<script>
export default {
    name: "BoardPositionSelect",

    methods: {
        boardPositionSelect_onClicked(evt) {
            this.$emit("boardPositionSelect_clicked", {
                id: this.$vnode.key,
                originalEvent: evt,
            });
        },
    },
};
</script>
