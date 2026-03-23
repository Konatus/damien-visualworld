import { getters, mutations } from "./world-shared";
import Socket from "../../socket";
export default {
    namespaced: true,

    state: () => ({
        /* Trashed worlds will be added as properties of state */
    }),

    getters,
    mutations,

    actions: {
        restore(_, { data }) {
            Socket.get({}).$emit("world-trash/restore", {
                document: data,
            });
        },
    },
};
