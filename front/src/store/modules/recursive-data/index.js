import isEqual from "lodash.isequal";
import flatten from "lodash.flatten";
import jsonDeepCopy from "../../../utils/json-deep-copy.js";
import Vue from "vue";
import Socket from "../../socket.js";
export default {
    namespaced: true,

    state: () => ({
        // cacheFull: {}, // Must be not reactive! Avoid many rerenders of muppet!
        cacheCalc: {},
    }),

    getters: {
        full(state, getters, rootState, rootGetters) {
            return (
                { positionId, componentId, staticData },
                { filter, stack = [] } = {}
            ) => {
                if (!staticData) {
                    if (
                        !positionId ||
                        !rootState.positionAlive.initialized ||
                        !rootState.object.initialized
                    )
                        return null; // Store isnt fully initialized
                    if (stack.map((x) => x.positionId).includes(positionId))
                        return null; // Avoid infinite loop
                    if (
                        stack.filter((x) => x.isOver).length >= 1 &&
                        stack.filter((x) => x.isUnder).length >= 1
                    )
                        return null; // Avoid over/under side effect
                    if (
                        stack.filter((x) => x.isOver).length +
                            stack.filter((x) => x.isUnder).length >=
                        3
                    )
                        return null; // Avoid deep over/over/over or under/under/under
                }
                if (stack.length == 0) stack = [{ positionId }];

                const fullData = getters.properties({
                    positionId,
                    componentId,
                    staticData,
                });
                fullData.positionId = positionId;

                // Muppet will compute VW & OVER then save them as a kind of "cahe" in the position's protect
                const useCache = false;
                if (!useCache || staticData) {
                    try {
                        let filterComputedModel = filter
                            ? jsonDeepCopy(filter)
                            : ["VW", "CALC"];
                        const computeds =
                            rootGetters[`componentAlive/computedById`](
                                componentId
                            );
                        for (let k = computeds.length - 1; k >= 0; k--) {
                            // Index descending, because computeds that need others are lasts
                            const computed = computeds[k];
                            if (
                                !filter ||
                                filterComputedModel.includes(computed.model)
                            ) {
                                filterComputedModel = [
                                    ...filterComputedModel,
                                    ...computed.jsonata.var,
                                ];
                            }
                        }

                        if (filterComputedModel.includes("VW")) {
                            fullData.data.VW = getters.VW(
                                { positionId, componentId },
                                { filter: filterComputedModel, stack }
                            );
                        }
                        if (filterComputedModel.includes("CALC")) {
                            fullData.data.CALC = getters.CALC(
                                {
                                    positionId,
                                    componentId,
                                    data: fullData.data,
                                },
                                { filter: filterComputedModel, stack }
                            );
                        }
                    } catch {
                        /* nothing to do */
                    }
                }

                // Real users dont compute VW & CALC themselves, but read the "cache"
                else {
                    const position =
                        rootGetters[`positionAlive/byId`](positionId);
                    fullData.data.CALC = position?.protect?.CALC || {};
                    fullData.data.VW = position?.protect?.VW || {};

                    // createdByMe depends on user, cant be computed by muppet, only used by template HTML
                    if (
                        !fullData.data.VW.wordId ||
                        !fullData.data.VW.createdBy
                    ) {
                        fullData.data.VW.createdByMe = false;
                    } else {
                        fullData.data.VW.createdByMe = [
                            rootGetters["connectionMe/worldById"](
                                fullData.data.VW.worldId
                            )?.userId,
                            rootGetters["connectionMe/terms"],
                            rootGetters["connectionMe/email"],
                        ].includes(fullData.data.VW.createdBy);
                    }

                    // size could cause frequent updates, also provided for template HTML only
                    fullData.data.VW.width = position.data.width;
                    fullData.data.VW.height = position.data.height;
                }

                return fullData;
            };
        },

        properties(state, getters, rootState, rootGetters) {
            return ({ positionId, componentId, staticData }) => {
                let fullData;
                try {
                    // Static data is provided
                    if (staticData) {
                        fullData = jsonDeepCopy({ data: staticData });
                    }

                    // Valued properties
                    else {
                        fullData = jsonDeepCopy(
                            rootGetters[`object/byId`](
                                rootState.positionAlive.items[positionId]
                                    .objectId
                            )
                        );
                        if (!fullData) {
                            fullData = { data: {} };
                        }
                    }

                    // Not set properties are initiated to null (for component reactivity)
                    const componentSchema =
                        rootGetters[`componentAlive/schemaById`](componentId);
                    for (let fieldName in componentSchema) {
                        if (
                            !Object.prototype.hasOwnProperty.call(
                                fullData.data,
                                fieldName
                            ) ||
                            fullData.data[fieldName] === undefined
                        ) {
                            fullData.data[fieldName] = null;
                        }
                    }
                    fullData.objectId =
                        rootState.positionAlive.items[positionId].objectId;
                } catch {
                    /* not catched */
                }
                return fullData;
            };
        },

        VW(state, getters, rootState, rootGetters) {
            return ({ positionId, componentId }, { filter, stack = [] }) => {
                // Access raw data from several store modules
                const position =
                    rootGetters[`positionAlive/byId`](positionId) ||
                    rootGetters[`positionTrash/byId`](positionId);
                const component =
                    rootGetters[`componentAlive/byId`](componentId) ||
                    rootGetters[`componentTrash/byId`](componentId);
                const object = rootGetters[`object/byId`](position?.objectId);

                // Information about the position itself
                const VW = {
                    componentName: component?.data.name,
                    worldId: position?.worldId,
                    boardId: position?.boardId,
                    backgroundColor:
                        component?.data.styleOverloadable &&
                        object?.protect?.styleBackgroundColor
                            ? object?.protect?.styleBackgroundColor
                            : component?.data.styleBackgroundColor,
                    outlineColor:
                        component?.data.styleOverloadable &&
                        object?.protect?.styleOutlineColor
                            ? object?.protect?.styleOutlineColor
                            : component?.data.styleOutlineColor,
                    color:
                        component?.data.styleOverloadable &&
                        object?.protect?.styleColor
                            ? object?.protect?.styleColor
                            : component?.data.styleColor,
                    isBackground: position?.protect?.isBackground,
                    createdAt: object?.private?.createdAt,
                    createdBy: object?.private?.createdBy,
                    updatedAt: object?.private?.updatedAt,
                    createdByMe: null, // Is set and used by real front only, not for the muppet, not for the CALC
                };

                // Over, under & linked objects
                const over = filter && filter.includes("over");
                const under = filter && filter.includes("under");
                const linked = filter && filter.includes("linked");
                const vwFilter = flatten(
                    rootGetters[`componentAlive/computedById`](componentId)
                        .filter(
                            (computed) =>
                                stack.length == 1 ||
                                filter.includes(computed.model)
                        )
                        .map((computed) => computed.jsonata.var)
                );
                if (over || under) {
                    try {
                        const overOrUnderPosition =
                            rootGetters[`positionAlive/byMatchPositionId`](
                                positionId
                            );
                        const overUnder = (positions, isOver) =>
                            positions
                                .filter(
                                    (position) => position.isHigher == isOver
                                )
                                .map((position) => ({
                                    positionId: position.positionId,
                                    ...getters.full(position, {
                                        filter: vwFilter,
                                        stack: [
                                            ...stack,
                                            {
                                                positionId,
                                                isOver,
                                                isUnder: !isOver,
                                            },
                                        ],
                                    }).data, // /!\ Recursive call!!!
                                }));
                        if (over) {
                            VW.over = overUnder(overOrUnderPosition, true);
                        }
                        if (under) {
                            VW.under = overUnder(overOrUnderPosition, false);
                        }
                    } catch {
                        /* not catched */
                    }
                }
                if (linked) {
                    try {
                        VW.linked = rootGetters["linkAlive/asArray"].reduce(
                            (acc, link) => {
                                // TODO: could probably be simplier written

                                if (
                                    link.objects.some(
                                        (object) =>
                                            object.objectId ===
                                            position.objectId
                                    )
                                ) {
                                    acc.push(
                                        ...link.objects
                                            .filter(
                                                (object) =>
                                                    object.objectId !=
                                                    position.objectId
                                            )
                                            .map((object) => {
                                                // Vérification de sécurité pour object.positions
                                                if (
                                                    !object.positions ||
                                                    object.positions.length ===
                                                        0
                                                ) {
                                                    return null;
                                                }

                                                const [position] =
                                                    object.positions;
                                                if (!position) {
                                                    return null;
                                                }

                                                // Récupérer les données de l'objet directement du store
                                                const objectInStore =
                                                    rootGetters[`object/byId`](
                                                        object.objectId
                                                    );

                                                return {
                                                    objectId: object.objectId,
                                                    componentId:
                                                        position.componentId,
                                                    linkModelId:
                                                        link.linkModelId,
                                                    componentName: rootGetters[
                                                        `componentAlive/nameById`
                                                    ](position.componentId),
                                                    linkModelName: rootGetters[
                                                        `linkModelAlive/nameById`
                                                    ](link.linkModelId),
                                                    linkType: object.data?.type,
                                                    linkTitle: link.data?.title,
                                                    linkArrowhead:
                                                        object.data?.arrowhead,
                                                    linkPosition:
                                                        object.positions.map(
                                                            (position) => ({
                                                                boardId:
                                                                    position.boardId,
                                                            })
                                                        ),
                                                    ...(objectInStore?.data ||
                                                        {}), // Utiliser directement les données du store
                                                };
                                            })
                                            .filter((item) => item !== null) // Enlever les valeurs null
                                    );
                                }
                                return acc;
                            },
                            []
                        );
                    } catch (error) {
                        /* Error in VW.linked construction - continue without linked data */
                    }
                }

                const { jira_issuetype, jira_project, jira_error } =
                    object?.data || {};

                if (jira_issuetype || jira_project || jira_error) {
                    try {
                        const boardJira = rootGetters[`boardAlive/byId`](
                            position.boardId
                        ).data.jira;
                        const jiraProjet =
                            boardJira &&
                            boardJira.projects.find(
                                (item) => item.id == jira_project
                            );
                        const fields =
                            jiraProjet?.issuetype.find(
                                (item) => item.id == jira_issuetype
                            )?.fields || {};

                        VW.jiraProject = {
                            priority: !!fields.priority,
                            epicName: !!Object.values(fields).find(
                                (item) => item.name == "Epic Name"
                            )?.required,
                            storyPoint:
                                !!fields[jiraProjet?.customFieldKey.storyPoint],
                            error: jira_error,
                        };
                    } catch {
                        /* not catched  */
                    }
                }

                return VW;
            };
        },

        CALC(state, getters, rootState, rootGetters) {
            return (
                { positionId, componentId, data },
                { filter, stack = [] }
            ) => {
                // Get computation functions for this component
                const computeds =
                    rootGetters[`componentAlive/computedById`](componentId);
                const filterComputed = computeds.filter(
                    (computed) =>
                        stack.length == 1 || filter.includes(computed.model)
                );

                // Check if data has changed since last computation, if no the cache is used
                if (
                    isEqual(data, state.cacheCalc[positionId]?.data) &&
                    isEqual(
                        filterComputed.map((computed) => computed.formula),
                        state.cacheCalc[positionId]?.formulas
                    )
                ) {
                    return state.cacheCalc[positionId].CALC;
                }

                // Core of computations
                const CALC = {};

                // Trouver d'abord le lien parent
                const parentLink = data.VW?.linked?.find(
                    (link) =>
                        link.linkModelId === "56575f706172656e74303030" &&
                        link.linkArrowhead === 1
                );

                // Si on a un lien parent, récupérer les données du parent
                if (parentLink) {
                    const parentObject = rootGetters[`object/byId`](
                        parentLink.objectId
                    );
                    if (parentObject?.data) {
                        CALC.parent = [
                            {
                                ...parentLink,
                                priority: parentObject.data.priority,
                                due_date: parentObject.data.due_date,
                            },
                        ];
                        CALC.parent_ok = true;
                        CALC.priority = parentObject.data.priority || "";
                        CALC.due_date = parentObject.data.due_date || "";
                    }
                }

                // Évaluer les autres formules
                for (let computed of filterComputed) {
                    if (
                        ![
                            "parent",
                            "parent_ok",
                            "priority",
                            "due_date",
                        ].includes(computed.model)
                    ) {
                        try {
                            CALC[computed.model] = computed.jsonata.evaluate({
                                ...data,
                                CALC,
                            });
                        } catch (e) {
                            /* not catched */
                        }
                        if (CALC[computed.model] === undefined) {
                            CALC[computed.model] = null;
                        }
                    }
                }

                // Save source data & computation results in cache
                if (stack.length == 1) {
                    state.cacheCalc[positionId] = {
                        formulas: filterComputed.map(
                            (computed) => computed.formula
                        ),
                        data: jsonDeepCopy(data),
                        CALC: jsonDeepCopy(CALC),
                    };
                }

                return CALC;
            };
        },
    },

    mutations: {
        set(state, payload) {
            if (!state.cacheFull) {
                state.cacheFull = {};
            }
            const position = this.getters[`positionAlive/byId`](payload._id);
            const mustSave = (current = {}, update = {}) => {
                for (let prop in update) {
                    if (!isEqual(update[prop], current[prop])) {
                        return true;
                    }
                }
                return false;
            };
            const mustSaveCALC = mustSave(
                position?.protect?.CALC,
                payload?.data?.CALC
            );
            const mustSaveVW = mustSave(
                position?.protect?.VW,
                payload?.data?.VW
            );
            if (mustSaveCALC || mustSaveVW) {
                const protect = {};
                if (mustSaveCALC) {
                    protect.CALC = payload?.data?.CALC;
                }
                if (mustSaveVW) {
                    protect.VW = payload?.data?.VW;
                }
                state.cacheFull[payload._id] = {
                    _id: payload?._id,
                    protect,
                };
            }

            // Directly call update in case of creation of a new object or color change in toolbar...
            if (position) {
                setTimeout(() => {
                    // TODO: avoid setTimeout
                    this.commit(`recursiveData/update`, {
                        worldId: position.worldId,
                        boardId: position.boardId,
                    });
                }, 100);
            }
        },
        reset(state) {
            Vue.set(state, "cacheFull", {});
            Vue.set(state, "cacheCalc", {});
        },
        update(state, scope) {
            const document = Object.values(state.cacheFull || {});
            state.cacheFull = {};
            if (document.length) {
                this.commit(`positionAlive/furtiveSet`, document);
                Socket.get({
                    worldId: scope.worldId,
                    boardId: scope.boardId,
                }).$emit("position-alive/update-front", {
                    // TODO: use another ressource
                    document,
                    reply: false,
                });
            }
        },
    },
};
