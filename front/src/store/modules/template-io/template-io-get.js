import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({}),

    getters: {
        byId(state) {
            return (id) => {
                return state[id];
            };
        },
    },

    mutations: {
        set(state, items) {
            items.forEach((item) => {
                Vue.set(state, item._id, item);
            });
        },
        unset(state, items) {
            items.forEach((item) => {
                Vue.delete(state, item._id);
            });
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item._id);
            });
        },
    },

    actions: {
        get({ commit }, { worldId }) {
            commit("unset", [{ _id: worldId }]);
            Socket.get({ worldId }).$emit("template-io/get", {
                document: {
                    /* */
                },
            });
        },
    },
};
