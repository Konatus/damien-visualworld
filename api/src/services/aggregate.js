import MongoId from "../utils/mongo-id.js";

const one = ({ database, collection, selector, path }) => {
  const { boardId, cursor } = selector;

  return global.mgo
    .db(database)
    .collection(collection)
    .aggregate([
      {
        $match: {
          boardId: MongoId(boardId),
        },
      },
      {
        $group: {
          _id: null,
          aggregate: {
            [cursor]: `$${path}`,
          },
        },
      },
    ])
    .toArray()
    .then((item) => (item && item[0] ? item[0].aggregate : null));
};

const many = ({ database, collection, document, path }) => {
  const promises = document.map((x) =>
    one({ database, collection, selector: x, path })
  );
  return Promise.all(promises);
};

export default {
  one,
  many,
};
