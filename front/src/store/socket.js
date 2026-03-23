import io from "socket.io-client";
import Url from "../conf/url";

// Different scope levels
const APP = "app";
const WORLD = "world";
const BOARD = "board";

// Object where sockets are saved, grouped by scope level
const socket = {
    [APP]: {},
    [WORLD]: {},
    [BOARD]: {},
};

// Path where the socket of a given scope is saved inside the "socket" object
function getPath({ worldId, boardId }) {
    if (!worldId && !boardId) return { name: APP, key: APP };
    if (worldId && !boardId) return { name: WORLD, key: worldId };
    if (worldId && boardId) return { name: BOARD, key: boardId };
}

// Create a socket connection for a scope
function create(scope) {
    // White-listed props in scope
    const sanitizedScope = {};
    for (let prop of ["worldId", "boardId"]) {
        if (scope[prop]) sanitizedScope[prop] = scope[prop];
    }

    // Create the socket, even if it isnt already connected
    const createdSocket = io(Url.socket, {
        path: "/socket.io",
        query: scope,
        reconnection: true,
        transports: ["websocket"],
    });

    // Cache emitted messages until the socket is connected
    createdSocket.$emitCache = [];
    createdSocket.on("$connect", function () {
        for (let { eventName, data } of this.$emitCache) {
            this.emit(eventName, data);
        }
        this.$emitCache = [];
    });

    // Custom emit function accepts message before the socket is initialized
    createdSocket.$emit = function (eventName, data) {
        if (this.connected === true) {
            this.emit(eventName, data); // Immediately sent message
        } else {
            this.$emitCache.push({ eventName, data }); // Wait the socket is ready
        }
    };

    return createdSocket;
}

// Does any socket exist for a given scope?
function exist(scope) {
    const path = getPath(scope);
    return !!socket[path.name][path.key];
}

// Retrieve socket for a given scope
// nb: the socket is created if it doesnt exist yet
function getOrCreate(scope) {
    const { name, key } = getPath(scope);
    if (!["opening", "open"].includes(socket[name]?.[key]?.io?._readyState)) {
        if (socket[name]?.[key]) {
            // avoid any late attemp of reconnect that would lead to socket duplicate for a same path
            socket[name][key].disconnect();
        }
        socket[name][key] = create(scope);
    }
    return socket[name][key];
}

// Remove all existing socket for a scope level
function resetScope(scope) {
    const path = getPath(scope);
    for (let key in socket[path.name]) {
        if (key != path.key) {
            socket[path.name][key].disconnect();
            delete socket[path.name][key];
        }
    }
}

export default {
    exist,
    get: getOrCreate,
    reset: resetScope,
};
