import Vue from "vue";
import Router from "vue-router";

import store from "./store";
Vue.use(Router);

const worldAccess = (next) => {
    const user = store.state[`connectionMe`].user;
    const worlds = user.grant?.world || [];

    if (
        !Object.keys(worlds).length &&
        !store.getters[`connectionMe/isRoot`]()
    ) {
        next("/not-found/access");
    }
};

const router = new Router({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "worldsOfUniverse",
            component: require("./views/worlds-of-universe").default,
            beforeEnter: (to, from, next) => {
                worldAccess(next);
                next();
            },
        },
        {
            path: "/world/:worldId/board/:boardId",
            name: "objectsInBoard",
            component: require("./views/objects-in-board").default,
            beforeEnter: (to, from, next) => {
                worldAccess(next);
                // Check if the world exists
                if (
                    store.getters["connectionMe/worldById"](
                        to.params.worldId
                    ) === undefined
                ) {
                    next("/not-found/world");
                } else {
                    next(
                        store.getters[`connectionMe/isRoot`]() ||
                            store.getters[`connectionMe/hasOneProfile`](
                                [
                                    "modeler",
                                    "administrator",
                                    "demoAdministrator",
                                    "owner",
                                ],
                                { ...to.params }
                            ) ||
                            store.getters[`connectionMe/hasOneProfile`](
                                ["observer", "participant", "animator"],
                                { ...to.params }
                            ) ||
                            "/not-found/grant"
                    );
                }
            },
            props: true,
        },
        {
            path: "/not-found/:value?",
            name: "notFound",
            alias: "/*",
            component: require("./views/not-found").default,
        },
    ],
});

router.beforeEach((to, from, next) => {
    document.title = "Visual World";
    if (from.params.worldId) {
        store.commit(`app/worldsOfUniverse/worldId`, from.params.worldId);
    }
    store.commit("onRoute", { to, from });
    next();
});

export default router;
