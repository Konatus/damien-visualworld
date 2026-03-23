import list from "./list.js";

const listId = async ({ database, collection }, alive) => {
  const state = alive ? "alive" : "trash";
  const existingKeys =
    (
      await list[state]({
        database,
        collection,
      })
    ).map((existing) => existing._id.toString()) || [];
  return existingKeys;
};

export default {
  alive: (request) => {
    return listId(request, true);
  },
  trash: (request) => {
    return listId(request, false);
  },
};
