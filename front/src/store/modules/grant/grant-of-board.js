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
        boardId(state) {
            return (userId) => {
                if (state[userId]) {
                    return state[userId].grantId;
                }
            };
        },
        byId(state) {
            return (boardGrantId) => {
                if (state[boardGrantId]) {
                    return state[boardGrantId].data;
                } else {
                    return {
                        observer: false,
                        participant: false,
                        animator: false,
                    };
                }
            };
        },
    },

    mutations: {
        set(state, items) {
            items.forEach((item) => {
                item.grantId = item._id;
                Vue.set(state, item.userId, item);
            });
        },
        unset(state, items) {
            items.forEach((item) => {
                Vue.delete(state, item.userId);
            });
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item.userId);
            });
        },
    },

    actions: {
        create(_, { worldId, boardId, userId, data }) {
            if (Socket.exist({ worldId, boardId })) {
                Socket.get({ worldId, boardId }).$emit("board-grant/create", {
                    document: [
                        {
                            data,
                            boardId,
                            userId,
                        },
                    ],
                });
            }
        },

        update(_, { worldId, boardId, grantId, data }) {
            if (Socket.exist({ worldId, boardId })) {
                Socket.get({ worldId, boardId }).$emit("board-grant/update", {
                    document: [
                        {
                            _id: grantId,
                            //boardId,
                            data,
                        },
                    ],
                });
            }
        },
    },
};
