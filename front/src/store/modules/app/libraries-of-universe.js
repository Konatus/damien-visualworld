const COMPONENT = "component";
const LINK = "link";
const TEMPLATE = "template";

export default {
    namespaced: true,

    state: () => ({
        activeTab: null,
        createObjectByClick: false,
    }),

    getters: {
        activeTab(state) {
            return state.activeTab;
        },
        activeTabIsComponent(state) {
            return state.activeTab === COMPONENT;
        },
        activeTabOptions() {
            return {
                component: COMPONENT,
                link: LINK,
                template: TEMPLATE,
            };
        },
        createObjectByClick(state) {
            return state.createObjectByClick;
        },
    },

    mutations: {
        activeTab(state, value) {
            state.activeTab = value;
        },
        defaultActiveTab(state) {
            state.activeTab = COMPONENT;
        },
        noActiveTab(state) {
            state.activeTab = null;
        },
        createObjectByClick(state, value) {
            state.createObjectByClick = value;
        },
    },
};
