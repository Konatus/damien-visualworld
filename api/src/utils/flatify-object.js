const flatifyObject = (obj, parent, res = {}) => {
  for (let key in obj) {
    let propName = parent ? `${parent}.${key}` : key;
    if (obj[key] && typeof obj[key] == "object" && !Array.isArray(obj[key])) {
      flatifyObject(obj[key], propName, res);
    } else {
      if (obj[key] !== undefined) res[propName] = obj[key];
    }
  }
  return res;
};

export default flatifyObject;
