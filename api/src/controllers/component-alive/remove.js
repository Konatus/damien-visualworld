import groupBy from "lodash.groupby";
import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import list from "../../services/list.js";
import remove from "../../services/remove.js";
import updateKey from "../../services/update-key.js";
import upsert from "../../services/upsert.js";
import read from "../../services/read.js";

export default async (socket, scope, request) => {
  const session = global.mgo.startSession();
  try {
    let componentsOfTheWorld;
    let positionsInBoards;
    await session.withTransaction(async () => {
      const { document } = request;
      const currentUserId = getUserTag(socket, scope);
      const removedComponentId = document[0]._id.toString();

      await removeBoardComponents({ scope, session }, removedComponentId);
      positionsInBoards = await transmutePositions(
        { scope, session },
        removedComponentId
      ); // TODO : trashed positions
      componentsOfTheWorld = await removeComponents({
        document,
        scope,
        currentUserId,
        session,
      });
    });

    if (session.transaction.state === "TRANSACTION_COMMITTED") {
      room.componentAlive.emit(
        socket,
        scope,
        componentsOfTheWorld.componentAlive,
        { me: true, others: true }
      );
      room.componentTrash.emit(
        socket,
        scope,
        componentsOfTheWorld.componentTrash,
        { me: true, others: true }
      );

      for (let boardId in positionsInBoards) {
        room.positionAlive.emit(
          socket,
          {
            worldId: scope.worldId,
            boardId: [boardId],
          },
          positionsInBoards[boardId],
          { me: true, others: true }
        );
      }
    }
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "component-alive/remove",
      scope,
      request,
      error
    );
  }
};

// Set the component as trashed
const removeComponents = async ({
  document,
  scope,
  currentUserId,
  session,
}) => {
  await remove.many({
    database: scope.worldId,
    collection: "Component",
    document,
    currentUserId,
    session,
  });
  return {
    componentAlive: await read.alive({
      database: scope.worldId,
      collection: "Component",
      document,
      session,
    }),
    componentTrash: await read.trash({
      database: scope.worldId,
      collection: "Component",
      document,
      session,
    }),
  };
};

// Remove the component from the dock of any board
const removeBoardComponents = async (
  { scope, session },
  removedComponentId
) => {
  const allBoardComponents = await list.alive({
    database: scope.worldId,
    collection: "BoardComponent",
    session,
  });

  const toBeUpdatedBoardComponents = allBoardComponents.filter(
    (boardComponent) => {
      let toBeUpdatedBoardComponent = false;
      for (let ground of ["foreground", "background"]) {
        if (
          boardComponent.data &&
          boardComponent.data[ground] &&
          boardComponent.data[ground].some(
            (x) => x.componentId.toString() === removedComponentId
          )
        ) {
          const preservedItems = boardComponent.data[ground].filter(
            (component) =>
              component.componentId.toString() !== removedComponentId
          );
          preservedItems.sort((a, b) => a.rank - b.rank);
          preservedItems.forEach((item, index) => {
            item.rank = index;
          });
          boardComponent.data[ground] = preservedItems;

          toBeUpdatedBoardComponent = true;
        }
      }
      return toBeUpdatedBoardComponent;
    }
  );

  await upsert.many({
    database: scope.worldId,
    collection: "BoardComponent",
    document: toBeUpdatedBoardComponents.map((boardComponent) => ({
      _id: boardComponent._id,
      data: boardComponent.data,
    })),
    session,
  });
};

// Make generic objects of this component's positions
const transmutePositions = async ({ scope, session }, removedComponentId) => {
  const positions = await list.alive({
    database: scope.worldId,
    collection: "Position",
    document: [{ componentId: removedComponentId }],
    session,
  });
  positions.forEach((position) => {
    position.componentId = null;
  });

  await updateKey({
    database: scope.worldId,
    collection: "Position",
    selection: {
      componentId: removedComponentId,
    },
    set: {
      componentId: "",
    },
    session,
  });

  return groupBy(positions, (position) => position.boardId);
};
