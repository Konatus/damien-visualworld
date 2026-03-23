import { getters, mutations } from "./component-shared";
import Socket from "../../socket.js";
export default {
    namespaced: true,

    state: () => ({
        items: {}, // data retrieved from server
        initialized: false,
    }),

    getters,
    mutations,

    actions: {
        restore(_, { worldId, data }) {
            Socket.get({ worldId }).$emit("component-trash/restore", {
                document: data.map((x) => ({ _id: x.componentId })),
            });
        },
    },
};
