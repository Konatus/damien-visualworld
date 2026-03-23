import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        importStatus: null,
    }),

    getters: {
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
        set({ commit }, { worldId, boardId, VW, options }) {
            commit("reset");
            Socket.get({ worldId, boardId }).$emit("board-io/set", {
                document: {
                    VW,
                    options,
                },
            });
        },
        setError({ commit }, { worldId, boardId, error }) {
            commit("error", [
                {
                    worldId,
                    boardId,
                    data: {
                        error,
                        success: false,
                    },
                },
            ]);
        },
    },
};
