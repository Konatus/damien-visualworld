import Vue from "vue";
import App from "./App.vue";
import router from "./router";

// Create Vuex
import Vuex from "vuex";
import store from "./store";
Vue.use(Vuex);
let i18n;

// Directives
import "./directives/grant.js";
import "./directives/sanitize-html.js";

// Internationalization
import VueI18n from "vue-i18n";
Vue.use(VueI18n);
import messages from "./conf/label";
import dateTimeFormats from "./conf/date-time-formats";

// ElementUI
import ElementUI from "element-ui";
import lang from "element-ui/lib/locale/lang/fr";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(ElementUI);

ElementUI.Input.methods.resizeTextarea = () => {};

// CSS
import "./assets/app.css"; // main css
import "./assets/theme/index.css"; // Customize theme for ElementUI
import socket from "./store/socket";

// Google font icons
import "material-icons/iconfont/material-icons.css";

// Vue globale functions
// better call $max than Math.max in html templates
Vue.mixin({
    methods: {
        $max: Math.max,
        $min: Math.min,
    },
});

// Error handling
Vue.config.errorHandler = (err, vm, info) => {
    const payload = `${info} - ${
        err ? JSON.stringify(err, Object.getOwnPropertyNames(err)) : ""
    }`;
    socket.get({}).emit("vue-error", payload);
    store.dispatch(`root/log`, payload);
    console.error(info, err);
};

// Dynamic component
import dynamicComponent from "./utils/component.js";
Vue.use(dynamicComponent);

const setLocale = (userLocale) => {
    userLocale =
        userLocale ||
        (navigator.languages && navigator.languages.length
            ? navigator.languages[0]
            : navigator.language
        ).split("-")[0];

    i18n = new VueI18n({
        locale: userLocale,
        fallbackLocale: "fr",
        messages, // set locale messages
        dateTimeFormats,
    });
};
// Render
let alreadyRendered = false;
socket.get({}).on("connection-me", (me) => {
    const { locale } = me.document[0].data.identity;
    setLocale(locale);
    if (me.redirect) {
        window.location.replace(me.redirect);
    }

    store.commit("connectionMe/set", me);
    socket.reset({});

    // Render
    if (!alreadyRendered) {
        alreadyRendered = true;
        new Vue({
            router,
            store,
            i18n,
            render: (h) => h(App),
        }).$mount("#app");
    }
});
