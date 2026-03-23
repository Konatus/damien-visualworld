import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        /* Trashed positions will be added as properties of state */
    }),

    getters: {
        asObject(state) {
            return state;
        },
        asArray(state) {
            return Object.values(state);
        },
        byId(state) {
            return (positionId) => {
                return state[positionId];
            };
        },
    },

    mutations: {
        set(state, items) {
            items.forEach((item) => {
                item.positionId = item._id;
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
        restore(_, { worldId, boardId, data }) {
            Socket.get({ worldId, boardId }).$emit("position-trash/restore", {
                document: data.map((item) => ({
                    _id: item.positionId,
                })),
            });
        },
    },
};
