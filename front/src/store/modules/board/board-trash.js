import { getters, mutations } from "./board-shared";
import Socket from "../../socket.js";
export default {
    namespaced: true,

    state: () => ({
        /* Trashed boards will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        restore(_, { worldId, data }) {
            Socket.get({ worldId }).$emit("board-trash/restore", {
                document: data,
            });
        },
    },
};
