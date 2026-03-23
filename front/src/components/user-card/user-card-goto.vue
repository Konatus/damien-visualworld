<script>
const TIMEOUT = 5000; /* ms */
import socket from "../../store/socket";
export default {
    name: "UserCardGoto",

    inject: ["$view"],

    data() {
        return {
            userCardGoto_requested: false, // Flag avoid side effect
        };
    },

    mounted() {
        const { worldId, boardId } = this.$view;
        socket
            .get({ worldId, boardId })
            .on("connection-all/get-screen", this.userCardGoto_onGetScreen);
        socket
            .get({ worldId, boardId })
            .on("connection-all/set-screen", this.userCardGoto_onSetScreen);
    },

    methods: {
        // Someone wants to join current user and so asked for its screen position
        userCardGoto_onGetScreen(evt) {
            if (this.email === this.$store.getters["connectionMe/email"]) {
                const { worldId, boardId } = this.$view;
                socket
                    .get({ worldId, boardId })
                    .emit("connection-all/set-screen", {
                        socketId: evt.document.socketId,
                        data: this.$store.getters[`panzoom/panzoom`],
                    });
            }
        },

        // Current user ask to go to someone else's screen position
        userCardGoto_onRequest() {
            const { worldId, boardId } = this.$view;
            this.userCardGoto_requested = true;
            window.setTimeout(() => {
                this.userCardGoto_requested = false;
            }, TIMEOUT);

            socket.get({ worldId, boardId }).emit("connection-all/get-screen", {
                data: {
                    email: this.email,
                },
            });
        },

        // Someone else's screen posiion has been received, so let's go there
        userCardGoto_onSetScreen({ data }) {
            if (this.userCardGoto_requested) {
                this.userCardGoto_requested = false;

                // Scale must be adjust, because current screen may have a different size
                const { scene } = this.$store.getters[`panzoom/panzoom`];
                const ratioScale = Math.min(
                    scene.width / data.scene.width,
                    scene.height / data.scene.height
                );

                const panzoom = this.$store.getters[`panzoom/instance`];
                panzoom.zoomAbs(
                    data.x * ratioScale,
                    data.y * ratioScale,
                    data.scale * ratioScale
                );
                panzoom.moveTo(data.x * ratioScale, data.y * ratioScale);
            }
        },
    },
};
</script>
