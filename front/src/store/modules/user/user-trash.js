import { getters, mutations } from "./user-shared";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        /* Trashed boards will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        restore(_, { worldId, boardId, data }) {
            if (Socket.exist({ worldId })) {
                if (data?.length) {
                    Socket.get({ worldId }).$emit("user-trash/restore", {
                        boardId,
                        document: data,
                    });
                }
            }
        },
    },
};
