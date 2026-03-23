import MongoId from "../utils/mongo-id.js";
import flat from "../utils/flatify-object.js";

const one = ({ database, collection, document, currentUserId, session }) => {
  const {
    _id,
    data,
    protect,
    worldId,
    boardId,
    componentId,
    objectId,
    linkId,
    linkModelId,
    userId,
  } = document;

  const set = flat({ data, protect, private: document.private });
  if (!data || !Object.values(data).length) {
    set.data = {};
  }
  const currentDate = new Date().toISOString();
  set["private.createdAt"] = currentDate;
  set["private.updatedAt"] = currentDate;

  if (worldId) set.worldId = worldId;
  if (boardId && collection !== "User") set.boardId = MongoId(boardId);
  if (componentId) set.componentId = MongoId(componentId);
  if (objectId) set.objectId = MongoId(objectId);
  if (linkId) set.linkId = MongoId(linkId);
  if (linkModelId) set.linkModelId = MongoId(linkModelId);
  if (userId) set.userId = MongoId(userId);
  if (currentUserId) set["private.createdBy"] = currentUserId;

  return global.mgo
    .db(database)
    .collection(collection)
    .updateOne(
      {
        _id: MongoId(_id),
        "private.deletedAt": null,
      },
      {
        $set: set,
      },
      {
        upsert: true,
        safe: false,
        session,
      }
    )
    .then(({ upsertedId }) => {
      return {
        _id: upsertedId ? upsertedId._id : _id,
      };
    });
};

const many = ({ database, collection, document, currentUserId, session }) => {
  const promises = document.map((x) =>
    one({ database, collection, document: x, currentUserId, session })
  );
  return Promise.all(promises);
};

export default {
  one,
  many,
};
