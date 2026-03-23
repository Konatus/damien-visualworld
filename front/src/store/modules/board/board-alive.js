import { getters, mutations } from "./board-shared";
import Socket from "../../socket.js";
export default {
    namespaced: true,

    state: () => ({
        /* Alive boards will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        /* Common board CRUD */
        create(_, { worldId, data }) {
            Socket.get({ worldId }).$emit("board-alive/create", {
                document: [
                    {
                        data,
                    },
                ],
            });
        },

        update(_, { worldId, boardId, data, reply }) {
            Socket.get({ worldId, boardId }).$emit("board-alive/update", {
                document: [
                    {
                        _id: boardId,
                        data,
                    },
                ],
                reply,
            });
        },

        delete(_, { worldId, boardId }) {
            Socket.get({ worldId }).$emit("board-alive/remove", {
                document: [
                    {
                        _id: boardId,
                    },
                ],
            });
        },

        /* Template of board */
        createTemplate(_, { worldId, data }) {
            Socket.get({ worldId }).emit("board-alive/create-template", {
                document: [
                    {
                        data,
                    },
                ],
            });
        },

        deleteTemplate(_, { worldId, boardId }) {
            Socket.get({ worldId }).emit("board-alive/remove-template", {
                document: [
                    {
                        _id: boardId,
                    },
                ],
            });
        },

        /* State management: load as template or restoration at previous state */
        saveState(_, { worldId, boardId, data }) {
            Socket.get({ worldId, boardId }).emit("board-alive/save-state", {
                document: [
                    {
                        _id: boardId,
                        data,
                    },
                ],
            });
        },

        loadState(_, { worldId, boardId }) {
            Socket.get({ worldId, boardId }).emit("board-alive/load-state", {
                document: [
                    {
                        _id: boardId,
                    },
                ],
            });
        },

        /* Add a state of a board (template of board) into another */
        addState(_, { worldId, boardId, templateBoardId, data }) {
            Socket.get({ worldId, boardId }).emit("board-alive/add-state", {
                document: [
                    {
                        _id: templateBoardId,
                        data,
                    },
                ],
            });
        },
    },
};
