import Vue from "vue";
import app from "../../../conf/app";
import jsonDeepCopy from "../../../utils/json-deep-copy";
import merge from "lodash.merge";
import omit from "lodash.omit";
export default {
    namespaced: true,

    state: () => ({}),

    getters: {
        model(state) {
            if (state.model && state.model.data) {
                return state.model;
            } else {
                return {
                    linkModelId: state.model && state.model.linkModelId,
                    data: jsonDeepCopy(app.defaultLink),
                    anchors: jsonDeepCopy(app.defaultLinkObject).map(
                        (defaultLinkdata) => {
                            return { data: defaultLinkdata };
                        }
                    ),
                };
            }
        },
    },

    mutations: {
        set(state, items) {
            Vue.set(state, "model", items);
        },
        reset(state) {
            Vue.delete(state, "model");
        },
    },

    actions: {
        update(
            { getters, commit, rootGetters },
            { worldId, boardId, document }
        ) {
            const [defaultModel] = document
                .map((item) => {
                    const link = rootGetters["linkAlive/byId"](item._id);

                    return {
                        data: omit(link.data, "title"),
                        objects: link.objects.map((item) => ({
                            data: item.data,
                        })),
                        linkModelId: link.linkModelId,
                    };
                })
                .filter((item) => {
                    return (
                        item.linkModelId == app.visualWorldComponent.VW_default
                    );
                });

            const [latestLinkModel] = document.map((item) => {
                return {
                    data: defaultModel
                        ? merge(defaultModel.data, item.data)
                        : item.data,
                    linkModelId:
                        item.linkModelId || app.visualWorldComponent.VW_default,
                    anchors: item.objects.length
                        ? item.objects.map((x, i) => {
                              return {
                                  data: defaultModel
                                      ? merge(
                                            defaultModel.objects[i].data,
                                            x.data
                                        )
                                      : x.data,
                              };
                          })
                        : defaultModel
                        ? defaultModel.objects.map((item) => ({
                              data: item.data,
                          }))
                        : [],
                };
            });

            let linkModelDataExist = window.localStorage[worldId];

            if (!linkModelDataExist) {
                window.localStorage.setItem(
                    worldId,
                    JSON.stringify({ boardId: {} })
                );
            }

            const linkModelData = JSON.parse(window.localStorage[worldId]);

            linkModelData[boardId] = merge(
                linkModelData[boardId] || jsonDeepCopy(getters.model),
                latestLinkModel
            );
            window.localStorage.setItem(worldId, JSON.stringify(linkModelData));

            commit("set", linkModelData[boardId]);
        },
    },
};
