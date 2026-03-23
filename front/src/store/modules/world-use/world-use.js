import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({}),

    getters: {
        byId(state) {
            return (worldId) => {
                return state[worldId];
            };
        },
    },

    mutations: {
        set(state, items) {
            items.forEach((item) => {
                item.worldId = item._id;
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
        setLimit(_, { worldId, limits, reply }) {
            if (worldId) {
                Socket.get({ worldId }).$emit("world-use/set", {
                    document: [
                        {
                            _id: worldId, // isnt necessary, API uses the scope to get the worldId
                            private: limits,
                        },
                    ],
                    reply,
                });
            }
        },

        get(_, { worldId }) {
            if (worldId) {
                Socket.get({ worldId }).$emit("world-use/get", {
                    document: [
                        {
                            _id: worldId, // isnt necessary, API uses the scope to get the worldId
                        },
                    ],
                });
            }
        },
    },
};
