import Vue from "vue";
import jsonata from "jsonata";
import app from "../../../conf/app.js";
import jsonataCustomFunctions from "../../../utils/jsonata-custom-functions.js";
const EXTRACT_VARIABLES = jsonata(`$distinct(**.steps.value)`).evaluate;

// Getters
export function getAsObject(state) {
    return state.items;
}
export function getAsArray(state) {
    return Object.values(state.items);
}
export function getAsId(state) {
    return Object.keys(state.items);
}
export function getById(state) {
    return (componentId) => {
        try {
            if (!componentId || !state.initialized) {
                throw new Error();
            }
            return state.items[componentId];
        } catch {
            return app.defaultComponent;
        }
    };
}
export function getIdByName(state) {
    return (name) => {
        try {
            const items = Object.values(state.items);
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
    return (componentId) => {
        try {
            return state.items[componentId].data.name;
        } catch {
            return null;
        }
    };
}
export function getNameIsSet(state) {
    return (name) => {
        try {
            return Object.values(state.items).some((item) => {
                return item?.data?.name == name;
            });
        } catch {
            return false;
        }
    };
}
export function getComputedById(state) {
    return (componentId) => {
        try {
            return state.items[componentId].cacheJsonata;
        } catch {
            return [];
        }
    };
}
export function getSchemaById(state) {
    return (componentId) => {
        try {
            return state.items[componentId].schema;
        } catch {
            return undefined;
        }
    };
}
export function getDefaultDataById(state) {
    return (componentId) => {
        try {
            const res = {};
            for (let model in state.items[componentId].schema) {
                res[model] =
                    state.items[componentId].schema[model]?.options
                        ?.defaultValue || null;
            }
            return res;
        } catch {
            return {};
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
    nameIsSet: getNameIsSet,
    computedById: getComputedById,
    schemaById: getSchemaById,
    defaultDataById: getDefaultDataById,
};

// Mutations
export function commitSet(state, items) {
    state.initialized = true;
    items.forEach((item) => {
        item.componentId = item._id;

        let computed = [];
        try {
            computed = JSON.parse(item.data.computed);
        } catch {
            /* nothing to do */
        }

        computed.forEach((computedItem) => {
            try {
                const expression = jsonata(computedItem.formula);
                for (let func in jsonataCustomFunctions) {
                    expression.registerFunction(
                        func,
                        jsonataCustomFunctions[func]
                    );
                }
                const ast = expression.ast();
                computedItem.jsonata = {
                    evaluate: expression.evaluate,
                    ast,
                    var: EXTRACT_VARIABLES(ast) || [],
                };
            } catch {
                computedItem.jsonata = {
                    evaluate: () => {
                        return null;
                    },
                    ast: null,
                    var: [],
                };
            }
        });
        computed.sort((a, b) => {
            // TODO: better inspect ast than string includes
            if (a.formula.includes(`CALC`)) {
                if (b.formula.includes(`CALC`)) {
                    const aNeedB = a.formula.includes(`CALC.${b.model}`);
                    const bNeedA = b.formula.includes(`CALC.${a.model}`);
                    if (aNeedB) {
                        if (bNeedA) {
                            return 0; // /!\ circular ref
                        } else {
                            return 1;
                        }
                    } else {
                        if (bNeedA) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                } else {
                    return 1; // A has calc dependencies, B hasnt, so B before
                }
            } else {
                if (b.formula.includes(`CALC`)) {
                    return -1; // B has calc dependencies, A hasnt, so A before
                } else {
                    return 0; // Both A & B dont require calc dependencies
                }
            }
        });
        item.cacheJsonata = computed;

        item.schema = {};
        try {
            const parsedSchema = JSON.parse(
                item.data.schemaForm,
                function (k, v) {
                    if (v === "Infinity") {
                        return Infinity;
                    }
                    if (v === "-Infinity") {
                        return -Infinity;
                    }
                    return v;
                }
            );
            for (let field of parsedSchema.list) {
                item.schema[field.model] = field;
            }
        } catch {
            /* nothing to do */
        }
        try {
            for (let field of computed) {
                item.schema[field.model] = {
                    type: "computed",
                    model: field.model,
                };
            }
        } catch {
            /* nothing to do */
        }

        // Build the component, if current call is made by front, not by API
        if (Vue.componentBuild) {
            Vue.componentBuild(item);
        }
        Vue.set(state.items, item._id, item);
    });
}
export function commitUnset(state, items) {
    state.initialized = true;
    items.forEach((item) => {
        Vue.delete(state.items, item._id);
    });
}
export function commitReset(state) {
    state.initialized = false;
    Object.values(state.items).forEach((item) => {
        Vue.delete(state.items, item._id);
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
