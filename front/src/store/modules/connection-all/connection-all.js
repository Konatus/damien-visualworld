import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        /* Connections will be added as properties of state */
    }),

    getters: {
        asObject(state) {
            return state;
        },
        asArray(state) {
            return Object.values(state);
        },
        byEmail(state, _, rootState) {
            return (email) => {
                if (state[email]) {
                    return state[email].data;
                } else if (
                    email === rootState.connectionMe?.user?.identity?.email
                ) {
                    return rootState.connectionMe.user;
                } else {
                    return {};
                }
            };
        },
        splittedNameByEmail(state, getters) {
            return (email) => {
                const out = [];
                try {
                    const userData = getters.byEmail(email).identity;
                    if (userData.firstname) {
                        out.push(userData.firstname.trim());
                    }
                    if (userData.lastname) {
                        out.push(userData.lastname.trim());
                    }
                    if (out.length === 0) {
                        out.push(userData.email.trim());
                    }
                } catch {
                    /* nothing to do */
                }
                return out;
            };
        },
        initialsByEmail(state, getters) {
            return (email) => {
                try {
                    const splittedName = getters.splittedNameByEmail(email);
                    return splittedName.map((name) => name.charAt(0)).join("");
                } catch {
                    return "";
                }
            };
        },
        fullnameByEmail(state, getters) {
            return (email) => {
                try {
                    const splittedName = getters.splittedNameByEmail(email);
                    return splittedName.join(" ");
                } catch {
                    return "";
                }
            };
        },
        grantClassByEmail(state, getters, rootState, rootGetters) {
            return (email, scope) => {
                try {
                    const userData = getters.byEmail(email);
                    if (userData.profile.app.isRoot) {
                        if (
                            (!scope.worldId && !scope.boardId) ||
                            (scope.worldId &&
                                rootGetters["worldAlive/byId"](scope.worldId)
                                    ?.data?.rootable)
                        ) {
                            return "user-icon-root";
                        }
                    }
                    if (userData.grantLevel.owner) {
                        return "user-icon-ow";
                    }
                    if (userData.grantLevel.administrator) {
                        return "user-icon-wm";
                    }
                    if (userData.grantLevel.modeler) {
                        return "user-icon-cm";
                    }
                    if (userData.grantLevel.animator) {
                        return "user-icon-bm";
                    }
                    if (userData.grantLevel.participant) {
                        return "user-icon-su";
                    }
                    if (userData.grantLevel.observer) {
                        return "user-icon-so";
                    }
                } catch {
                    /* nothing to do */
                }
                return "user-icon-none";
            };
        },
    },

    mutations: {
        set(state, items) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item._id);
            });
            items.forEach((item) => {
                Vue.set(state, item._id, item);
            });
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item._id);
            });
        },
    },
};
