export default async ({ grant, worldId, boardId }) => {
  const { app, world, board } = grant;

  return [
    ...(app ? app : []),
    ...(worldId && world && Array.isArray(world[worldId])
      ? world[worldId]
      : []),
    ...(boardId && board && Array.isArray(board[boardId])
      ? board[boardId]
      : []),
  ];
};
