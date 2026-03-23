export default async ({ profile, grant, worldId, boardId }) => {
  // Board scope
  if (worldId && boardId) {
    return true;
  }

  // World scope
  if (worldId && !boardId) {
    if (profile.world[worldId]) {
      if (
        (profile.world[worldId].rootable && profile.app.isRoot) ||
        profile.world[worldId].owner ||
        profile.world[worldId].administrator ||
        profile.world[worldId].modeler ||
        profile.world[worldId].demoAdministrator
      ) {
        return true;
      }
    }
    return Object.keys(grant.board);
  }

  // App scope
  if (!worldId && !boardId) {
    if (profile.app.isRoot) {
      return true;
    }
    return Object.keys(grant.world);
  }
};
