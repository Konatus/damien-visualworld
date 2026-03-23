import blackOrWhite from "./black-or-white.js";

import dayjs from "./dayjs.js";

// Transform any object to an array of { key: 'xxx', value: 'yyy' }
const keyValue = (object) => {
    const objectEntries = Object.entries(object);
    return objectEntries.map(([key, value]) => ({ key, value }));
};

// Access subproperty of object or array with a string path
// $path( my_object, 'data[0].toto' ) === my_object.data[0].toto
import lodashGet from "lodash.get";
const path = (arrayOrObject, path) => {
    if (Array.isArray(arrayOrObject)) {
        return arrayOrObject.map((item) => lodashGet(item, path));
    } else {
        return lodashGet(arrayOrObject, path);
    }
};

export default {
    blackOrWhite,
    dayjs,
    keyValue,
    path,
};
