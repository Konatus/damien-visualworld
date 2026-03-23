export default {
    namespaced: true,

    state: () => ({
        spinner: false,
    }),

    mutations: {
        spinner(state) {
            state.spinner = !state.spinner;
        },
    },

    actions: {},
};
