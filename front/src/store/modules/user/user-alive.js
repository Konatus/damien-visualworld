import { getters, mutations } from "./user-shared";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        /* Alive boards will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        create(_, { worldId, data, grant, boardId }) {
            if (Socket.exist({ worldId })) {
                Socket.get({ worldId }).$emit("user-alive/create", {
                    document: data.map((item) => ({
                        data: item,
                        grant,
                        boardId,
                    })),
                });
            }
        },

        update(_, { worldId, userId, data }) {
            if (Socket.exist({ worldId })) {
                Socket.get({ worldId }).$emit("user-alive/update", {
                    document: [
                        {
                            _id: userId,
                            data,
                        },
                    ],
                });
            }
        },

        delete(_, { worldId, data }) {
            if (Socket.exist({ worldId })) {
                Socket.get({ worldId }).$emit("user-alive/remove", {
                    document: data.map((item) => ({
                        _id: item.userId,
                    })),
                });
            }
        },
    },
};
