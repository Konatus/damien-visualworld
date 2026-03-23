import Socket from "../../socket";

import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({}),

    getters: {
        asArray(state) {
            return Object.values(state);
        },
        asError(state) {
            return state.error;
        },
    },

    mutations: {
        set(state, items) {
            console.log("[JIRA STORE] Receiving projects:", items?.length || 0);
            console.log("[JIRA STORE] Items:", items);

            if (items.length) {
                this.commit("jiraUse/project/reset");
            }
            items.forEach((item) => {
                console.log("[JIRA STORE] Processing item:", item);
                if (item.data.error) {
                    console.log(
                        "[JIRA STORE] Error detected:",
                        item.data.error
                    );
                    Vue.set(state, "error", item.data.error);
                } else {
                    console.log(
                        "[JIRA STORE] Setting project:",
                        item.data.key,
                        item.data
                    );
                    Vue.set(state, item.data.key, item.data);
                }
            });

            console.log("[JIRA STORE] Final state:", Object.keys(state));
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item.key || "error");
            });
        },
    },

    actions: {
        get(_, { worldId, boardId }) {
            if (worldId) {
                Socket.get({ worldId, boardId }).$emit("jira-project/get", {});
            }
        },
    },
};
