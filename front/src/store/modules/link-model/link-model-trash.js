import { getters, mutations } from "./link-model-shared";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        /* Trashed link-models will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        restore(_, { worldId, data }) {
            Socket.get({ worldId }).$emit("link-model-trash/restore", {
                document: data.map((x) => ({ _id: x.linkModelId })),
            });
        },
    },
};
