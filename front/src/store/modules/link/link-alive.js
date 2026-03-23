const UNDO = "historyUndo";
const REDO = "historyRedo";
import Socket from "../../socket";
import Vue from "vue";
import merge from "lodash.merge";
import app from "../../../conf/app.js";

export default {
    namespaced: true,

    state: () => ({
        items: {},
        initialized: false,
    }),

    getters: {
        asObject(state) {
            return state.items;
        },
        asArray(state) {
            return Object.values(state.items);
        },
        titleById(state) {
            return (id) => {
                return state.items[id]?.data?.title;
            };
        },

        // Filtered state: objects of the link must have a position in current board
        displayable(state, getters, rootState, rootGetters) {
            const ids = [];
            for (let linkId in state.items) {
                const objects = state.items[linkId].objects.map(
                    (object) => object.objectId
                );
                const positions = objects.map((object) =>
                    rootGetters[`positionAlive/byObjectId`](object)
                );
                const foundPositions = positions
                    .map((position) => position.length)
                    .filter((length) => length > 0);
                if (foundPositions.length >= 2) {
                    ids.push([linkId]);
                }
            }
            return ids.map((_id) => getters[`byId`](_id));
        },

        byId(state, getters, rootState, rootGetters) {
            return (id) => {
                if (
                    state.items[id]?.linkModelId ===
                    app.visualWorldComponent.VW_default
                ) {
                    return state.items[id];
                } else {
                    let res = {};
                    res = merge(res, state.items[id]);
                    const model = rootGetters[`linkModelAlive/byId`](
                        state.items[id].linkModelId
                    );
                    if (model?.data) {
                        res = merge(res, { data: model.data });
                        res = merge(res, { objects: model.data.anchors });
                    }
                    return res;
                }
            };
        },
        byObjectId(state, getters) {
            return (objectId) => {
                return getters.asArray
                    .filter((link) => {
                        for (let object of link.objects) {
                            if (object.objectId === objectId) {
                                return true;
                            }
                        }
                        return false;
                    })
                    .map(({ _id }) => getters[`byId`](_id));
            };
        },
    },

    mutations: {
        set(state, items) {
            state.initialized = true;
            items.forEach((item) => {
                item.linkId = item._id;
                if (!item.linkModelId) {
                    item.linkModelId = app.visualWorldComponent.VW_default; // Yeah, default component & link have the same id
                }
                Vue.set(state.items, item._id, item);
                const objectIds = item.objects.map((object) => object.objectId);
                for (let objectId of objectIds) {
                    this.dispatch(`object/read`, {
                        worldId: item.worldId,
                        boardId: item.boardId,
                        objectId,
                    });
                }

                state.newlyCreatedItemsByMe = items[0]?.me
                    ? items.filter((item) => item?.private?.creating)
                    : [];
                if (state.newlyCreatedItemsByMe.length) {
                    const socketName = "link-alive/remove";
                    const socketDocument = state.newlyCreatedItemsByMe.map(
                        (item) => ({ _id: item._id })
                    );
                    this.commit(
                        "undoRedo/undoable",
                        {
                            undoAction: {
                                [UNDO]: {
                                    worldId: items[0].worldId,
                                    boardId: items[0].boardId,
                                    socketName,
                                    socketDocument,
                                },
                                [REDO]: {
                                    worldId: items[0].worldId,
                                    boardId: items[0].boardId,
                                    socketName: `link-trash/restore`,
                                    socketDocument,
                                },
                            },
                        },
                        { root: true }
                    );
                }
            });
        },
        unset(state, items) {
            state.initialized = true;
            items.forEach((item) => {
                Vue.delete(state.items, item._id);
            });
        },
        reset(state) {
            state.initialized = false;
            Object.values(state).forEach((item) => {
                Vue.delete(state.items, item._id);
            });
        },

        furtiveSet(state, payload) {
            payload.forEach((item) => {
                Vue.set(
                    state.items,
                    item._id,
                    merge(state.items[item._id] || {}, {
                        data: item.data,
                        objects: item.objects,
                    })
                );
            });
        },
    },

    actions: {
        create(_, { worldId, boardId, data, object, linkModelId }) {
            Socket.get({ worldId, boardId }).$emit("link-alive/create", {
                document: [
                    {
                        data,
                        object,
                        linkModelId:
                            linkModelId || app.visualWorldComponent.VW_default, // Yeah, default component & link have the same id
                    },
                ],
            });
        },

        read({ state }, { worldId, boardId, linkId }) {
            if (state.initialized) {
                doIt();
            } else {
                setTimeout(doIt, 5000);
            }

            function doIt() {
                if (!linkId) {
                    return;
                }
                if (state.items[linkId]) {
                    return;
                }
                Socket.get({ worldId, boardId }).emit("link-alive/read", {
                    document: [{ _id: linkId }],
                });
            }
        },

        // TODO: update several links at the same time
        update(
            { state, commit, dispatch, rootState },
            {
                worldId,
                boardId,
                linkId,
                data,
                linkModelId,
                reply,
                objects = [],
                undoId,
            }
        ) {
            for (let id = 0; id < objects.length; id++) {
                if (!objects[id]) {
                    objects[id] = {};
                }
                if (!objects[id]._id) {
                    objects[id]._id = state.items[linkId]?.objects?.[id]._id;
                }
            }
            const document = [
                {
                    _id: linkId,
                    data,
                    objects,
                    linkModelId: linkModelId,
                },
            ];
            Socket.get({ worldId, boardId }).$emit("link-alive/update", {
                document,
                reply,
            });
            const socketName = "link-alive/update";

            // Save data that would be necessary is case of undo
            let undoAction = rootState.undoRedo.undoActions[undoId] || {};
            undoAction[UNDO] = undoAction[UNDO] || {
                worldId,
                boardId,
                socketName,
                socketDocument: document.map((item) => ({
                    _id: state.items[item._id]._id,
                    data: state.items[item._id].data,
                    linkModelId: state.items[item._id].linkModelId,
                    objects: state.items[item._id].objects.map((item) => ({
                        _id: item._id,
                        data: item.data,
                    })),
                })),
            };

            undoAction[REDO] = {
                worldId,
                boardId,
                socketName,
                socketDocument: document,
            };
            if (!(data && "title" in data)) {
                commit(
                    "undoRedo/undoable",
                    { undoId, undoAction },
                    { root: true }
                );
            }

            if (!reply) {
                commit("furtiveSet", document);
            }

            // Save latest link model
            if (
                !document.some((item) => {
                    return (
                        (item.data && item.data.title) ||
                        (item.objects.length &&
                            item.objects.every(
                                (item, i, arr) => arr.length == 2 && item.data
                            ))
                    );
                })
            ) {
                dispatch(
                    "latestLinkModel/update",
                    { worldId, boardId, document },
                    { root: true }
                );
            }
        },

        delete({ commit }, { worldId, boardId, document }) {
            Socket.get({ worldId, boardId }).$emit("link-alive/remove", {
                document: document.map(({ linkId }) => ({ _id: linkId })),
            });

            const socketName = "link-alive/remove";
            const antiSocketName = `link-trash/restore`;
            const socketDocument = document.map((item) => ({
                _id: item.linkId,
            }));

            // Save data that would be necessary is case of undo
            commit(
                "undoRedo/undoable",
                {
                    undoAction: {
                        [UNDO]: {
                            worldId,
                            boardId,
                            socketName: antiSocketName,
                            socketDocument,
                        },
                        [REDO]: {
                            worldId,
                            boardId,
                            socketName,
                            socketDocument,
                        },
                    },
                },
                { root: true }
            );
        },
    },
};
