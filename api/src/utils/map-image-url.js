export default (object) => {
  // TODO: why?
  for (let property in object.data) {
    if (Array.isArray(object.data[property])) {
      for (let num in object.data[property]) {
        if (
          object.data[property][num] &&
          object.data[property][num].percent === 100
        ) {
          delete object.data[property][num].url;
        }
      }
    }
  }

  return object;
};
