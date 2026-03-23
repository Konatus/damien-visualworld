import Vue from "vue";
import app from "../../../conf/app";
export default {
    namespaced: true,

    state: () => ({
        instance: null,
        scene: {
            top: 0,
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            width: 0,
        },
        scale: 1,
        minScale: 0,
        maxScale: app.board.panZoom.maxZoom,
        x: 0,
        y: 0,
    }),

    getters: {
        instance(state) {
            return state.instance;
        },
        scale(state) {
            return state.scale;
        },
        minScale(state) {
            return state.minScale;
        },
        maxScale(state) {
            return state.maxScale;
        },
        x(state) {
            return state.x;
        },
        y(state) {
            return state.y;
        },
        scene(state) {
            return state.scene;
        },
        panzoom(state) {
            return {
                scene: state.scene,
                scale: state.scale,
                x: state.x,
                y: state.y,
            };
        },
    },

    mutations: {
        instance(state, instance) {
            Vue.set(state, "instance", instance);
        },
        scene(state, scene) {
            Vue.set(state, "scene", scene);
        },
        scale(state, scale) {
            Vue.set(state, "scale", scale);
        },
        minScale(state, minScale) {
            Vue.set(state, "minScale", minScale);
        },
        maxScale(state, maxScale) {
            Vue.set(state, "maxScale", maxScale);
        },
        x(state, x) {
            Vue.set(state, "x", x);
        },
        y(state, y) {
            Vue.set(state, "y", y);
        },
        reset(state) {
            state.scene = {
                top: 0,
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                width: 0,
            };
            state.instance = null;
            state.scale = 1;
            state.minScale = 0;
            state.maxScale = app.board.panZoom.maxZoom;
            state.x = 0;
            state.y = 0;
        },
    },
};
