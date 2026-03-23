import MongoId from "../../../utils/mongo-id.js";
export default (VW, { boardId }, { useNewObjectId }) => {
  // Set the jiraIssueBoardId to current board Id
  VW.objects.forEach((item) => {
    if (
      item &&
      item.object &&
      item.object.data &&
      item.object.data.jiraIssueBoardId
    ) {
      item.object.data.jiraIssueBoardId = boardId;
    }
  });

  // Default componentId & linkModelId
  VW.objects.forEach((item) => {
    if (!item.componentId) {
      item.componentId = "56575f64656661756c743030";
    }
  });
  VW.links.forEach((item) => {
    if (!item.linkModelId) {
      item.linkModelId = "56575f64656661756c743030";
    }
  });

  // Replace objectId by new one if necessary
  if (useNewObjectId) {
    const newIds = {};
    VW = JSON.parse(
      JSON.stringify(VW, function (key, value) {
        if (["objectId", "linkId"].includes(key)) {
          if (!newIds[value]) newIds[value] = MongoId().toString();
          return newIds[value];
        }
        return value;
      })
    );
    VW.links.forEach((item) => {
      if (!newIds[item._id]) newIds[item._id] = MongoId().toString();
      item._id = newIds[item._id];
    });
  }

  // Always create a new positionId
  VW.objects.forEach((item) => {
    item._id = MongoId().toString();
  });

  return VW;
};
