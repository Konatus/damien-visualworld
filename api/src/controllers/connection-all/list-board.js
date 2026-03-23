import room from "../../rooms/index.js";
import log from "../../utils/log.js";

export default async (socket, scope, request = {}) => {
  try {
    let people = await global.mgoSockets
      .find({
        worldId: scope.worldId,
        boardId: scope.boardId,
      })
      .toArray()
      .catch((err) => {
        log.warn(err);
      });

    people = people.map(({ data }) => {
      const worldGrant =
        data.profile &&
        data.profile.world &&
        data.profile.world[scope.worldId] &&
        data.profile.world[scope.worldId]
          ? data.profile.world[scope.worldId]
          : {};
      const boardGrant =
        data.profile &&
        data.profile.board &&
        data.profile.board[scope.boardId] &&
        data.profile.board[scope.boardId]
          ? data.profile.board[scope.boardId]
          : {};
      const grantLevel = {
        owner: worldGrant.owner || boardGrant.owner,
        administrator: worldGrant.administrator || boardGrant.administrator,
        animator: worldGrant.animator || boardGrant.animator,
        modeler: worldGrant.modeler || boardGrant.modeler,
        participant: worldGrant.participant || boardGrant.participant,
        observer: worldGrant.observer || boardGrant.observer,
      };

      return {
        _id: data.identity.email,
        data: {
          identity: data.identity,
          grantLevel,
          profile: {
            app: data.profile.app,
          },
        },
      };
    });

    room.connectionAll.emit(socket, scope, people, {
      me: request.reply !== false,
      others: true,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "connection-all/list-board",
      scope,
      request,
      error
    );
  }
};
