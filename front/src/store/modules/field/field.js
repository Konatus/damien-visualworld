import Vue from "vue";
export default {
    namespaced: true,

    state: () => ({
        static: {
            fit_text: {
                _id: "fit_text",
                fieldId: "fit_text",
                icon: "el-icon-edit-outline",
                model: "fit_text",
                type: "computed",
                name: "Texte", // TODO: move to label.js
            },
        },
        property: {},
        computed: {},
    }),

    getters: {
        asObject(state) {
            return {
                ...state.static,
                ...state.property,
                ...state.computed,
            };
        },
        asArray(state) {
            return [
                ...Object.values(state.static),
                ...Object.values(state.property),
                ...Object.values(state.computed),
            ];
        },
        byId(state) {
            return (id) => {
                return (
                    state.static[id] || state.property[id] || state.computed[id]
                );
            };
        },
        idAsArray(state) {
            return [
                ...Object.keys(state.static),
                ...Object.keys(state.property),
                ...Object.keys(state.computed),
            ];
        },
        staticIdAsArray(state) {
            return Object.keys(state.static);
        },
        propertyIdAsArray(state) {
            return Object.keys(state.property);
        },
        computedIdAsArray(state) {
            return Object.keys(state.computed);
        },
    },

    mutations: {
        schema(state, payload) {
            try {
                Object.keys(state.property).forEach((id) => {
                    Vue.delete(state.property, id);
                });

                const formMakingConfig = JSON.parse(payload);
                const items = getFieldsFromList(formMakingConfig);
                items.forEach((item) => {
                    item._id = item.model;
                    item.fieldId = item.model;
                    Vue.set(state.property, item._id, item);
                });
            } catch {
                /* not catched */
            }
        },
        computed(state, payload) {
            try {
                Object.keys(state.computed).forEach((id) => {
                    Vue.delete(state.computed, id);
                });

                const items = JSON.parse(payload);
                items.forEach((item) => {
                    item._id = item.model;
                    item.fieldId = item.model;
                    item.icon = "icon-json";
                    Vue.set(state.computed, item._id, item);
                });
            } catch {
                /* not catched */
            }
        },
    },
};

// Extract fields from
const getFieldsFromList = (config) => {
    const out = [];
    try {
        for (let item of config.list) {
            if (item.columns /* && item.type === "grid" */) {
                for (let subItem of item.columns) {
                    out.push(...getFieldsFromList(subItem));
                }
            } else {
                out.push(item);
            }
        }
    } catch {
        /* Nothing to do */
    }
    return out;
};
