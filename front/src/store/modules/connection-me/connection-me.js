import Socket from "../../socket";
import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        user: {},
    }),

    getters: {
        email(state) {
            return state.user.identity.email;
        },
        locale(state) {
            return state.user.identity?.locale;
        },
        worldById(state) {
            return (worldId) => {
                return state.user.profile.world[worldId];
            };
        },

        isRoot(state) {
            return () => {
                let out = false;
                try {
                    out = state.user.profile.app.isRoot;
                } catch (e) {
                    /* Nothing to do */
                }
                return out;
            };
        },
        terms(state) {
            let out;
            try {
                out = state.user.identity.terms;
            } catch (e) {
                /* Nothing to do */
            }
            return out;
        },

        // Grant related to one profile
        hasProfile(state) {
            return (
                profileName,
                request,
                level = { atWorldLevel: true, atBoardLevel: true }
            ) => {
                let out = false;
                try {
                    const { atWorldLevel, atBoardLevel } = level;

                    // out = state.user.profile.app[ profileName ]
                    if (!out && request.worldId != undefined && atWorldLevel) {
                        out =
                            state.user.profile.world[request.worldId][
                                profileName
                            ];
                    }
                    if (!out && request.boardId != undefined && atBoardLevel) {
                        out =
                            state.user.profile.board[request.boardId][
                                profileName
                            ];
                    }
                } catch {
                    /* Nothing to do */
                }
                return out;
            };
        },
        // Grant related to at least one of requested profiles
        hasOneProfile(state, getters) {
            return (profileNames, request) => {
                for (const profileName of profileNames) {
                    if (getters.hasProfile([profileName], request)) {
                        return true;
                    }
                }
                return false;
            };
        },

        // Grant for a requested grant
        isGrantedFor(state, getters, rootState) {
            return (socketNames, request) => {
                let out = false;
                try {
                    const rawSocketName = socketNames[0];
                    let socketName = rawSocketName;
                    if (socketName === "position-alive/duplicate") {
                        socketName = "position-alive/create-front";
                    } // TODO: remove

                    // Check raw grant
                    out = state.user.grant.app.includes(socketName);
                    if (
                        !out &&
                        request.worldId != undefined &&
                        state.user?.grant?.world?.[request.worldId]
                    ) {
                        out =
                            state.user.grant.world[request.worldId].includes(
                                socketName
                            );
                    }
                    if (
                        !out &&
                        request.boardId != undefined &&
                        state.user?.grant?.board?.[request.boardId]
                    ) {
                        out =
                            state.user.grant.board[request.boardId].includes(
                                socketName
                            );
                    }

                    // Check also feature flipping of current board
                    if (
                        out === true &&
                        request.boardId != undefined &&
                        !getters[`hasOneProfile`](
                            ["animator", "modeler", "administrator"],
                            request
                        ) &&
                        !getters[`isRoot`]()
                    ) {
                        const mapping = {
                            // TODO: rename enableObjectXxxx properties with a name inherited from the socket name
                            "position-alive/create-front":
                                "enableObjectCreation",
                            "position-alive/create-back":
                                "enableObjectCreation",
                            "position-alive/duplicate":
                                "enableObjectDuplication",
                            "position-alive/remove-front":
                                "enableObjectDeletion",
                            "position-alive/remove-back":
                                "enableObjectDeletion",
                            "position-alive/resize-front": "enableObjectResize",
                            "position-alive/resize-back": "enableObjectResize",
                            "object/update": "enableObjectEdition",
                            "object-model/update": "enableObjectModelChange",
                        };
                        if (Object.keys(mapping).includes(rawSocketName)) {
                            const board =
                                rootState.boardAlive?.[request.boardId];
                            out = board?.data?.[mapping[rawSocketName]];
                        }
                    }
                } catch {
                    /*  Nothing to do */
                }
                return out;
            };
        },
        // Grant for at least one of requested grant
        isGrantedForOne(state, getters) {
            return (socketNames, request) => {
                for (const socketName of socketNames) {
                    if (getters.isGrantedFor([socketName], request)) {
                        return true;
                    }
                }
                return false;
            };
        },
        // Grant for all of requested grant
        isGrantedForAll(state, getters) {
            return (socketNames, request) => {
                for (const socketName of socketNames) {
                    if (!getters.isGrantedFor([socketName], request)) {
                        return false;
                    }
                }
                return true;
            };
        },
        // Always says: not granted!
        isNotGranted() {
            return () => {
                return false;
            };
        },
        // Granted has world manager of the demo world
        isDemoAdministrator(state) {
            return (scope) => {
                const worldIds = scope?.worldId
                    ? [scope.worldId]
                    : Object.keys(state.user.profile.world);
                for (let worldId of worldIds) {
                    if (state.user.profile.world[worldId].demoAdministrator) {
                        return true;
                    }
                }
                return false;
            };
        },
    },

    mutations: {
        set(state, payload) {
            if (payload && payload.document) {
                for (let item of payload.document) {
                    Vue.set(state, "user", item.data);
                    break;
                }
            }
        },
    },
    actions: {
        update(_, data) {
            Socket.get({}).$emit("connection-me/update", {
                document: [data],
            });
        },
    },
};
