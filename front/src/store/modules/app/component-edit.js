export default {
    namespaced: true,

    state: () => ({
        fieldId: null,
    }),

    getters: {
        fieldId(state) {
            return state.fieldId;
        },
    },

    mutations: {
        fieldId(state, value) {
            state.fieldId = value;
        },
    },
};
