import Vue from "vue";

// Getters
export function getAsObject(state) {
    return state;
}
export function getAsArray(state) {
    return Object.values(state);
}
export function getAsSortedArray(state) {
    return Object.values(state).sort((a, b) => {
        const nameA = a.data.name || a.worldId;
        const nameB = b.data.name || b.worldId;
        return nameA.localeCompare(nameB);
    });
}
export function getById(state) {
    return (worldId) => {
        if (state[worldId]) {
            return state[worldId];
        } else {
            return {
                worldId,
                name: worldId,
                rootable: false,
                private: {
                    useMaxDbSize: 1,
                    useMaxGuest: 10,
                    useMaxUser: 10,
                    useMaxJiraProjects: 5,
                },
            };
        }
    };
}
export function getNameById(state) {
    return (worldId) => {
        let name;
        try {
            name = state[worldId].data.name;
        } catch {
            /* Nothing to do */
        }
        return name || worldId;
    };
}
export const getters = {
    asObject: getAsObject,
    asArray: getAsArray,
    asSortedArray: getAsSortedArray,
    byId: getById,
    nameById: getNameById,
};

// Mutations
export function commitSet(state, items) {
    items.forEach((item) => {
        item.worldId = item._id;
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
