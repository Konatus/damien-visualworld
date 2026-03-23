<!--
    This component displays a modal overlay to indicate a fatal error or to display an error.
    Ce composant affiche un overlay modal pour indiquer une erreur fatale ou pour afficher une erreur.
-->
<template>
    <div id="overlay" v-if="connected === false">
        <p>{{ $t("overlay_alert.fatal_error") }}</p>
        <el-tooltip
            :content="$t('tooltips.overlay_alert.reload_button')"
            :open-delay="openDelayTooltip"
            placement="bottom"
        >
            <button @click="onReloadPage">&#8635;</button>
        </el-tooltip>
    </div>

    <div
        v-else-if="message || spinner"
        :element-loading-text="message"
        v-loading.fullscreen="true"
    />
</template>

<script>
import app from "../../conf/app";
import socket from "../../store/socket";
import info from "../../info.json";
export default {
    name: "AlertOverlay",

    data() {
        return {
            connected: undefined,
            interval: undefined,
        };
    },
    computed: {
        message() {
            return this.$store.state["overlay"].message || null;
        },
        spinner() {
            return this.$store.state["overlay"].spinner || null;
        },

        openDelayTooltip() {
            return app?.tooltip_config?.delay;
        },
    },

    created() {
        this.interval = setInterval(
            function () {
                const appSocket = socket.get({});
                if (this.connected !== appSocket.connected) {
                    const { gitInfo } = this.$store.state["connectionMe"].user;
                    if (
                        !this.connected &&
                        appSocket.connected &&
                        gitInfo.commit !== info.commit
                    ) {
                        this.onReloadPage();
                    }

                    this.connected = appSocket.connected;
                }
            }.bind(this),
            2000
        );
    },
    destroyed() {
        clearInterval(this.interval);
    },

    methods: {
        onReloadPage() {
            window.location.reload();
        },
    },
};
</script>

<style scoped>
#overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: var(--overlay-z-index);
    background: rgba(255, 255, 255, 0.9);
}

#overlay p {
    color: var(--style-color-lightblue);
    font-size: 2.5em;
    text-align: center;
    width: 13em;
    display: block;
    margin: 30vh auto 0 auto;
}

#overlay button {
    display: block;
    margin: 30px auto 20px auto;
    color: var(--style-color-lightblue);
    font-size: 4em;
}
</style>
