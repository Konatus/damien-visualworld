const UNDO = "historyUndo";
const REDO = "historyRedo";
const MAX_UNDO_ACTION = 20;

import Socket from "../../socket";
import Vue from "vue";
import jsonDeepCopy from "../../../utils/json-deep-copy";
export default {
    namespaced: true,

    state: () => ({
        undoActions: {},
        position: 0,
    }),

    getters: {
        undoActions(state) {
            return Object.keys(state.undoActions);
        },
        position(state) {
            return state.position;
        },
    },
    mutations: {
        undoable(state, { undoId, undoAction }) {
            const undoActionId = undoId || `_${Date.now()}`;
            Vue.set(state.undoActions, undoActionId, jsonDeepCopy(undoAction));
        },
        reset(state, payload) {
            if (payload) {
                payload.forEach((item) => {
                    Vue.delete(state.undoActions, item);
                });
            } else {
                state.position = 0;
                Object.keys(state.undoActions).forEach((item) => {
                    Vue.delete(state.undoActions, item);
                });
            }
        },
        undo(state) {
            if (state.position > 0) {
                state.position -= 1;
            }
        },
        redo(state) {
            if (state.position < MAX_UNDO_ACTION) {
                state.position += 1;
            } else {
                this.commit("undoRedo/reset", [
                    Object.keys(state.undoActions)[0],
                ]);
            }
        },
    },
    actions: {
        undo({ state, rootState }, { actionId, eventType }) {
            // Find action to undo or redo, exit if not found
            const action = state.undoActions?.[actionId]?.[eventType];
            const antiAction =
                state.undoActions?.[actionId]?.[
                    eventType === UNDO ? REDO : UNDO
                ];
            if (!action || !antiAction) {
                return;
            }

            //heck if positions have changed since initial action was done, exit if it is the case
            if (antiAction.socketName.startsWith("position")) {
                for (const position of antiAction.socketDocument) {
                    for (let prop of [
                        "top",
                        "left",
                        "width",
                        "height",
                        "zIndex",
                    ]) {
                        if (
                            position?.data?.[prop] !== undefined && // props not modified by the action
                            position?.data?.[prop] !==
                                rootState.positionAlive.items?.[position._id]
                                    ?.data?.[prop] // prop not modified since
                        ) {
                            return;
                        }
                    }
                }
            }

            // Send the socket will undo or redo
            Socket.get({
                worldId: action.worldId,
                boardId: action.boardId,
            }).$emit(action.socketName, {
                document: action.socketDocument,
                reply: true,
            });
        },
    },
};
