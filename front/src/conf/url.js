let baseUrl =
    global.location.hostname === "localhost"
        ? "http://localhost:8080" // ease development work on localhost (withtout oauth-proxy)
        : "http://213.165.95.153:8080"; // Using explicit IP address for development
export default {
    // SocketIO
    socket: `${baseUrl}`,

    // REST endpoint for pictures download (GET) & upload (POST)
    img: ({ url, worldId, key }) => {
        if (url) {
            return url; // base-64 encoded data
        } else {
            return `${baseUrl}/api/img/${key}?worldId=${worldId}`;
        }
    },

    // REST endpoint for guest access creation (POST)
    guest: ({ email, token, worldId, boardId }) => {
        const baseGuestUrl = `${baseUrl}/api/guest`;
        if (email && token) {
            return `${baseGuestUrl}/${encodeURIComponent(
                email
            )}/${encodeURIComponent(token)}`; // Guest login (GET)
        } else {
            return `${baseGuestUrl}?worldId=${worldId}&boardId=${boardId}`; // Guest access creation (POST)
        }
    },
    profile: () => {
        const baseGuestUrl = `${baseUrl}/api/profile`;
        return `${baseGuestUrl}`;
    },
};
