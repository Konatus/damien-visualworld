import Socket from "../../socket";

import Vue from "vue";

export default {
    namespaced: true,

    state: () => ({
        /* Available boards will be added as properties of state */
    }),

    getters: {
        byWorldId(state) {
            return (worldId) => {
                return state[worldId]?.data;
            };
        },
    },

    mutations: {
        set(state, items) {
            items.forEach((item) => {
                item._id = item.worldId;
                item.data.forEach((board) => {
                    board.boardId = board._id;
                });
                item.data.sort((a, b) => a.name.localeCompare(b.name));
                Vue.set(state, item._id, item);
            });
        },
        unset(state, items) {
            items.forEach((item) => {
                Vue.delete(state.items, item._id);
            });
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state.items, item._id);
            });
        },
    },

    actions: {
        readBoards(_, { worldId }) {
            Socket.get({ worldId }).$emit(`board-shortcut/read-boards`, {});
        },
    },
};
