const UNDO = "historyUndo";
const REDO = "historyRedo";
import Vue from "vue";
import merge from "lodash.merge";
import isEqual from "lodash.isequal";
import app from "../../../conf/app.js";
import { execAfterPause } from "../../../utils/frequency-limit";
import jsonDeepCopy from "../../../utils/json-deep-copy";
import Position from "../../../utils/position";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        initialized: false,
        items: {}, // Positions will be added as properties of items
        matchItems: {}, // Positions that match
        newlyCreatedItemsByMe: [], // Used by BoardLayer to select the positions newly created by the current user
    }),

    getters: {
        asObject(state) {
            return state.items;
        },
        asArray(state) {
            return Object.values(state.items);
        },
        byId(state) {
            return (positionId) => {
                return state.items[positionId];
            };
        },
        byObjectId(state) {
            return (objectId) => {
                return Object.values(state.items).filter(
                    (x) => x.objectId === objectId
                );
            };
        },
        byPosition(state) {
            return ({ left, top, isBackground }) => {
                return Object.values(state.items)
                    .filter(
                        (x) =>
                            x.protect.isBackground === isBackground &&
                            x.data.left <= left &&
                            left <= x.data.left + x.data.width &&
                            x.data.top <= top &&
                            top <= x.data.top + x.data.height
                    )
                    .sort((a, b) => b.data.zIndex - a.data.zIndex);
            };
        },
        zIndexMax(state) {
            return Math.max(
                app.board.zIndex.default,
                ...Object.values(state.items).map(
                    (x) => x.data.zIndex || app.board.zIndex.default
                )
            );
        },
        zIndexMin(state) {
            return Math.min(
                app.board.zIndex.default,
                ...Object.values(state.items).map(
                    (x) => x.data.zIndex || app.board.zIndex.default
                )
            );
        },
        isInitialized(state) {
            return state.initialized;
        },

        match(state) {
            return (item1, item2) => {
                return state.matchItems?.[item1._id]?.[item2._id];
            };
        },
        byMatchPositionId(state) {
            return (positionId) => {
                const position = state.items[positionId];
                const matchedPositionIds = Object.entries(
                    state.matchItems[positionId] || {}
                )
                    .map(([otherPosition, match]) =>
                        match ? otherPosition : null
                    )
                    .filter((matchedPositionId) => !!matchedPositionId);
                return matchedPositionIds.map((_id) => ({
                    ...state.items[_id],
                    isHigher:
                        Position.isHigher(
                            state.items[_id].data,
                            position.data
                        ) ||
                        (state.items[_id]?.protect?.isBackground !== true &&
                            position?.protect?.isBackground === true),
                }));
            };
        },
    },

    mutations: {
        set(state, items) {
            state.initialized = true;
            items.forEach((item) => {
                item.positionId = item._id;
                const received = jsonDeepCopy(item);
                item = merge(jsonDeepCopy(state.items[item._id] || {}), item); // nb: deep copy allows reactivity
                if (!item.protect) {
                    item.protect = {};
                }
                if (!item.protect.CALC) {
                    item.protect.CALC = {};
                }
                if (received?.protect?.CALC) {
                    for (let id in received.protect.CALC) {
                        item.protect.CALC[id] = received.protect.CALC[id];
                    }
                }
                if (!item.protect.VW) {
                    item.protect.VW = {};
                }
                if (received?.protect?.VW) {
                    for (let id in received.protect.VW) {
                        item.protect.VW[id] = received.protect.VW[id];
                    }
                }
                if (!item.componentId) {
                    item.componentId = app.visualWorldComponent.VW_default;
                }
                Vue.set(state.items, item._id, item);
            });
            this.commit("positionAlive/setMatch", items);

            if (!items[0]?.me) {
                if (items.some((item) => item?.private?.updating)) {
                    execAfterPause(
                        `positionAlive/set/${items
                            .map((item) => item._id)
                            .join(",")}`,
                        10000 /* ms */,
                        () => {
                            items.forEach((item) => {
                                Vue.delete(
                                    state.items[item._id].private,
                                    "updating"
                                );
                            });
                        }
                    ).catch(() => {
                        /* nothing to do */
                    });
                }
            }

            state.newlyCreatedItemsByMe = items[0]?.me
                ? items.filter((item) => item?.private?.creating)
                : [];
            if (state.newlyCreatedItemsByMe.length) {
                const socketName = items[0]?.protect?.isBackground
                    ? `position-alive/remove-back`
                    : `position-alive/remove-front`;
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
                                socketName: `position-trash/restore`,
                                socketDocument,
                            },
                        },
                    },
                    { root: true }
                );
            }
        },
        unset(state, items) {
            state.initialized = true;
            items.forEach((item) => {
                Object.keys(state.matchItems).forEach((id) => {
                    Vue.delete(state.matchItems[id], item._id);
                });
                Vue.delete(state.items, item._id);
            });
        },
        reset(state) {
            state.initialized = false;
            Vue.set(state, "items", {});
            Vue.set(state, "matchItems", {});
        },
        furtiveSet(state, items) {
            items.forEach((item) => {
                item.positionId = item._id;
                state.items[item._id] = merge(state.items[item._id] || {}, {
                    data: item.data,
                });
                for (let id in item.protect?.CALC || {}) {
                    state.items[item._id].protect.CALC[id] =
                        item.protect?.CALC?.[id];
                }
                state.items[item._id].protect.VW =
                    state.items[item._id].protect.VW || {};
                state.items[item._id].protect.VW.over = item.protect?.VW?.over;
                state.items[item._id].protect.VW.under =
                    item.protect?.VW?.under;
                state.items[item._id].protect.VW.linked =
                    item.protect?.VW?.linked;
            });
            this.commit(
                "positionAlive/setMatch",
                items.filter((position) => position.data)
            );
        },
        setMatch(state, items) {
            items.forEach((item1) => {
                // If nor size nor position has changed, matches havent to be refresh
                if (
                    item1.data === undefined ||
                    item1.data.top === undefined ||
                    item1.data.left === undefined ||
                    item1.data.width === undefined ||
                    item1.data.height === undefined
                ) {
                    return;
                }

                Object.values(state.items).forEach((item2) => {
                    if (item1._id === item2._id) {
                        return;
                    } // self-match doesnt make sense

                    const match =
                        item1._id !== item2._id &&
                        Position.match(item1.data, item2.data);
                    if (!state.matchItems[item1._id]) {
                        Vue.set(state.matchItems, item1._id, {});
                    }
                    if (!state.matchItems[item2._id]) {
                        Vue.set(state.matchItems, item2._id, {});
                    }

                    if (state.matchItems[item1._id][item2._id] !== match) {
                        Vue.set(state.matchItems[item1._id], item2._id, match);
                    }
                    if (state.matchItems[item2._id][item1._id] !== match) {
                        Vue.set(state.matchItems[item2._id], item1._id, match);
                    }
                });
            });
        },
    },

    actions: {
        create(_, { worldId, boardId, data, isBackground }) {
            Socket.get({ worldId, boardId }).$emit(
                isBackground
                    ? `position-alive/create-back`
                    : `position-alive/create-front`,
                {
                    document: data.map((item) => ({
                        objectId: item.objectId, // position created from search with an existing object
                        object: item.object, // data of the object created with the position
                        componentId:
                            item.componentId ||
                            app.visualWorldComponent.VW_default,
                        data: item.data,
                    })),
                }
            );
        },
        update(
            { state, commit, rootState },
            { worldId, boardId, data, isBackground, reply, undoId }
        ) {
            if (!data || !data.length) {
                return;
            }

            const document = data.map((item) => ({
                _id: item.positionId,
                positionId: item.positionId,
                data: item.data,
            }));

            const socketName = isBackground
                ? `position-alive/update-back`
                : `position-alive/update-front`;
            const socketDocument = reply
                ? document
                : document.filter((item) => {
                      // Filter only position that have really changed
                      const merged = merge(
                          jsonDeepCopy(state.items[item._id] || {}),
                          item
                      );
                      return !isEqual(merged, state.items[item.positionId]);
                  });

            // Save data that would be necessary is case of undo
            let undoAction = rootState.undoRedo.undoActions[undoId] || {};
            undoAction[UNDO] = undoAction[UNDO] || {
                worldId,
                boardId,
                socketName,
                socketDocument: socketDocument.map((item) => ({
                    _id: state.items[item._id]._id,
                    positionId: state.items[item._id].positionId,
                    data: state.items[item._id].data,
                })),
            };
            undoAction[REDO] = { worldId, boardId, socketName, socketDocument };
            commit("undoRedo/undoable", { undoId, undoAction }, { root: true });

            // Send socket to API
            if (socketDocument.length || reply) {
                Socket.get({ worldId, boardId }).$emit(socketName, {
                    document: socketDocument,
                    reply,
                });
            }

            if (!reply) {
                commit("furtiveSet", document); // allows live update of selection-view & VW.over/under & links
            }
        },
        transmute({ getters, commit }, { worldId, boardId, data }) {
            const socketName = `position-alive/transmute`;
            const socketDocument = data.map((item) => ({
                objectId: item.objectId,
                componentId:
                    item.componentId || app.visualWorldComponent.VW_default,
            }));
            const antiSocketDocument = data.map((item) => ({
                objectId: item.objectId,
                componentId:
                    getters["byObjectId"](item.objectId).componentId ||
                    app.visualWorldComponent.VW_default,
            }));

            // Save data that would be necessary is case of undo
            commit(
                "undoRedo/undoable",
                {
                    undoAction: {
                        [UNDO]: {
                            worldId,
                            boardId,
                            socketName,
                            socketDocument: antiSocketDocument,
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

            // Send socket to API
            Socket.get({ worldId, boardId }).$emit(socketName, {
                document: socketDocument,
            });
        },
        delete({ commit }, { worldId, boardId, data, isBackground }) {
            const socketName = isBackground
                ? `position-alive/remove-back`
                : `position-alive/remove-front`;
            const antiSocketName = `position-trash/restore`;
            const socketDocument = data.map((item) => ({
                _id: item.positionId,
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

            // Send socket to API
            Socket.get({ worldId, boardId }).$emit(socketName, {
                document: socketDocument,
            });
        },
        setBack: ({ commit }, { worldId, boardId, data, isBackground }) => {
            const socketName = isBackground
                ? `position-alive/set-back`
                : `position-alive/unset-back`;
            const antiSocketName = isBackground
                ? `position-alive/unset-back`
                : `position-alive/set-back`;
            const socketDocument = data.map((item) => ({
                _id: item.positionId,
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

            // Send socket to API
            Socket.get({ worldId, boardId }).$emit(socketName, {
                document: socketDocument,
            });
        },
        list(_, { worldId, boardId }) {
            Socket.get({ worldId, boardId }).$emit(`position-alive/list`);
        },
    },
};
