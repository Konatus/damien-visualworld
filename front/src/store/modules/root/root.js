const LOG_MAX_LENGTH = 50;
export default {
    namespaced: true,

    state: () => ({
        log: [],
        debugMode: false,
    }),

    getters: {
        log(state) {
            return state.log.map(
                ({ date, data }) => `[${date.toISOString()}] ${data.toString()}`
            );
        },
        isDebugMode(state) {
            return state.debugMode;
        },
    },

    mutations: {
        log(state, data) {
            state.log.push({
                date: new Date(),
                data,
            });
            if (state.log.length > LOG_MAX_LENGTH) {
                state.log.shift();
            }
        },
        debugMode(state, payload) {
            state.debugMode = !!payload;
        },
    },
    actions: {
        log({ commit, rootGetters }, data) {
            if (rootGetters[`connectionMe/isRoot`]) {
                commit("log", data);
            }
        },
    },
};
