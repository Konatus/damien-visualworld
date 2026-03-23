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
            return (userId) => {
                if (state[userId]) {
                    return state[userId].data;
                } else {
                    return {
                        administrator: false,
                        modeler: false,
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
        create(_, { worldId, data, userId }) {
            if (Socket.exist({ worldId })) {
                Socket.get({ worldId }).$emit("grant/create", {
                    document: [
                        {
                            data,
                            userId,
                        },
                    ],
                });
            }
        },

        update(_, { worldId, grantId, data }) {
            if (Socket.exist({ worldId })) {
                Socket.get({ worldId }).$emit("grant/update", {
                    document: [
                        {
                            _id: grantId,
                            data,
                        },
                    ],
                });
            }
        },
    },
};
