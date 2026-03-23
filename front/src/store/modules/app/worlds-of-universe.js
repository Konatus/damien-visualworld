import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({}),

    getters: {
        worldId(state) {
            return state["worldId"];
        },
    },

    mutations: {
        worldId(state, value) {
            Vue.set(state, "worldId", value);
        },
    },
};
