import Socket from "../../socket";
import Vue from "vue";

export default {
    namespaced: true,

    state: () => ({
        teams: [],
        error: null,
        loading: false,
    }),

    getters: {
        teams(state) {
            return state.teams;
        },
        error(state) {
            return state.error;
        },
        loading(state) {
            return state.loading;
        },
    },

    mutations: {
        set(state, items) {
            state.error = null;
            if (!items || !items.length) return;
            const [item] = items;
            if (item.data.error) {
                state.error = item.data.error;
                state.teams = [];
            } else {
                state.teams = item.data.teams || [];
            }
        },
        setLoading(state, val) {
            state.loading = val;
        },
        reset(state) {
            state.teams = [];
            state.error = null;
            state.loading = false;
        },
    },

    actions: {
        get({ commit }, { worldId, boardId }) {
            if (worldId) {
                commit("setLoading", true);
                Socket.get({ worldId, boardId }).$emit("jira-team/get", {});
            }
        },
    },
};
