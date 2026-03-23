import MongoId from "../utils/mongo-id.js";

const read = (
  { database, collection, document, session },
  { deleted, fullData }
) => {
  const selection = [];
  for (let item of document) {
    if (item) {
      if (item.worldId) {
        selection.push({ worldId: item.worldId });
      } else if (item._id) {
        selection.push({ _id: MongoId(item._id) });
      } else if (item.filename) {
        selection.push({ filename: item.filename });
      } else if (item.email) {
        selection.push({ "data.email": item.email });
      } else if (item.userId) {
        selection.push({ userId: MongoId(item.userId) });
      } else if (item.jiraIssueBoardId) {
        selection.push({ "data.jiraIssueBoardId": item.jiraIssueBoardId });
      }
      if (item.objectId) {
        selection.push({ objectId: MongoId(item.objectId) });
      }
    }
  }

  if (selection.length < 1) {
    return [];
  }
  return global.mgo
    .db(database)
    .collection(collection)
    .find(
      {
        $or: selection,
      },
      { session }
    )
    .toArray()
    .then((items) =>
      items.map((item) => {
        // TODO: is that project really useful?

        if (fullData) {
          return item;
        }

        const project = {};
        if (item._id) {
          project._id = item._id;
        }
        if (item.worldId) {
          project.worldId = item.worldId;
        }
        if (item.userId) {
          project.userId = item.userId;
        }
        if (
          (deleted && item.private && item.private.deletedAt) ||
          (!deleted && (!item.private || !item.private.deletedAt))
        ) {
          if (item.boardId) {
            project.boardId = item.boardId;
          }
          if (item.componentId) {
            project.componentId = item.componentId;
          }
          if (item.linkModelId) {
            project.linkModelId = item.linkModelId;
          }
          if (item.objectId) {
            project.objectId = item.objectId;
          }
          project.data = item.data;
          project.filename = item.filename;
          project.buffer = item.buffer;
          // project.state = item.state ?
          project.protect = item.protect;
          project.private = item.private;
        }
        return project;
      })
    );
};

export default {
  alive: (request) => {
    return read(request, { deleted: false, fullData: false });
  },
  trash: (request) => {
    return read(request, { deleted: true, fullData: false });
  },
  aliveFull: (request) => {
    return read(request, { deleted: false, fullData: true });
  },
};
