import MongoId from "../utils/mongo-id.js";
import flat from "../utils/flatify-object.js";

const one = ({ database, collection, document, currentUserId, session }) => {
  const {
    _id,
    data,
    protect,
    ultraPrivate,
    state,
    filename,
    buffer,
    worldId,
    boardId,
    componentId,
    objectId,
    linkId,
    linkModelId,
  } = document;
  const upsertDate = new Date().toISOString();

  const set = flat({
    data,
    protect,
    private: document.private,
    ultraPrivate,
    state,
  });
  if (!data || !Object.values(data).length) {
    set.data = {};
  }

  if (buffer) set.buffer = buffer;
  if (filename) set.filename = filename;
  if (worldId) set.worldId = worldId;
  if (boardId) set.boardId = MongoId(boardId);
  if (componentId) set.componentId = MongoId(componentId);
  if (objectId) set.objectId = MongoId(objectId);
  if (linkId) set.linkId = MongoId(linkId);
  if (linkModelId) set.linkModelId = MongoId(linkModelId);
  if (currentUserId) set["private.updatedBy"] = currentUserId;
  set["private.updatedAt"] = upsertDate;

  return global.mgo
    .db(database)
    .collection(collection)
    .updateOne(
      {
        _id: MongoId(_id),
        "private.deletedAt": null,
      },
      {
        ...(Object.keys(set).length ? { $set: set } : null),
        $setOnInsert: {
          "private.createdAt": upsertDate,
          "private.createdBy": currentUserId,
        },
      },
      {
        upsert: true,
        safe: false,
        session,
      }
    )
    .then(() => {
      return { _id };
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
