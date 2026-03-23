import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        /* Objects will be added as properties of state */
    }),

    getters: {
        asObject(state) {
            return state;
        },
        asArray(state) {
            return Object.values(state);
        },
    },

    mutations: {
        set(state, items) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item._id);
            });
            items.forEach((item) => {
                item.objectId = item._id;
                Vue.set(state, item._id, item);
            });
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item._id);
            });
        },
    },

    actions: {
        search(_, { worldId, boardId, search }) {
            Socket.get({ worldId, boardId }).$emit("object-search", {
                document: [search],
            });
        },
    },
};
