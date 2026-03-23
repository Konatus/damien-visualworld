import { getters, mutations } from "./link-model-shared";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        /* Alive link-models will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        create(_, { worldId, data }) {
            Socket.get({ worldId }).$emit("link-model-alive/create", {
                document: [
                    {
                        data,
                    },
                ],
                reply: true,
            });
        },

        update(_, { worldId, linkModelId, data }) {
            Socket.get({ worldId }).$emit("link-model-alive/update", {
                document: [
                    {
                        _id: linkModelId,
                        data,
                    },
                ],
                reply: true,
            });
        },

        checkDelete(_, { worldId, linkModelId }) {
            Socket.get({ worldId }).emit("link-model-alive/check-remove", {
                document: [
                    {
                        _id: linkModelId,
                    },
                ],
                reply: true,
            });
        },

        delete(_, { worldId, linkModelId }) {
            Socket.get({ worldId }).$emit("link-model-alive/remove", {
                document: [
                    {
                        _id: linkModelId,
                    },
                ],
                reply: true,
            });
        },
    },
};
