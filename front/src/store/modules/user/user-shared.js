import Vue from "vue";

// Getters
export function getAsObject(state) {
    return state;
}
export function getAsArray(state) {
    return Object.values(state);
}
export function getById(state) {
    return (userId) => {
        return state[userId];
    };
}
export const getters = {
    asObject: getAsObject,
    asArray: getAsArray,
    byId: getById,
};

// Mutations
export function commitSet(state, items) {
    items.forEach((item) => {
        item.userId = item._id;
        Vue.set(state, item._id, item);
    });
}
export function commitUnset(state, items) {
    items.forEach((item) => {
        Vue.delete(state, item._id);
    });
}
export function commitReset(state) {
    Object.values(state).forEach((item) => {
        Vue.delete(state, item._id);
    });
}
export const mutations = {
    set: commitSet,
    unset: commitUnset,
    reset: commitReset,
};

export default {
    getters,
    mutations,
};
