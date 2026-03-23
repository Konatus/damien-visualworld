export default (component, callback) => {
    for (let k = 0; k < 99; k++) {
        if (!component.$parent) {
            break;
        } else if (component.$parent.$options.name == "VueJsModal") {
            callback(component.$parent, component);
            return;
        } else {
            component = component.$parent;
        }
    }
};
