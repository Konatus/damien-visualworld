import MongoId from "../utils/mongo-id.js";

const one = ({ database, collection, document }) => {
  return many({ database, collection, document: [document] }).then(
    (result) => result[0]
  );
};

const many = ({ database, collection, document }) => {
  if (document.length < 1) {
    return [];
  }

  return global.mgo
    .db(database)
    .collection(collection)
    .updateMany(
      {
        $or: [
          ...document.map((x) => ({ _id: MongoId(x._id) })),
          ...document.map((x) => ({ worldId: MongoId(x.worldId) })),
        ],
      },
      {
        $unset: {
          "private.deletedAt": true,
          "private.deletedBy": true,
        },
      }
    );
};

export default {
  one,
  many,
};
