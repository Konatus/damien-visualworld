import MongoId from "../utils/mongo-id.js";
import flat from "../utils/flatify-object.js";

const one = (
  { database, collection, document, currentUserId, session },
  filter = {}
) => {
  const {
    _id,
    data,
    protect,
    ultraPrivate,
    state,
    worldId,
    boardId,
    componentId,
    objectId,
    linkId,
    linkModelId,
  } = document;
  if (!_id && !worldId) {
    return;
  }

  const selection = Object.assign(
    worldId ? { worldId: worldId } : {},
    _id ? { _id: MongoId(_id) } : {}
  );

  const set = flat({
    data,
    protect,
    private: document.private,
    ultraPrivate,
    state,
  });
  if (worldId) set.worldId = worldId;
  if (boardId) set.boardId = MongoId(boardId);
  if (componentId) set.componentId = MongoId(componentId);
  if (objectId) set.objectId = MongoId(objectId);
  if (linkId) set.linkId = MongoId(linkId);
  if (linkModelId) set.linkModelId = MongoId(linkModelId);
  if (currentUserId) set["private.updatedBy"] = currentUserId;
  set["private.updatedAt"] = new Date().toISOString();

  // Set data update
  let $set = { $set: set };
  let $unset = {};

  // Todo: use unset to remove linkmodelId when default link model
  if (linkModelId === "") $unset = { $unset: { linkModelId } };
  if (data && data.jira === null) {
    $set = {};
    $unset = {
      $unset: {
        "ultraPrivate.jiraApiToken": "",
        "data.jira": "",
      },
    };
  }
  if (data && data.jira && data.jira.webhookMessage === null) {
    $set = {};
    $unset = {
      $unset: {
        "data.jira.webhookMessage": "",
      },
    };
  }

  // Todo: use unset to remove componentId when model isgeneric
  if (componentId === "") {
    $set = {};
    $unset = { $unset: { componentId } };
  }

  return global.mgo
    .db(database)
    .collection(collection)

    .updateOne(
      Object.assign({ "private.deletedAt": null }, filter, selection),
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

const many = (
  { database, collection, document, currentUserId, session },
  filter = {}
) => {
  const promises = document.map((x) =>
    one({ database, collection, document: x, currentUserId, session }, filter)
  );
  return Promise.all(promises);
};

export default {
  one,
  many,
};
