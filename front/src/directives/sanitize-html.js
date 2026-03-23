import Vue from "vue";
import { compile } from "../utils/vue-template"; // nota bene: compiler includes white-list of tag names & attributes

const createNode = ($el, binding, vnode) => {
    const key = Object.keys($el.dataset)[0];
    const previous = vnode.context?.[key];
    const html = binding.value;
    if (previous?.html == html) {
        return;
    }

    const compiled = compile(html);
    const instance = new Vue({
        render: compiled.render,
        staticRenderFns: compiled.staticRenderFns,
    });
    instance.$mount(previous?.$el || $el);

    vnode.context[key] = {
        html,
        $el: instance.$el,
    };
};

Vue.directive("sanitize-html", {
    inserted: createNode,
    update: createNode,
});
