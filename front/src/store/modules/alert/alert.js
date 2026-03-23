let nextId = 0;
export default {
    namespaced: true,

    state: () => ({
        items: [],
    }),

    getters: {
        asArray(state) {
            return state.items;
        },
    },

    mutations: {
        add(state, value) {
            value.id = nextId++;
            state.items.push(value);
        },
        remove(state, value) {
            state.items = state.items.filter((item) => {
                return item.id != value;
            });
        },
    },
};
