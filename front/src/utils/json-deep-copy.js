// https://gist.github.com/mix3d/381e7797360bf5b4cc062885d864aa4f
const jsonDeepCopy = (o) => {
    let newO, i;

    if (typeof o !== "object") {
        return o;
    }
    if (!o) {
        return o;
    }

    if ("[object Array]" === Object.prototype.toString.apply(o)) {
        newO = [];
        for (i = 0; i < o.length; i += 1) {
            newO[i] = jsonDeepCopy(o[i]);
        }
        return newO;
    }

    newO = {};
    for (i in o) {
        if (Object.prototype.hasOwnProperty.call(o, i)) {
            newO[i] = jsonDeepCopy(o[i]);
        }
    }
    return newO;
};
export default jsonDeepCopy;
