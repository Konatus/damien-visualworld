import room from "../../../rooms/index.js";
import log from "../../../utils/log.js";

import insert from "../../../services/insert.js";
import read from "../../../services/read.js";

import MongoId from "../../../utils/mongo-id.js";
import metaTag from "../../../utils/meta-tag.js";
import getUserTag from "../../../utils/get-user-tag.js";
import VW_models from "../../../vw-objects.js";

export default async (socket, scope, request, { isBackground }) => {
  try {
    let { document } = request;
    const currentUserId = getUserTag(socket, scope);

    document.forEach((position) => {
      position.boardId = scope.boardId;
    });

    // Prevent duplication of jira-type objects
    const [jiraComponentId] = VW_models()
      .filter((item) => item.data.jiraModel)
      .map((item) => item._id);
    const jiraIssuesToBeCreated = document.filter(
      (item) => item.componentId === jiraComponentId
    );
    if (jiraIssuesToBeCreated.length) {
      const objectList = await read.alive({
        database: scope.worldId,
        collection: "Object",
        document: [{ jiraIssueBoardId: scope.boardId }],
      });
      const issueKeys = objectList
        .map((item) => item.data.jira_key)
        .filter((item) => item);
      document = document.filter((item) => {
        return !issueKeys.includes(item.object && item.object.data.jira_key);
      });
    }

    // Sanitize
    document.forEach((item) => {
      // objectId & object must not be provided together
      if (item.objectId && item.object) {
        delete item.objectId;
      }

      // a objectId or a object must be provided
      if (!item.objectId && !item.object) {
        item.object = {};
      }

      // generate an id for the objects to be created
      if (!item.objectId) {
        item.objectId = MongoId();
      }

      // set layer: background or foreground
      item.protect = { isBackground };
    });

    // Create a object, if provided
    const objectToBeCreated = document
      .filter((position) => position.object)
      .map((position) => ({
        _id: position.objectId,
        data: position.object.data,
        protect: position.object.protect,
      }));
    // If is valid url, add a meta tag to the data
    await metaTag(objectToBeCreated);
    await insert.many({
      database: scope.worldId,
      collection: "Object",
      document: objectToBeCreated,
      currentUserId,
    });

    // Create the positions
    const createdPositionId = await insert.many({
      database: scope.worldId,
      collection: "Position",
      document,
      currentUserId,
    });

    // Read the objects
    const objectIds = document.map((item) => ({ _id: item.objectId }));
    const objects = await read.alive({
      database: scope.worldId,
      collection: "Object",
      document: objectIds,
    });

    // Emit object
    // nota bene: the front needs object data first to manage fit-text on creation
    room.object.emit(socket, scope, objects, { me: true, others: true });

    // Read the newly created positions
    const createdPosition = await read.alive({
      database: scope.worldId,
      collection: "Position",
      document: createdPositionId,
    });

    // Emit position
    createdPosition.forEach((position) => {
      delete position.boardId;
      position.private.creating = socket.me.identity.email;
    });
    room.positionAlive.emit(socket, scope, createdPosition, {
      me: true,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "position-alive/create",
      scope,
      request,
      error
    );
  }
};
