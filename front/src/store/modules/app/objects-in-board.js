import Vue from "vue";
import app from "../../../conf/app";
const BACKGROUND = "background";
const FOREGROUND = "foreground";

const NORMAL_MODE = "normal";
const SELECT_MODE = "select";
const LINK_MODE = "link";
const DRAWING_MODE = "drawing";

const NO_DRAWER = "none";
const COMPONENT_DRAWER = "component";
const USER_DRAWER = "user";

import { execAfterPause } from "../../../utils/frequency-limit";

export default {
    namespaced: true,

    state: () => ({
        activeLayer: FOREGROUND,
        mode: NORMAL_MODE,
        drawer: NO_DRAWER,
        drawerMounted: NO_DRAWER,

        event: null,

        selectedPositionIds: [],
        selectedLinkIds: [],
        dragInProgress: null,
        selectInProgress: null,
        selectPosition: null,

        drawingColor: null,
        drawingEraser: false,
        drawingWidth: null,
        fieldEditedByUser: {},
    }),

    getters: {
        activeLayer(state) {
            return state.activeLayer;
        },
        activeLayerIsBackground(state) {
            return state.activeLayer === BACKGROUND;
        },
        activeLayerIsForeground(state) {
            return state.activeLayer !== BACKGROUND;
        },

        mode(state) {
            return state.mode;
        },
        modeIsNormal(state) {
            return state.mode === NORMAL_MODE;
        },
        modeIsSelect(state) {
            return state.mode === SELECT_MODE;
        },
        modeIsLink(state) {
            return state.mode === LINK_MODE;
        },
        modeIsDrawing(state) {
            return state.mode === DRAWING_MODE;
        },

        drawer(state) {
            return state.drawer;
        },
        drawerIsNone(state) {
            return state.drawer === NO_DRAWER;
        },
        drawerIsComponent(state) {
            return state.drawer === COMPONENT_DRAWER;
        },
        drawerIsUser(state) {
            return state.drawer === USER_DRAWER;
        },
        drawerMounted(state) {
            return state.drawerMounted;
        },

        selectedPositionIds(state) {
            return state.selectedPositionIds;
        },
        selectedLinkIds(state) {
            return state.selectedLinkIds;
        },
        dragInProgress(state) {
            return state.dragInProgress;
        },
        selectInProgress(state) {
            return state.selectInProgress;
        },
        selectPosition(state) {
            return state.selectPosition;
        },

        drawingColor(state) {
            return state.drawingColor;
        },
        drawingEraser(state) {
            return state.drawingEraser;
        },
        drawingWidth(state) {
            return state.drawingWidth;
        },
        fieldEditedByUser(state) {
            return state.fieldEditedByUser;
        },
    },

    mutations: {
        activeLayer(state, value) {
            state.activeLayer = value;
        },
        activeLayerSetBackground(state) {
            state.activeLayer = BACKGROUND;
        },
        activeLayerSetForeground(state) {
            state.activeLayer = FOREGROUND;
        },

        mode(state, value) {
            state.mode = value;
        },
        setModeNormal(state) {
            state.mode = NORMAL_MODE;
        },
        setModeSelect(state) {
            state.mode = SELECT_MODE;
        },
        setModeLink(state) {
            state.mode = LINK_MODE;
        },
        setModeDrawing(state) {
            state.mode = DRAWING_MODE;
        },

        setDrawerNone(state) {
            setTimeout(() => {
                state.drawerMounted = NO_DRAWER;
            }, 300); // Toolbar position is recomputed after drawer is (un)mounted
            state.drawer = NO_DRAWER;
        },
        setDrawerComponent(state) {
            state.drawer = COMPONENT_DRAWER;
            setTimeout(() => {
                state.drawerMounted = COMPONENT_DRAWER;
            }, 300); // Toolbar position is recomputed after drawer is (un)mounted
        },
        setDrawerUser(state) {
            state.drawer = USER_DRAWER;
            setTimeout(() => {
                state.drawerMounted = USER_DRAWER;
            }, 300); // Toolbar position is recomputed after drawer is (un)mounted
        },

        event(state, value) {
            const eventObject =
                typeof value === "object" ? value : { name: value };
            eventObject.time = Date.now();
            state.event = eventObject;
        },

        selectedPositionIds(state, value) {
            state.selectedPositionIds = value;
        },
        selectedLinkIds(state, value) {
            state.selectedLinkIds = value;
        },
        dragInProgress(state, value) {
            state.dragInProgress = value;
        },
        selectInProgress(state, value) {
            state.selectInProgress = value;
        },
        selectPosition(state, value) {
            state.selectPosition = value;
        },

        drawingColor(state, value) {
            state.drawingColor = value;
        },
        drawingEraser(state, value) {
            state.drawingEraser = value;
        },
        drawingWidth(state, value) {
            state.drawingWidth = value;
        },
        fieldEditedByUser(state, value) {
            const key = `${value.fieldId}_${value.positionId}`;
            execAfterPause(`fieldEdit_${key}`, app.delayBeforeHide, () =>
                Vue.delete(state.fieldEditedByUser, key)
            ).catch(() => {
                /* nothing to do */
            });
            Vue.set(state.fieldEditedByUser, key, value);
        },
    },
};
