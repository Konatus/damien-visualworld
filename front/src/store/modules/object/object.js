import Socket from "../../socket.js";
import Url from "../../../conf/url.js";

import Vue from "vue";
import merge from "lodash.merge";
import jsonDeepCopy from "../../../utils/json-deep-copy.js";
export default {
    namespaced: true,

    state: () => ({
        items: {},
        cache: {},
        initialized: false,
    }),

    getters: {
        asObject(state) {
            return state.items;
        },
        asArray(state) {
            return Object.values(state.items);
        },
        byId(state) {
            return (id) => {
                return state.items[id];
            };
        },
        isInitialized(state) {
            return state.initialized;
        },
    },

    mutations: {
        set(state, items) {
            state.initialized = true;
            items.forEach((item) => {
                item.objectId = item._id;

                // Build URL of images
                for (let property in item.data) {
                    if (Array.isArray(item.data[property])) {
                        for (let img of item.data[property]) {
                            if (img && img.key && !img.url) {
                                img.url = Url.img({
                                    worldId: item.worldId,
                                    key: img.key,
                                });
                            }
                        }
                    }
                }

                item.data = Object.assign(
                    jsonDeepCopy(state.items[item._id]?.data || {}),
                    item.data
                );
                item.protect = Object.assign(
                    jsonDeepCopy(
                        state.items[item._id]?.protect || {
                            styleBackgroundColor: null,
                            styleOutlineColor: null,
                            styleColor: null,
                        }
                    ),
                    item.protect
                );
                Vue.set(state.items, item._id, item);
                Vue.set(state.cache, item._id, {
                    data: jsonDeepCopy(item.data || {}),
                    protect: jsonDeepCopy(item.protect || {}),
                });
            });
        },
        unset(state, items) {
            state.initialized = true;
            items.forEach((item) => {
                Vue.delete(state.items, item._id);
                Vue.delete(state.cache, item._id);
            });
        },
        reset(state) {
            state.initialized = false;
            Object.values(state).forEach((item) => {
                Vue.delete(state.items, item._id);
                Vue.delete(state.cache, item._id);
            });
        },

        furtiveSet(state, payload) {
            payload.forEach((item) => {
                Vue.set(
                    state.items,
                    item._id,
                    merge(state.items[item._id] || {}, {
                        data: item.data || {},
                        protect: item.protect || {},
                        me: true,
                    })
                );
            });
        },
    },

    actions: {
        read({ state }, { worldId, boardId, objectId }) {
            if (state.initialized) {
                doIt();
            } else {
                setTimeout(doIt, 5000);
            }

            function doIt() {
                if (!objectId) {
                    return;
                }
                if (state.items[objectId]) {
                    return;
                }
                Socket.get({ worldId, boardId }).$emit("object/read", {
                    document: [{ _id: objectId }],
                });
            }
        },

        update({ state, commit }, { worldId, boardId, payload, reply }) {
            const document = payload
                .map((item) => {
                    let mustBeSaved = false;

                    const { objectId, data, protect } = item;
                    if (!objectId) {
                        return;
                    }

                    // Check if the object has changed
                    if (data) {
                        for (let key in data) {
                            if (
                                key !== "undefined" &&
                                key !== undefined && // TODO: catch before
                                data[key] !==
                                    state.cache[objectId]?.data?.[key] &&
                                JSON.stringify(data[key]) !==
                                    JSON.stringify(
                                        state.cache[objectId]?.data?.[key]
                                    )
                            ) {
                                mustBeSaved = true;
                                break;
                            }
                        }
                    }
                    if (protect) {
                        for (let key in protect) {
                            if (
                                key !== "undefined" &&
                                key !== undefined && // TODO: catch before
                                protect[key] !==
                                    state.cache[objectId]?.protect?.[key] &&
                                JSON.stringify(protect[key]) !==
                                    JSON.stringify(
                                        state.cache[objectId]?.protect?.[key]
                                    )
                            ) {
                                mustBeSaved = true;
                                break;
                            }
                        }
                    }
                    if (!mustBeSaved) {
                        return;
                    }

                    // Change undefined to null, for reactivity reasons
                    if (data) {
                        for (let key in data) {
                            if (data[key] === undefined) {
                                data[key] = null;
                            }
                        }
                    }

                    // CALC & VW must NOT be saved inside the object
                    const itemWithoutVwCalc = jsonDeepCopy({
                        _id: objectId,
                        data,
                        protect,
                    });
                    if (itemWithoutVwCalc.data) {
                        itemWithoutVwCalc.data.VW = null;
                        itemWithoutVwCalc.data.CALC = null;
                    }
                    return itemWithoutVwCalc;
                })
                .filter((item) => item);

            if (document.length) {
                Socket.get({ worldId, boardId }).$emit("object/update", {
                    document,
                    reply,
                });
                if (!reply) {
                    // TODO: seems to be useless... should verify
                    commit("furtiveSet", document);
                }
            }
        },
    },
};
