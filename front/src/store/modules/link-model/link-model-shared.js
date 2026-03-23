import Vue from "vue";
import { getById } from "../user/user-shared";

// Getters
export function getAsObject(state) {
    return state;
}
export function getAsArray(state) {
    return Object.values(state);
}
export function getAsId(state) {
    return Object.keys(state);
}
export function getbyId(state) {
    return (id) => {
        return state[id];
    };
}
export function getIdByName(state) {
    return (name) => {
        try {
            const items = Object.values(state);
            for (let item of items) {
                if (item?.data?.name === name) {
                    return item._id;
                }
            }
        } catch {
            /* nothing to do */
        }
        return null;
    };
}
export function getNameById(state) {
    return (linkModelId) => {
        try {
            return state[linkModelId].data.name;
        } catch (e) {
            return null;
        }
    };
}
export const getters = {
    asObject: getAsObject,
    asArray: getAsArray,
    asId: getAsId,
    byId: getById,
    idByName: getIdByName,
    nameById: getNameById,
};

// Mutations
export function commitSet(state, items) {
    items.forEach((item) => {
        item.linkModelId = item._id;
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
