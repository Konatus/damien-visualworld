<template>
    <div id="btn-zoom">
        <template v-if="'FEATURE_FLIPPING.pauseResumePanzoom' === false">
            <button id="btn-zoom-resume" @click="onZoomResume" v-if="isPaused">
                <i class="el-icon-video-play"></i>
            </button>
            <button id="btn-zoom-pause" @click="onZoomPause" v-else>
                <i class="el-icon-video-pause"></i>
            </button>
        </template>

        <el-input-number
            id="btn-zoom-value"
            size="mini"
            :controls="true"
            :precision="0"
            :step="scaleStep"
            :value="scaleTarget"
            :min="scaleMin"
            :max="scaleMax"
            @change="onZoomInputChange"
        />
    </div>
</template>

<script>
import app from "../../conf/app";
import scale from "../../utils/scale";

export default {
    name: "BtnZoom",

    inject: ["$view"],

    data() {
        return {
            refreshIsPaused: 0,
        };
    },

    computed: {
        // Data and objects retrieved from panzoom store
        panzoomInstance() {
            return this.$store.getters[`panzoom/instance`] || null;
        },
        scaleTarget() {
            return Math.round(100 * this.$store.getters[`panzoom/scale`]);
        },
        scaleMin() {
            return Math.ceil(100 * this.$store.getters[`panzoom/minScale`]);
        },
        scaleMax() {
            return Math.floor(100 * this.$store.getters[`panzoom/maxScale`]);
        },
        scaleStep() {
            const stdStep = Math.ceil(
                this.scaleTarget * app.board.zoom.clickCoeff
            );
            const toMinStep = this.scaleTarget - this.scaleMin;
            const toMaxStep = this.scaleMax - this.scaleTarget;
            let step = stdStep;
            if (0 < toMinStep && toMinStep < stdStep) {
                step = toMinStep;
            }
            if (0 < toMaxStep && toMaxStep < stdStep) {
                step = toMaxStep;
            }
            return step;
        },

        // Is panzoom paused ?
        // Used to decide which of pause and resume button must be displayed
        isPaused() {
            try {
                const ignoredOnlyNeededForReactivity = this.refreshIsPaused;
                return this.panzoomInstance.isPaused();
            } catch (e) {
                return false;
            }
        },
    },

    methods: {
        // Pause or resume panzoom
        onZoomPause() {
            this.panzoomInstance.pause();
            this.refreshIsPaused++;
        },
        onZoomResume() {
            this.panzoomInstance.resume();
            this.refreshIsPaused++;
        },

        // Zoom input change
        onZoomInputChange(newScale) {
            let newScaleCoeff = (newScale ?? this.scaleTarget) / 100;
            if (newScaleCoeff < this.minZoom) {
                newScaleCoeff = this.minZoom;
            } else if (newScaleCoeff > this.maxZoom) {
                newScaleCoeff = this.maxZoom;
            }
            const center = scale.getScreenCenter();
            this.panzoomInstance.zoomAbs(center.x, center.y, newScaleCoeff);
        },
    },
};
</script>

<style>
#btn-zoom {
    user-select: none;
    display: flex;
    justify-content: space-around;
    align-items: center;
}
#btn-zoom #btn-zoom-value.el-input-number {
    width: 144px;
}
#btn-zoom input {
    border: none;
    text-align: center;
    margin: 0;
    padding: 0 5px 0 0;
    transition: none;
    height: 46px;
    font-size: 16px;
}
#btn-zoom-value .el-input:after {
    font-size: 16px;
    content: "\0025";
    right: 50px;
    top: 9px;
    position: absolute;
}
#btn-zoom-value .el-input-number__decrease,
#btn-zoom-value .el-input-number__increase {
    border-color: var(--style-color-lightgrey);
    background: transparent;
    width: 40px;
    font-size: 20px;
    line-height: 46px;
    top: 0;
    bottom: 0;
}
#btn-zoom-value .el-input-number__decrease > i,
#btn-zoom-value .el-input-number__increase > i {
    font-weight: bold;
    color: var(--style-color-main);
}
#btn-zoom-value .el-input:hover {
    color: var(--style-color-lightblue) !important;
}
#btn-zoom-value input {
    color: inherit;
}
</style>
