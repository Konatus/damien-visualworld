import MongoDB from "mongodb";

export default (string) => {
  // No id is provided
  if (!string) {
    return new MongoDB.ObjectID();
  }

  // Provided id is a hex string of 24 char
  if (MongoDB.ObjectID.isValid(string)) {
    return new MongoDB.ObjectID(string);
  }

  // Common string
  return string;
};
