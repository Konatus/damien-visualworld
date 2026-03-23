import { getters, mutations } from "./world-shared";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        /* Worlds will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        create(_, { data, limits }) {
            Socket.get({}).$emit("world-alive/create", {
                document: [
                    {
                        data,
                        private: limits,
                    },
                ],
            });
        },

        update(_, { worldId, data, reply }) {
            Socket.get({ worldId }).$emit("world-alive/update", {
                document: [
                    {
                        _id: worldId,
                        data,
                    },
                ],
                reply,
            });
        },

        delete(_, { worldId }) {
            Socket.get({}).$emit("world-alive/remove", {
                document: [
                    {
                        _id: worldId,
                    },
                ],
            });
        },
    },
};
