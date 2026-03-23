export default ({ link, objectLink, position }) => {
  link.forEach((item) => {
    const objectLinks = objectLink
      ? objectLink.filter(
          (x) => x.linkId && x.linkId.toString() === item._id.toString()
        )
      : item.objects;
    const objects = objectLinks.map((object) => ({
      ...object,
      positions: position
        .filter(
          (position) =>
            position.objectId.toString() == object.objectId.toString()
        )
        .map((position) => ({
          componentId: position.componentId,
          boardId: position.boardId,
          data: position.data,
          positionId: position._id,
        })),
    }));

    // Sort start and end order objectLinks of link
    item.objects = objects.sort((a, b) => a.data.arrowhead - b.data.arrowhead);
  });
  return link;
};
