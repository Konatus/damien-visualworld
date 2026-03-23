import listId from "../../../services/list-id.js";
import vwComponents from "../../../vw-objects.js";
import vwLinkModels from "../../../vw-link.js";
import translate from "../../../utils/translate.js";

export default async (VW, { worldId }, socket) => {
  const foreignKeys = {
    objectId: {
      alive: [
        ...(await listId.alive({ database: worldId, collection: "Object" })),
        ...new Set(VW.objects.map((item) => item.objectId.toString())),
      ],
      trash: await listId.trash({ database: worldId, collection: "Object" }),
    },
    componentId: {
      alive: [
        ...(await listId.alive({ database: worldId, collection: "Component" })),
        ...vwComponents(translate(socket)).map((item) => item._id),
        ...new Set(
          VW.components.map((item) =>
            item.componentId ? item._id.toString() : item._id
          )
        ),
      ],
      trash: await listId.trash({ database: worldId, collection: "Component" }),
    },
    linkModelId: {
      alive: [
        ...(await listId.alive({ database: worldId, collection: "LinkModel" })),
        ...vwLinkModels(translate(socket)).map((item) => item._id),
        ...new Set(VW.linkModels.map((item) => item._id.toString())),
      ],
      trash: await listId.trash({ database: worldId, collection: "LinkModel" }),
    },
    linkId: {
      alive: [
        ...(await listId.alive({ database: worldId, collection: "Link" })),
        ...new Set(VW.links.map((item) => item._id.toString())),
      ],
      trash: await listId.trash({ database: worldId, collection: "Link" }),
    },
  };
  const collections = Object.keys(foreignKeys);

  const errors = {};
  const json = JSON.stringify(VW, function (key, rawValue) {
    const value = rawValue.toString();

    // Property doesn't require id check
    if (!collections.includes(key)) {
      return value;
    }

    // Id is existing and deleted
    else if (foreignKeys[key].trash.includes(value)) {
      errors[value] = { code: "TRASHED_ITEM", key, value }; // error object
      return `TRASHED_ITEM: ${value}`; // in situ error
    }

    // Id is existing and alive
    else if (foreignKeys[key].alive.includes(value)) {
      return value;
    }

    // Not found id
    else {
      errors[value] = { code: "NOT_FOUND_ITEM", key, value }; // error object
      return `NOT_FOUND_ITEM: ${value}`; // in situ error
    }
  });

  return {
    errors: Object.values(errors),
    json,
  };
};
