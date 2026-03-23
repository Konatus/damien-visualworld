const search = ({ database, collection, searchText }) => {
  return global.mgo
    .db(database)
    .collection(collection)
    .aggregate([
      {
        $unwind: {
          path: "$data",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          search: {
            $objectToArray: "$data",
          },
        },
      },
      {
        $match: {
          "search.v": new RegExp(searchText, "i"),
          "private.deletedAt": null,
        },
      },
    ])
    .toArray();
};

export default {
  alive: search,
};
