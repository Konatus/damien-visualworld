<script>
import { writable } from "../../utils/html.js";
export default {
    name: "BtnModeShift",
    inject: ["$view"],
    data() {
        return {
            btnModeShift_previousMode: null,
        };
    },
    methods: {
        btnModeShift_onKeyDown(evt) {
            if (
                this.hasUpdateGrant &&
                !this.modeIsSelect &&
                !evt.defaultPrevented &&
                !writable(evt.target || evt.srcElement) &&
                // evt.ctrlKey ||
                (evt.shiftKey || evt.metaKey)
            ) {
                if (this.modeIsLink) {
                    this.setModeNormal();
                }
                this.btnModeShift_previousMode =
                    this.$store.getters[`app/objectsInBoard/mode`];
                this.setModeSelect();
            }
        },
        btnModeShift_onKeyUp(evt) {
            if (
                this.btnModeShift_previousMode &&
                !evt.defaultPrevented &&
                !(
                    // evt.ctrlKey ||
                    (evt.shiftKey || evt.metaKey)
                )
            ) {
                this.$store.commit(
                    `app/objectsInBoard/mode`,
                    this.btnModeShift_previousMode
                );
                this.btnModeShift_previousMode = null;
            }
        },
    },
    computed: {
        hasUpdateGrant() {
            return this.$store.getters[`connectionMe/isGrantedForOne`](
                ["position-alive/update-front", "position-alive/update-back"],
                this.$view
            );
        },
    },
    created() {
        document.addEventListener("keydown", this.btnModeShift_onKeyDown);
        document.addEventListener("keyup", this.btnModeShift_onKeyUp);
    },
    beforeDestroy() {
        document.removeEventListener("keydown", this.btnModeShift_onKeyDown);
        document.removeEventListener("keyup", this.btnModeShift_onKeyUp);
    },
};
</script>
