import Vue from "vue";

// The "granted" directive is used to adjust GUI on the user's grants
const insertedDirective = (el, binding, vnode, { granted, remove }) => {
    const socketName = binding.value;
    let context;
    if (!socketName) {
        // nothing to do because no parameter is provided
    }
    // Case arg is like [ 'position-alive/create-front', 'world-alive/create', { worldId: 'H3110W0r1D' } ]
    else if (
        typeof socketName[socketName.length - 1] === "object" &&
        !Array.isArray(socketName[socketName.length - 1])
    ) {
        context = socketName.pop();
    }
    // Case arg is like [ 'position-alive/create-front', 'view:update' ]
    else {
        /* Nothing to do */
    }

    // Check whether user is granted or not, remove node if necessary
    const getter =
        binding.arg === "for"
            ? "isGrantedFor"
            : binding.arg === "forAll"
            ? "isGrantedForAll"
            : binding.arg === "forOne"
            ? "isGrantedForOne"
            : binding.arg === "root"
            ? "isRoot"
            : binding.arg === "demo"
            ? "isDemoAdministrator"
            : "isNotGranted";
    const handler = () => {
        const isGranted = vnode.context.$store.getters[
            `connectionMe/${getter}`
        ](socketName, context);

        if (granted ? isGranted : !isGranted) {
            if (el.dataset.display) {
                el.style.display = el.dataset.display;
            }
        } else {
            if (remove) {
                el.remove();
            } else {
                if (!el.dataset.display) {
                    el.dataset.display = window
                        .getComputedStyle(el, null)
                        .getPropertyValue("display");
                }
                el.style.display = "none";
            }
        }
    };
    handler();

    // Reactivity
    el.__granted__unwatch = vnode.context.$store.watch(
        () => vnode.context.$store.state.connectionMe.user,
        handler
    );
};
const unbindDirective = (el) => {
    el.__granted__unwatch && el.__granted__unwatch();
};

Vue.directive("show-granted", {
    inserted(el, binding, vnode) {
        insertedDirective(el, binding, vnode, { granted: true, remove: false });
    },
    unbind: unbindDirective,
});
Vue.directive("show-not-granted", {
    inserted(el, binding, vnode) {
        insertedDirective(el, binding, vnode, {
            granted: false,
            remove: false,
        });
    },
    unbind: unbindDirective,
});
Vue.directive("if-granted", {
    inserted(el, binding, vnode) {
        insertedDirective(el, binding, vnode, { granted: true, remove: true });
    },
    unbind: unbindDirective,
});
Vue.directive("if-not-granted", {
    inserted(el, binding, vnode) {
        insertedDirective(el, binding, vnode, { granted: false, remove: true });
    },
    unbind: unbindDirective,
});
