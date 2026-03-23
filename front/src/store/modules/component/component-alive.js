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
        create(_, { worldId, data }) {
            Socket.get({ worldId }).$emit("component-alive/create", {
                document: [
                    {
                        data,
                    },
                ],
            });
        },
        update(_, { worldId, componentId, data, reply }) {
            Socket.get({ worldId }).$emit("component-alive/update", {
                document: [
                    {
                        _id: componentId,
                        data,
                    },
                ],
                reply,
            });
        },
        checkDelete(_, { worldId, componentId }) {
            Socket.get({ worldId }).emit("component-alive/check-remove", {
                document: [
                    {
                        _id: componentId,
                    },
                ],
            });
        },
        delete(_, { worldId, componentId }) {
            Socket.get({ worldId }).$emit("component-alive/remove", {
                document: [
                    {
                        _id: componentId,
                    },
                ],
            });
        },
    },
};
