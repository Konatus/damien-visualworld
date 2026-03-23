import MongoId from "../utils/mongo-id.js";
import log from "../utils/log.js";

const COLLECTIONS = [
  "Board",
  "BoardComponent",
  "BoardGrant",
  "Component",
  "Grant",
  "Image",
  "Link",
  "LinkModel",
  "Object",
  "ObjectLink",
  "Position",
  "User",
];
const INDEXES = [
  {
    collection: "Position",
    fields: {
      boardId: 1,
    },
  },
  {
    collection: "Position",
    fields: {
      objectId: 1,
    },
  },
  {
    collection: "ObjectLink",
    fields: {
      linkId: 1,
    },
  },
  {
    collection: "Link",
    fields: {
      linkModelId: 1,
    },
  },
];

export default async (worldTemplateId) => {
  const session = global.mgo.startSession();
  const _id = MongoId();
  const id = _id.toString();
  try {
    const db = global.mgo.db(id);

    for (let collection of COLLECTIONS) {
      db.createCollection(collection);
      db.collection(collection).createIndex({ "private.deletedAt": 1 });
    }
    for (let { collection, fields } of INDEXES) {
      db.collection(collection).createIndex(fields);
    }

    if (worldTemplateId) {
      await session.withTransaction(async () => {
        const dbFrom = await global.mgo.db(worldTemplateId);
        const collections = await dbFrom.collections();

        for await (let collection of collections) {
          const collectionName = collection.collectionName;
          let documents = await dbFrom
            .collection(collectionName)
            .find()
            .toArray();
          if (documents.length) {
            await db
              .collection(collectionName)
              .insertMany(documents, { session });
          }
        }
      });
    }
  } catch (err) {
    log.error("service create-db", err);
  } finally {
    await session.endSession();
  }
  return _id;
};
