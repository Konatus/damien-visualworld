// Local data
import alert from "./modules/alert/alert";
import app from "./modules/app/app";
import field from "./modules/field/field";
import overlay from "./modules/overlay/overlay";
import panzoom from "./modules/panzoom/panzoom";
import recursiveData from "./modules/recursive-data";
import root from "./modules/root/root";

// Persisted data (through sockets)
import boardAlive from "./modules/board/board-alive";
import boardTrash from "./modules/board/board-trash";
import boardComponent from "./modules/board-component/board-component";
import boardIoGet from "./modules/board-io/board-io-get";
import boardIoSet from "./modules/board-io/board-io-set";
import boardShortcut from "./modules/board-shortcut/board-shortcut";
import object from "./modules/object/object";
import objectSearch from "./modules/object/object-search";
import componentAlive from "./modules/component/component-alive";
import componentTrash from "./modules/component/component-trash";
import connectionMe from "./modules/connection-me/connection-me";
import connectionAll from "./modules/connection-all/connection-all";
import grant from "./modules/grant/grant";
import linkAlive from "./modules/link/link-alive";
import linkModelAlive from "./modules/link-model/link-model-alive";
import linkModelTrash from "./modules/link-model/link-model-trash";
import latestLinkModel from "./modules/latest-link-model/latest-link-model";
import positionAlive from "./modules/position/position-alive";
import positionTrash from "./modules/position/position-trash";
import templateIoGet from "./modules/template-io/template-io-get";
import templateIoSet from "./modules/template-io/template-io-set";
import userAlive from "./modules/user/user-alive";
import userTrash from "./modules/user/user-trash";
import worldAlive from "./modules/world/world-alive";
import worldTrash from "./modules/world/world-trash";
import worldUse from "./modules/world-use/world-use";
import jiraUse from "./modules/jira-use/jira-use";
import undoRedo from "./modules/undo-redo/undo-redo";

const modules = {
    alert,
    app,
    field,
    overlay,
    panzoom,
    recursiveData,
    root,

    boardAlive,
    boardTrash,
    boardComponent,
    boardIoGet,
    boardIoSet,
    boardShortcut,
    object,
    objectSearch,
    componentAlive,
    componentTrash,
    connectionMe,
    connectionAll,
    grant,
    linkAlive,
    linkModelAlive,
    linkModelTrash,
    latestLinkModel,
    positionAlive,
    positionTrash,
    templateIoGet,
    templateIoSet,
    userAlive,
    userTrash,
    worldAlive,
    worldTrash,
    worldUse,
    jiraUse,
    undoRedo,
};

// Data reception through socket
import Socket from "./socket";
const socketOn = (store, scope, moduleName) => {
    return (payload) => {
        const toBeSet = payload.document.filter((x) => x.data || x.protect);
        if (Array.isArray(toBeSet)) {
            if (scope.worldId) {
                toBeSet.forEach((x) => (x.worldId = scope.worldId));
            }
            if (scope.boardId) {
                toBeSet.forEach((x) => (x.boardId = scope.boardId));
            }
            toBeSet.forEach((x) => (x.me = payload.me));
            store.commit(`${moduleName}/set`, toBeSet);
        }
        const toBeUnset = payload.document.filter((x) => !x.data && !x.protect);
        if (toBeUnset.length) {
            toBeUnset.forEach((x) => (x.me = payload.me));
            store.commit(`${moduleName}/unset`, toBeUnset);
        }
    };
};
const mutations = {
    onRoute(state, route) {
        this.dispatch(
            `root/log`,
            `store navigate route.from=${route.from.fullPath} route.to=${route.to.fullPath}`
        );
        if (state) {
            // World level: reset if world changed
            if (route.from.params.worldId !== route.to.params.worldId) {
                Socket.reset({ worldId: true });
                this.commit("boardAlive/reset");
                this.commit("boardTrash/reset");
                this.commit("boardShortcut/reset");
                this.commit("componentAlive/reset");
                this.commit("componentTrash/reset");
                this.commit("grant/world/reset");
                this.commit("linkModelAlive/reset");
                this.commit("linkModelTrash/reset");
                this.commit("templateIoGet/reset");
                this.commit("templateIoSet/reset");
                this.commit("userAlive/reset");
                this.commit("userTrash/reset");
                this.commit("worldUse/reset");

                if (route.to.params.worldId) {
                    const scope = { worldId: route.to.params.worldId };
                    const worldSocket = Socket.get(scope);
                    worldSocket.on(
                        "board-alive",
                        socketOn(this, scope, "boardAlive")
                    );
                    worldSocket.on(
                        "board-trash",
                        socketOn(this, scope, "boardTrash")
                    );
                    worldSocket.on(
                        "board-shortcut",
                        socketOn(this, scope, "boardShortcut")
                    );
                    worldSocket.on(
                        "component-alive",
                        socketOn(this, scope, "componentAlive")
                    );
                    worldSocket.on(
                        "component-trash",
                        socketOn(this, scope, "componentTrash")
                    );
                    worldSocket.on(
                        "grant",
                        socketOn(this, scope, "grant/world")
                    );
                    worldSocket.on(
                        "link-model-alive",
                        socketOn(this, scope, "linkModelAlive")
                    );
                    worldSocket.on(
                        "link-model-trash",
                        socketOn(this, scope, "linkModelTrash")
                    );
                    worldSocket.on(
                        "template-io-get",
                        socketOn(this, scope, "templateIoGet")
                    );
                    worldSocket.on(
                        "template-io-set",
                        socketOn(this, scope, "templateIoSet")
                    );
                    worldSocket.on(
                        "user-alive",
                        socketOn(this, scope, "userAlive")
                    );
                    worldSocket.on(
                        "user-trash",
                        socketOn(this, scope, "userTrash")
                    );
                    worldSocket.on(
                        "world-use",
                        socketOn(this, scope, "worldUse")
                    );
                }
            }

            // Board level: reset if board changed
            if (route.from.params.boardId !== route.to.params.boardId) {
                if (route.from.params.boardId) {
                    Socket.reset({ worldId: true, boardId: true });
                    this.commit("boardComponent/reset");
                    this.commit("boardIoGet/reset");
                    this.commit("boardIoSet/reset");
                    this.commit("object/reset");
                    this.commit("objectSearch/reset");
                    this.commit("connectionAll/reset");
                    this.commit("grant/board/reset");
                    this.commit("linkAlive/reset");
                    this.commit("latestLinkModel/reset");
                    this.commit("positionAlive/reset");
                    this.commit("positionTrash/reset");
                    this.commit("panzoom/reset");
                    this.commit("positionTrash/reset");
                    this.commit("recursiveData/reset");
                    this.commit("jiraUse/project/reset");
                    this.commit("jiraUse/issue/reset");
                    this.commit("undoRedo/reset");
                }
                if (route.to.params.boardId) {
                    const scope = {
                        worldId: route.to.params.worldId,
                        boardId: route.to.params.boardId,
                    };
                    const boardSocket = Socket.get(scope);
                    boardSocket.on(
                        "board-component",
                        socketOn(this, scope, "boardComponent")
                    );
                    boardSocket.on(
                        "board-grant",
                        socketOn(this, scope, "grant/board")
                    );
                    boardSocket.on(
                        "board-io-get",
                        socketOn(this, scope, "boardIoGet")
                    );
                    boardSocket.on(
                        "board-io-set",
                        socketOn(this, scope, "boardIoSet")
                    );
                    boardSocket.on("object", socketOn(this, scope, "object"));
                    boardSocket.on(
                        "object-search",
                        socketOn(this, scope, "objectSearch")
                    );
                    boardSocket.on(
                        "connection-all",
                        socketOn(this, scope, "connectionAll")
                    );
                    boardSocket.on(
                        "link-alive",
                        socketOn(this, scope, "linkAlive")
                    );
                    boardSocket.on(
                        "position-alive",
                        socketOn(this, scope, "positionAlive")
                    );
                    boardSocket.on(
                        "position-trash",
                        socketOn(this, scope, "positionTrash")
                    );
                    boardSocket.on(
                        "user-alive",
                        socketOn(this, scope, "userAlive")
                    );
                    boardSocket.on(
                        "jira-project",
                        socketOn(this, scope, "jiraUse/project")
                    );
                    boardSocket.on(
                        "jira-issue",
                        socketOn(this, scope, "jiraUse/issue")
                    );
                }
            }

            // App level
            if (!route.from.name) {
                const scope = {};
                const appSocket = Socket.get(scope);
                appSocket.on(
                    "world-alive",
                    socketOn(this, scope, "worldAlive")
                );
                appSocket.on(
                    "world-trash",
                    socketOn(this, scope, "worldTrash")
                );
            }
        }
    },

    // World added after routing (worlds-of-universe: display boards of several worlds)
    listenToAWorld(state, scope) {
        this.dispatch(`root/log`, `store world scope=${JSON.stringify(scope)}`);

        Socket.reset({ worldId: true });
        this.commit("boardAlive/reset");
        this.commit("boardTrash/reset");
        this.commit("componentAlive/reset");
        this.commit("componentTrash/reset");
        this.commit("grant/world/reset");
        this.commit("linkModelAlive/reset");
        this.commit("linkModelTrash/reset");
        this.commit("userAlive/reset");
        this.commit("userTrash/reset");
        this.commit("worldUse/reset");

        const worldSocket = Socket.get(scope);
        worldSocket.on("board-alive", socketOn(this, scope, "boardAlive"));
        worldSocket.on("board-trash", socketOn(this, scope, "boardTrash"));
        worldSocket.on(
            "component-alive",
            socketOn(this, scope, "componentAlive")
        );
        worldSocket.on(
            "component-trash",
            socketOn(this, scope, "componentTrash")
        );
        worldSocket.on("grant", socketOn(this, scope, "grant/world"));
        worldSocket.on(
            "link-model-alive",
            socketOn(this, scope, "linkModelAlive")
        );
        worldSocket.on(
            "link-model-trash",
            socketOn(this, scope, "linkModelTrash")
        );
        worldSocket.on("user-alive", socketOn(this, scope, "userAlive"));
        worldSocket.on("user-trash", socketOn(this, scope, "userTrash"));
        worldSocket.on("world-use", socketOn(this, scope, "worldUse"));
    },

    listenToAWorldBoards(state, scope) {
        this.dispatch(
            `root/log`,
            `store world-boards scope=${JSON.stringify(scope)}`
        );
        const worldSocket = Socket.get(scope);
        worldSocket.on("board-alive", socketOn(this, scope, "boardAlive"));
    },

    // Board added after routing (worlds-of-universe: edit board)
    listenToABoard(state, scope) {
        this.dispatch(`root/log`, `store board scope=${JSON.stringify(scope)}`);
        Socket.reset({ worldId: true, boardId: true });
        const boardSocket = Socket.get(scope);
        this.commit("grant/board/reset");
        boardSocket.on("board-grant", socketOn(this, scope, "grant/board"));
    },
};

import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
export default new Vuex.Store({
    mutations,
    modules,
});
