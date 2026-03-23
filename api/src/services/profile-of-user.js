export default ({ database, email }) => {
  return global.mgo
    .db(database)
    .collection("User")
    .aggregate([
      {
        $match: {
          "data.email": email,
          "private.deletedAt": null,
          $or: [
            // TODO: uncomment
            { "data.guestUntil": null },
            { "data.guestUntil": { $gte: new Date().toISOString() } },
          ],
        },
      },
      {
        $lookup: {
          from: "Grant",
          localField: "_id",
          foreignField: "userId",
          as: "world",
        },
      },
      {
        $lookup: {
          from: "BoardGrant",
          localField: "_id",
          foreignField: "userId",
          as: "board",
        },
      },
      {
        $unwind: {
          path: "$world",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          userId: "$_id",
          data: 1,
          world: 1,
          board: 1,
        },
      },
    ])
    .toArray()
    .then((array) => array[0]); // user cant be set twice
};
