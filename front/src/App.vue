<template>
    <div id="app">
        <template v-if="termsAccept">
            <router-view
                :key="$route.fullPath"
                id="router"
                :class="{
                    'objects-in-board': $route.name == 'objectsInBoard',
                }"
            />
        </template>
        <div
            v-else
            :class="{
                'background-dark': !termsAccept,
            }"
        >
            <modals-container />
            <div class="background-image" />
        </div>

        <alert-overlay />
        <v-dialog />
        <alert-display />
    </div>
</template>

<script>
import Vue from "vue";
import app from "./conf/app";
import "./assets/modal.css";
import "./assets/class.css";
import "quill/dist/quill.core.css";
import VModal from "vue-js-modal";
import Terms from "./views/term-overlay.vue";
import AlertDisplay from "./components/alert-display/alert-display.vue";
import AlertOverlay from "./components/alert-overlay/alert-overlay.vue";
import socket from "./store/socket";
Vue.use(VModal, app.modal.install);
export default {
    components: {
        AlertDisplay,
        AlertOverlay,
    },
    mounted() {
        if (this.termsAccept === false) {
            this.$modal.show(
                Terms,
                null,
                app.modal.parameters_terms_and_conditions
            );
        }
        document.addEventListener("visibilitychange", () => {
            const eventName =
                document.visibilityState === "visible"
                    ? "tab-visible"
                    : "tab-hidden";
            socket
                .get(this.$route.params)
                .emit("tab", `${this.email} ${eventName}`);
            this.$store.commit(`app/objectsInBoard/setModeNormal`);
        });
    },
    computed: {
        email() {
            return this.$store.getters[`connectionMe/email`];
        },
        title() {
            let title = this.$t("app_name");
            try {
                if (this.$route.params.worldId && this.$route.params.boardId) {
                    title = `${this.$store.getters["boardAlive/nameById"](
                        this.$route.params.boardId
                    )} | 
                             ${this.$store.getters["worldAlive/nameById"](
                                 this.$route.params.worldId
                             )} `;
                }
            } catch {
                /* Nothing to do */
            }

            return title;
        },
        termsAccept() {
            return !!this.$store.getters[`connectionMe/terms`];
        },
    },
    watch: {
        title(value) {
            document.title = value;
        },
    },
};
</script>
<style>
body,
#app,
#router {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

#app.terms {
    background: #171e36;
}
@keyframes scale {
    from {
        transform: scale(0.75);
    }
    to {
        transform: scale(3);
    }
}
</style>
