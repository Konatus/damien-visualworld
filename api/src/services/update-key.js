import MongoId from "../utils/mongo-id.js";

const updateKey = ({
  database,
  collection,
  selection,
  set,
  currentUserId,
  session,
}) => {
  let $set = {};
  let $unset = {};
  for (let key in selection) {
    selection[key] = MongoId(selection[key]);
  }
  for (let key in set) {
    // Todo: use unset to remove componentId when model is generic
    if (key === "componentId" && set[key] === "") {
      $set = {};
      $unset = { $unset: { componentId: "" } };
    } else {
      set[key] = MongoId(set[key]);
      $set = { $set: set };
    }
    set["private.updatedBy"] = currentUserId;
    set["private.updatedAt"] = new Date().toISOString();
  }

  return global.mgo
    .db(database)
    .collection(collection)
    .updateMany(
      Object.assign({ "private.deletedAt": null }, selection),
      {
        ...$unset,
        ...$set,
      },
      {
        upsert: false,
        safe: false,
        session,
      }
    )
    .then(() => {
      return selection;
    });
};

export default updateKey;
