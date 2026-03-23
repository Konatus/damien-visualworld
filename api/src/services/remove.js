import MongoId from "../utils/mongo-id.js";

const one = (
  { database, collection, document, currentUserId, session },
  filter = {}
) => {
  return many(
    { database, collection, document: [document], currentUserId, session },
    filter
  ).then((result) => result[0]);
};

const many = (
  { database, collection, document, currentUserId, session },
  filter = {}
) => {
  if (!document.length) {
    return [];
  }

  const selection = [];
  for (let item of document) {
    selection.push(
      Object.assign(
        item.worldId ? { worldId: item.worldId } : {},
        item._id ? { _id: MongoId(item._id) } : {}
      )
    );
  }
  const $set = {
    "private.deletedBy": currentUserId,
    "private.deletedAt": new Date().toISOString(),
  };

  return global.mgo
    .db(database)
    .collection(collection)
    .updateMany(
      Object.assign({ "private.deletedAt": null }, filter, { $or: selection }),
      {
        $set,
      },
      { session }
    )
    .then(() => {
      return selection;
    });
};

export default {
  one,
  many,
};
