import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        importStatus: null,
    }),

    getters: {
        byId(state) {
            return (id) => {
                return state[id];
            };
        },
        importStatus: (state) => state.importStatus,
    },

    mutations: {
        set(state, payload) {
            Vue.set(state, "importStatus", payload[0].data);
        },
        unset(state) {
            Vue.set(state, "importStatus", null);
        },
        reset(state) {
            Vue.set(state, "importStatus", null);
        },
    },

    actions: {
        set({ commit }, { worldId, VW, error }) {
            commit("reset");
            if (error) {
                Socket.get({ worldId }).$emit("template-io/set", {
                    document: { error },
                });
            } else {
                Socket.get({ worldId }).$emit("template-io/set", {
                    document: { VW },
                });
            }
        },
    },
};
