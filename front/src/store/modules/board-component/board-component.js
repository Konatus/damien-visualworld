import Socket from "../../socket";
import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        items: [],
    }),

    getters: {
        byLayer(state, getters, rootState, rootGetters) {
            return ({ isBackground }) => {
                const componentAlive = rootGetters["componentAlive/asId"];
                return Object.values(state.items)
                    .filter((x) => x.data.isBackground == isBackground)
                    .filter(
                        (x) =>
                            x?.data?.componentId &&
                            componentAlive.includes(x.data.componentId)
                    )
                    .map((x) => x.data);
            };
        },
    },

    mutations: {
        set(state, items) {
            Vue.set(state, "items", items);
        },
        reset(state) {
            Vue.set(state, "items", []);
        },
    },

    actions: {
        update(_, { worldId, boardId, data, isBackground }) {
            let index = 0;
            const positions = data.map((componentId) => ({
                componentId,
                rank: index++,
            })); // data already sorted by vue-draggable
            Socket.get({ worldId, boardId }).$emit("board-component/set", {
                document: {
                    _id: boardId,
                    data: {
                        [isBackground ? "background" : "foreground"]: positions,
                    },
                },
            });
        },
    },
};
