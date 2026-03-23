import checkSchema from "./check-schema.js";
import checkForeignKey from "./check-foreign-keys.js";
import checkJiraIssue from "./check-jira-issue.js";
import setNewId from "./set-new-id.js";

import list from "../../../services/list.js";
import read from "../../../services/read.js";
import upsert from "../../../services/upsert.js";
import remove from "../../../services/remove.js";

import room from "../../../rooms/index.js";
import log from "../../../utils/log.js";
import MongoId from "../../../utils/mongo-id.js";
import getUserTag from "../../../utils/get-user-tag.js";
import deduplicate from "../../../utils/deduplicate-name.js";

import flatten from "lodash.flatten";
import omit from "lodash.omit";
export default async (socket, scope, request) => {
  // Handle transactional behavior
  let res = false;
  const session = global.mgo.startSession();
  try {
    if (!request.document.VW.objects) {
      request.document.VW.objects = [];
    }
    if (!request.document.VW.components) {
      request.document.VW.components = [];
    }
    if (!request.document.VW.linkModels) {
      request.document.VW.linkModels = [];
    }
    if (!request.document.VW.links) {
      request.document.VW.links = [];
    }
    if (!request.document.options) {
      request.document.options = {};
    }

    // Formal check: schema validation with ajv
    const formalErrors = checkSchema(request.document.VW).errors || [];
    if (formalErrors.length) {
      throw formalErrors;
    }

    // Functional checks
    const functionalErrors = [
      ...((await checkForeignKey(request.document.VW, scope, socket)).errors ||
        []),
      ...((await checkJiraIssue(request.document.VW, scope)).errors || []),
    ];
    if (functionalErrors.length) {
      throw functionalErrors;
    }

    // Read the request...
    const currentUserId = getUserTag(socket, scope);
    const { options } = request.document;

    if (!("importForeground" in options)) {
      options["importForeground"] = true;
    }
    if (!("importBackground" in options)) {
      options["importBackground"] = false;
    }
    if (!("importLinks" in options)) {
      options["importLinks"] = true;
    }
    if (!("flushForeground" in options)) {
      options["flushForeground"] = false;
    }
    if (!("flushBackground" in options)) {
      options["flushBackground"] = false;
    }
    if (!("updateModel" in options)) {
      options["updateModel"] = false;
    }
    if (!("useNewObjectId" in options)) {
      options["useNewObjectId"] = true;
    }

    const { objects, links, components, linkModels, boardComponents, images } =
      setNewId(request.document.VW, scope, options);
    for (let component of components) {
      await deduplicate({
        socket,
        worldId: scope.worldId,
        collection: "Component",
        document: component,
      });
    }
    for (let linkModel of linkModels) {
      await deduplicate({
        socket,
        worldId: scope.worldId,
        collection: "LinkModel",
        document: linkModel,
      });
    }

    // Send data to the database
    const transactionData = [];
    await session.withTransaction(async () => {
      transactionData.push(
        await flushPosition(scope, session, options, currentUserId)
      );
      transactionData.push(
        await updateModel(
          scope,
          session,
          options,
          currentUserId,
          components,
          linkModels
        )
      );
      transactionData.push(
        await updateDock(
          scope,
          session,
          options,
          currentUserId,
          boardComponents
        )
      );
      transactionData.push(
        await updatePosition(scope, session, options, currentUserId, objects)
      );
      transactionData.push(
        await updateLink(scope, session, options, currentUserId, links)
      );
      await updateImage(scope, session, options, currentUserId, images);
    });
    if (
      !["TRANSACTION_COMMITTED", "TRANSACTION_COMMITTED_EMPTY"].includes(
        session.transaction.state
      )
    ) {
      throw new Error("TODO");
    }

    // Send sockets with updated data
    room.transaction(
      socket,
      {
        componentAlive: { worldId: scope.worldId },
        linkModelAlive: { worldId: scope.worldId },
        positionAlive: scope,
        positionTrash: scope,
        boardComponent: scope,
        object: scope,
        linkAlive: scope,
      },
      {
        me: true,
        others: true,
      },
      transactionData
    );

    // Send socket with "success"
    room.boardIoSet.emit(socket, scope, [{ data: { success: true } }], {
      me: true,
      others: false,
    });
    res = true; // REST 200 is return
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-io/set",
      scope,
      request,
      error
    );

    // Send socket with no "success"
    room.boardIoSet.emit(socket, scope, [{ data: { success: false, error } }], {
      me: true,
      others: false,
    });
    res = false; // REST 500 is return

    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
  return res;
};

// Trash existing positions
async function flushPosition(
  scope,
  session,
  { flushForeground, flushBackground },
  currentUserId
) {
  if (!flushForeground && !flushBackground) return {};

  const positions =
    (await list.alive({
      database: scope.worldId,
      collection: "Position",
      document: {
        boardId: scope.boardId,
      },
      session,
    })) || [];

  const flushedPositionId =
    (await remove.many({
      database: scope.worldId,
      collection: "Position",
      document: [
        ...(flushForeground
          ? positions.filter((position) => !position.protect.isBackground)
          : []),
        ...(flushBackground
          ? positions.filter((position) => position.protect.isBackground)
          : []),
      ],
      currentUserId,
      session,
    })) || [];

  const flushedPosition = {
    database: scope.worldId,
    collection: "Position",
    document: flushedPositionId,
    session,
  };
  const [positionAlive, positionTrash] = await Promise.all([
    read.alive(flushedPosition),
    read.trash(flushedPosition),
  ]);
  return {
    positionAlive,
    positionTrash,
  };
}

// Update component & link-model
async function updateModel(
  scope,
  session,
  { updateModels },
  currentUserId,
  components = [],
  linkModels = []
) {
  const insertModel = async (collection, items) => {
    if (!items.length) return [];

    let toUpsert = [];
    if (updateModels) {
      toUpsert = items;
    } else {
      const alreadyExist = (
        (await list.alive({
          database: scope.worldId,
          collection,
        })) || []
      ).map((item) => item._id);
      toUpsert = items.filter((item) => !alreadyExist.includes(item._id));
    }
    if (!toUpsert.length) {
      return [];
    }

    const upserted =
      (await upsert.many({
        database: scope.worldId,
        collection,
        document: toUpsert.map((item) => ({
          _id: item._id,
          data: item.data,
        })),
        currentUserId,
        session,
      })) || [];
    return read.alive({
      database: scope.worldId,
      collection,
      document: upserted,
      session,
    });
  };

  const [componentAlive, linkModelAlive] = await Promise.all([
    insertModel("Component", components),
    insertModel("LinkModel", linkModels),
  ]);
  return {
    componentAlive,
    linkModelAlive,
  };
}

// Update dock content: two component lists (one for the foreground, the other one for the background)
// TODO cleaner code... but not a strategic func...
async function updateDock(
  scope,
  session,
  { importForeground, importBackground },
  currentUserId,
  boardComponents = []
) {
  if (!importForeground && !importBackground) return {};
  if (!boardComponents || !boardComponents.length) return {};

  const existingBoardComponent =
    (await read.alive({
      database: scope.worldId,
      collection: "BoardComponent",
      document: [
        {
          _id: scope.boardId,
        },
      ],
      session,
    })) || [];

  const boardComponentToUpsert = {
    _id: MongoId(scope.boardId),
    data: {},
  };
  const grounds = [
    ...(importBackground ? ["background"] : []),
    ...(importForeground ? ["foreground"] : []),
  ];
  for (let ground of grounds) {
    let filteredBoardComponent = {};
    existingBoardComponent.forEach((bc) => {
      (bc.data[ground] || []).forEach((item) => {
        filteredBoardComponent[item.componentId] = item;
      });
    });
    boardComponents.forEach((bc) => {
      (bc.data[ground] || []).forEach((item) => {
        filteredBoardComponent[item.componentId] = item;
      });
    });
    filteredBoardComponent = Object.values(filteredBoardComponent);

    filteredBoardComponent.sort((a, b) => a.rank - b.rank);
    filteredBoardComponent.forEach((item, index) => (item.rank = index));
    boardComponentToUpsert.data[ground] = filteredBoardComponent;
  }

  const upsertBoardComponent = await upsert.one({
    database: scope.worldId,
    collection: "BoardComponent",
    document: boardComponentToUpsert,
    currentUserId,
    session,
  });
  if (upsertBoardComponent) {
    const boardComponentList = await read.alive({
      database: scope.worldId,
      collection: "BoardComponent",
      document: [upsertBoardComponent],
      session,
    });

    const reformedBoardComponentList = [];
    boardComponentList.forEach((item) => {
      if (item.data.foreground) {
        reformedBoardComponentList.push(
          ...item.data.foreground.map((x) => ({
            data: {
              componentId: x.componentId,
              rank: x.rank,
              isBackground: false,
            },
          }))
        );
      }
      if (item.data.background) {
        reformedBoardComponentList.push(
          ...item.data.background.map((x) => ({
            data: {
              componentId: x.componentId,
              rank: x.rank,
              isBackground: true,
            },
          }))
        );
      }
    });
    return {
      boardComponent: reformedBoardComponentList,
    };
  }
}

// Update positions
async function updatePosition(
  scope,
  session,
  { importForeground, importBackground },
  currentUserId,
  objects = []
) {
  if (!importForeground && !importBackground) return {};
  if (!objects.length) return {};

  const filteredObject = objects.filter(
    (item) =>
      (item.position.protect.isBackground === true &&
        importBackground === true) ||
      (item.position.protect.isBackground === false &&
        importForeground === true)
  );

  const objectToUpsert = filteredObject.map((item) => ({
    _id: item.objectId,
    data: Object.assign({}, item.object.data),
    protect: Object.assign({}, item.object.protect),
  }));
  const upsertedObject =
    (await upsert.many({
      database: scope.worldId,
      collection: "Object",
      document: objectToUpsert,
      currentUserId,
      session,
    })) || [];

  const positionToUpsert = filteredObject.map((item) => ({
    _id: item._id,
    boardId: scope.boardId,
    componentId: item.componentId,
    objectId: item.objectId,
    data: item.position.data,
    protect: {
      isBackground: item.position.protect.isBackground,
    },
  }));
  const upsertedPosition =
    (await upsert.many({
      database: scope.worldId,
      collection: "Position",
      document: positionToUpsert,
      currentUserId,
      session,
    })) || [];

  const [object, positionAlive] = await Promise.all([
    read.alive({
      database: scope.worldId,
      collection: "Object",
      document: upsertedObject,
      session,
    }),
    read.alive({
      database: scope.worldId,
      collection: "Position",
      document: upsertedPosition,
      session,
    }),
  ]);
  return {
    object,
    positionAlive,
  };
}

// Update links
async function updateLink(
  scope,
  session,
  { importLinks },
  currentUserId,
  links = []
) {
  if (!importLinks) return {};
  if (!links.length) return {};

  const upsertedLinkId =
    (await upsert.many({
      database: scope.worldId,
      collection: "Link",
      document: links,
      currentUserId,
      session,
    })) || [];

  await upsert.many({
    database: scope.worldId,
    collection: "ObjectLink",
    document: flatten(links.map((link) => link.objects)).map((object) =>
      omit(object, "_id" /* Needed to create new objectLinks */)
    ),
    currentUserId,
    session,
  });

  const upsertedLink = await read.alive({
    database: scope.worldId,
    collection: "Link",
    document: upsertedLinkId,
    session,
  });
  for (let link of upsertedLink) {
    // TODO: is this loop necesssary?
    link.objects = await list.alive({
      database: scope.worldId,
      collection: "ObjectLink",
      document: [
        {
          linkId: link._id,
        },
      ],
      session,
    });
  }

  return {
    linkAlive: upsertedLink,
  };
}

async function updateImage(
  scope,
  session,
  { importForeground, importBackground },
  currentUserId,
  images = []
) {
  if (!importForeground && !importBackground) {
    return;
  }

  images.forEach((image) => {
    if (image.buffer) {
      image.buffer = Buffer.from(image.buffer, "base64");
    }
  });
  await upsert.many({
    database: scope.worldId,
    collection: "Image",
    document: images,
    currentUserId,
    session,
  });
}
