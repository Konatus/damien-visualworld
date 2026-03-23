import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import MongoId from "../../utils/mongo-id.js";
import countBy from "lodash.countby";

import list from "../../services/list.js";
import read from "../../services/read.js";

import vwComponents from "../../vw-objects.js";
const vwComponentIds = vwComponents().map((x) => x.id);

export default async (socket, scope, request) => {
  try {
    log.info(`board-io/get START for board ${scope.boardId}`);
    let positions = await list.alive({
      database: scope.worldId,
      collection: "Position",
      document: {
        boardId: scope.boardId,
      },
    });
    log.info(`board-io/get: Found ${positions.length} positions`);
    positions = positions.map((position) => ({
      positionId: position._id,
      objectId: position.objectId,
      componentId: position.componentId,
      object: {
        data: {
          /* need object collection read */
        },
      },
      position: {
        data: {
          top: position.data && position.data.top ? position.data.top : 0,
          left: position.data && position.data.left ? position.data.left : 0,
          width: position.data && position.data.width ? position.data.width : 0,
          height:
            position.data && position.data.height ? position.data.height : 0,
          zIndex:
            position.data && position.data.zIndex ? position.data.zIndex : 0,
          rotation:
            position.data && position.data.rotation
              ? position.data.rotation
              : 0,
        },
        protect: {
          isBackground: position.protect.isBackground,
        },
        private: {
          updatedAt: position.private.updatedAt,
          createdAt: position.private.createdAt,
        },
      },
    }));

    const objectId = positions.map((position) => ({
      _id: position.objectId,
    }));

    const objects = await read.alive({
      database: scope.worldId,
      collection: "Object",
      document: objectId,
    });
    log.info(`board-io/get: Found ${objects.length} objects`);

    for (let position of positions) {
      const objectData = objects.find(
        (object) =>
          position.objectId &&
          object._id &&
          position.objectId.toString() == object._id.toString()
      );
      if (objectData) {
        position.object.data = objectData.data;
        position.object.protect = objectData.protect;
        position.object.private = {
          createdAt: objectData.private.createdAt,
          updatedAt: objectData.private.updatedAt,
        };
      } else {
        position.object.data = {};
        position.object.protect = {};
      }
    }

    const imageObjects = [];
    for (let object of objects) {
      for (let property in object.data) {
        if (Array.isArray(object.data[property])) {
          for (let image of object.data[property]) {
            if (image.url && image.status === "success") {
              const filename = /\/img\/(\w+)\?/i.exec(image.url)[1]; // TODO: extract filename by a cleaner way
              imageObjects.push({ filename });
            }
          }
        }
      }
    }
    log.info(`board-io/get: Processing ${imageObjects.length} image objects`);
    let images = await read.alive({
      database: scope.worldId,
      collection: "Image",
      document: imageObjects,
    });
    log.info(`board-io/get: Found ${images.length} images`);
    images = images.map((image) => ({
      _id: image._id,
      filename: image.filename,
      data: image.data,
      buffer: Buffer.from(image.buffer.buffer, "utf-8").toString("base64"),
    }));

    log.info(`board-io/get: Fetching board components`);
    let boardComponents = await read.alive({
      database: scope.worldId,
      collection: "BoardComponent",
      document: [
        {
          _id: scope.boardId,
        },
      ],
    });
    log.info(`board-io/get: Found ${boardComponents.length} board components`);
    boardComponents = boardComponents.map((boardComponent) => ({
      _id: boardComponent._id,
      data: boardComponent.data,
    }));

    let componentIds = [
      ...positions
        .filter((position) => position.componentId)
        .map((position) => position.componentId.toString()),
      ...(boardComponents[0]
        ? boardComponents[0].data.foreground || []
        : []
      ).map((boardComponent) => boardComponent.componentId.toString()),
      ...(boardComponents[0]
        ? boardComponents[0].data.background || []
        : []
      ).map((boardComponent) => boardComponent.componentId.toString()),
    ];

    log.info(`board-io/get: Fetching ${componentIds.length} components`);
    const components = (
      await list.alive({
        database: scope.worldId,
        collection: "Component",
        document: componentIds.map(id => ({ _id: MongoId(id) })),
      })
    )
      .map((component) => ({
        _id: component._id.toString(),
        data: component.data,
      }))
      .filter(
        (component) =>
          componentIds.includes(component._id) &&
          !vwComponentIds.includes(component._id)
      );

    componentIds = [...componentIds, ...vwComponentIds];
    if (boardComponents.data) {
      boardComponents.data.foreground = boardComponents.data.foreground.filter(
        (item) => componentIds.includes(item._id.toString())
      );
      boardComponents.data.background = boardComponents.data.background.filter(
        (item) => componentIds.includes(item._id.toString())
      );
    }

    log.info(`board-io/get: Fetching object links`);
    const objectLink = await list.alive({
      database: scope.worldId,
      collection: "ObjectLink",
      document: objectId,
    });
    log.info(`board-io/get: Found ${objectLink.length} object links`);
    const rawLinkId = countBy(objectLink, (item) => item.linkId);
    const linkId = [];
    for (let id in rawLinkId) {
      if (rawLinkId[id] >= 2) {
        linkId.push({ _id: MongoId(id) });
      }
    }

    log.info(`board-io/get: Fetching ${linkId.length} links`);
    let existingLinks = await read.alive({
      database: scope.worldId,
      collection: "Link",
      document: linkId,
    });
    log.info(`board-io/get: Found ${existingLinks.length} existing links`);

    const objectIds = positions
      .filter((position) => position.objectId)
      .map((position) => position.objectId.toString());
    
    // Optimisation : créer un index des objectLinks par linkId pour éviter O(n²)
    const objectLinksByLinkId = {};
    for (let ol of objectLink) {
      const linkIdStr = ol.linkId ? ol.linkId.toString() : null;
      if (linkIdStr) {
        if (!objectLinksByLinkId[linkIdStr]) {
          objectLinksByLinkId[linkIdStr] = [];
        }
        objectLinksByLinkId[linkIdStr].push(ol);
      }
    }
    log.info(`board-io/get: Created objectLinks index with ${Object.keys(objectLinksByLinkId).length} entries`);
    
    let visibleLinks = [];
    for (let link of existingLinks) {
      const linkIdStr = link._id ? link._id.toString() : null;
      link.objects = linkIdStr && objectLinksByLinkId[linkIdStr] 
        ? objectLinksByLinkId[linkIdStr]
        : [];
      
      if (
        link &&
        link.objects &&
        link.objects[0] &&
        link.objects[0].objectId &&
        objectIds.includes(link.objects[0].objectId.toString()) &&
        link.objects[1] &&
        link.objects[1].objectId &&
        objectIds.includes(link.objects[1].objectId.toString()) &&
        (link.data || link.linkModelId)
      ) {
        visibleLinks.push({
          _id: link._id,
          linkModelId: link.linkModelId,
          data: link.data,
          objects: link.objects.map((objectLink) => ({
            _id: objectLink._id,
            linkId: objectLink.linkId,
            objectId: objectLink.objectId,
            data: objectLink.data,
          })),
        });
      }
    }

    const linkModelIds = [
      ...visibleLinks
        .filter((link) => link.linkModelId)
        .map((link) => link.linkModelId.toString()),
    ];
    log.info(`board-io/get: Fetching link models`);
    let linkModels = await list.alive({
      database: scope.worldId,
      collection: "LinkModel",
    });
    log.info(`board-io/get: Found ${linkModels.length} link models, filtering to ${linkModelIds.length}`);

    linkModels = linkModels.filter((linkModel) =>
      linkModelIds.includes(linkModel._id.toString())
    );
    linkModels = linkModels.map((linkModel) => ({
      _id: linkModel._id,
      data: linkModel.data,
    }));
    // Compute linkModelName
    visibleLinks.forEach((link) => {
      try {
        link.linkModelName = linkModels.find(
          (linkModel) => linkModel._id.toString() == link.linkModelId.toString()
        ).data.name;
      } catch (e) {
        link.linkModelName = undefined;
      }
    });

    const format =
      request && request.document ? request.document.format : "json";
    log.info(`board-io/get: Emitting response in format ${format}`);
    return room.boardIoGet.emit(
      socket,
      scope,
      [
        {
          _id: scope.boardId,
          format,
          data: {
            version: "1.0",
            VW: {
              objects: positions,
              components,
              boardComponents,
              linkModels,
              links: visibleLinks,
              images,
            },
          },
        },
      ],
      { me: true, others: false }
    );
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "board-io/get",
      scope,
      request,
      error
    );
  }
};
