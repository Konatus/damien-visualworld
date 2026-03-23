import MongoId from "../utils/mongo-id.js";

const one = ({ database, collection, document, session }, filter = {}) => {
  return many(
    { database, collection, document: [document], session },
    filter
  ).then((result) => result[0]);
};

const many = ({ database, collection, document, session }, filter = {}) => {
  if (!document.length) {
    return [];
  }

  const selection = [];
  for (let item of document) {
    selection.push(
      Object.assign(
        item.worldId ? { worldId: item.worldId } : {},
        item._id ? { _id: MongoId(item._id) } : {},
        item.objectId ? { _id: MongoId(item.objectId) } : {}
      )
    );
  }

  return global.mgo
    .db(database)
    .collection(collection)
    .deleteMany(Object.assign(filter, { $or: selection }), { session })
    .then(() => {
      return selection;
    });
};

export default {
  one,
  many,
};
