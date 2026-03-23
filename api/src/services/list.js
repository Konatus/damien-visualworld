import MongoId from "../utils/mongo-id.js";

const list = ({ database, collection, document, session }, filter) => {
  // Document selection may be an object or an array of objecs
  const selectionArray = [];
  const documentArray = (
    Array.isArray(document) ? document : [document]
  ).filter((x) => !!x);

  // Selection of document (equivalent of the SQL `where`... while filter is a kind of `having`)
  for (let item of documentArray) {
    const selectionItem = {};
    if (item.worldId) selectionItem.worldId = item.worldId;
    if (item.boardId) selectionItem.boardId = MongoId(item.boardId);
    if (item.objectId) selectionItem.objectId = MongoId(item.objectId);
    if (item.componentId) selectionItem.componentId = MongoId(item.componentId);
    if (item.linkId) selectionItem.linkId = MongoId(item.linkId);
    if (item.linkModelId) selectionItem.linkModelId = MongoId(item.linkModelId);
    if (Object.keys(selectionItem).length) {
      selectionArray.push(selectionItem);
    }
  }
  
  // If we are searching with an array of documents but the array is empty, return empty result
  // This prevents fetching ALL documents when we should fetch NONE
  if (Array.isArray(document) && document.length === 0) {
    return Promise.resolve([]);
  }

  // Select document with non-null data property
  // apply document selection & filter, if provided
  let selection = {
    data: { $ne: null },
  };
  if (filter) {
    selection = Object.assign(selection, filter);
  }
  if (selectionArray.length) {
    selection = Object.assign(selection, { $or: selectionArray });
  }

  // Find & project
  return Promise.race([
    new Promise((resolve, reject) => {
      setTimeout(
        reject,
        10000,
        new Error(JSON.stringify({ err: "timeout", database, collection }))
      );
    }),
    global.mgo
      .db(database)
      .collection(collection)
      .find(selection, {
        _id: 1,
        worldId: 1,
        boardId: 1,
        objectId: 1,
        componentId: 1,
        linkId: 1,
        data: 1,
        protect: 1,
        private: 1,
        state: 1,
        session,
      })
      .maxTimeMS(9000)
      .toArray(),
  ]);
};

export default {
  alive: (request) => {
    return list(request, { "private.deletedAt": null });
  },
  trash: (request) => {
    return list(request, { "private.deletedAt": { $ne: null } });
  },
};
