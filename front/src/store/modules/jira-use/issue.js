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
            console.log("[JIRA ISSUE STORE] Received items:", {
                count: items.length,
                firstItem: items[0]
                    ? {
                          hasData: !!items[0].data,
                          hasKey: !!items[0].data?.key,
                          key: items[0].data?.key,
                          hasFields: !!items[0].data?.fields,
                          hasCreated: !!items[0].data?.fields?.created,
                          dataKeys: items[0].data
                              ? Object.keys(items[0].data)
                              : [],
                      }
                    : null,
            });

            this.commit("jiraUse/issue/reset");
            items.forEach((item, index) => {
                if (item.data.error) {
                    Vue.set(state, "error", item.data.error);
                } else {
                    if (!item.data.key) {
                        console.error(
                            `[JIRA ISSUE STORE] Item ${index} missing key:`,
                            item.data
                        );
                    }
                    Vue.set(state, item.data.key, item.data);
                }
            });

            console.log("[JIRA ISSUE STORE] State after set:", {
                stateKeys: Object.keys(state),
                firstStateItem: Object.values(state)[0],
            });
        },
        unset(state, items) {
            items.forEach((item) => {
                Vue.delete(state, item);
            });
        },
        reset(state) {
            Object.values(state).forEach((item) => {
                Vue.delete(state, item.key || "error");
            });
        },
    },

    actions: {
        get(_, { worldId, boardId, jql }) {
            if (worldId) {
                Socket.get({ worldId, boardId }).$emit("jira-issue/get", {
                    document: [
                        {
                            jql,
                        },
                    ],
                });
            }
        },
        create(_, { worldId, boardId, data }) {
            Socket.get({ worldId, boardId }).$emit(`jira-issue/create`, {
                document: data,
            });
        },
    },
};
