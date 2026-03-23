import Vue from "vue";

// Getters
export function getAsObject(state) {
    return state;
}
export function getAsArray(state) {
    return Object.values(state);
}
export function getById(state) {
    return (id) => {
        return state[id];
    };
}
export function getHashById(state) {
    return (id) => {
        return `${id}-${JSON.stringify(state[id] || {})}`;
    };
}
export function getNameById(state) {
    return (boardId) => {
        let name;
        try {
            name = state[boardId].data.name;
        } catch {
            /* Nothing to do */
        }
        return name || boardId;
    };
}
export function getIsTemplate(state) {
    return (boardId) => {
        return !!state[boardId]?.private?.templatedBy;
    };
}
export function getInstanceByWorld(state) {
    return (worldId) => {
        return Object.values(state)
            .filter((board) => board.worldId === worldId)
            .filter((board) => !board.private.templatedBy);
    };
}
export function getTemplateByWorld(state) {
    return (worldId) => {
        return Object.values(state)
            .filter((board) => board.worldId === worldId)
            .filter((board) => !!board.private.templatedBy);
    };
}
export function getHiddenItems(state, getters) {
    return (id) => {
        return getters.byId(id)?.data?.hiddenItems;
    };
}
export const getters = {
    asObject: getAsObject,
    asArray: getAsArray,
    byId: getById,
    hashById: getHashById,
    nameById: getNameById,
    isTemplate: getIsTemplate,
    instanceByWorld: getInstanceByWorld,
    templateByWorld: getTemplateByWorld,
    hiddenItems: getHiddenItems,
};

// Mutations
export function commitSet(state, items) {
    items.forEach((item) => {
        item.boardId = item._id;
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
