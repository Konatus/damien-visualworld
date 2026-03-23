import CONF from "../conf.js";
const DEBUG_PROFILE = {
  isRoot: true,
  world: {
    administrator: false,
    modeler: false,
  },
  board: {
    animator: false,
    participant: false,
    observer: false,
  },
};

import list from "../services/list.js";
import profileOfUser from "../services/profile-of-user.js";

export default async ({ email }) => {
  let WORLD_DEMO = true;

  const worlds = await list.alive({
    database: "worlds",
    collection: "Data",
  });

  const profileList = {
    app: {
      isRoot: CONF.IS_PRODUCTION
        ? CONF.ROOT_EMAILS.includes(email)
        : DEBUG_PROFILE.isRoot,
    },
    world: {},
    board: {},
  };
  for (let worldDb of worlds || []) {
    if (worldDb.worldId === CONF.WORLD_DEMO_ID && !profileList.app.isRoot) {
      continue;
    }

    let profile;
    if (CONF.IS_PRODUCTION) {
      profile = await profileOfUser({ database: worldDb.worldId, email }); // TODO: check id is user's one
    } else {
      const boards = await list.alive({
        database: worldDb.worldId,
        collection: "Board",
      });
      profile = {
        userId: email, // Personnal mail wont be set for our customers, here is dev only
        world: {
          worldId: worldDb.worldId,
          data: DEBUG_PROFILE.world,
        },
        board: boards.map((board) => ({
          worldId: worldDb.worldId,
          boardId: board._id,
          private: board.private,
          data: DEBUG_PROFILE.board,
        })),
      };
    }

    profileList.world[worldDb.worldId] = {};
    if (profile && profile.world && profile.world.data) {
      if (Object.values(profile.world.data).some((item) => item)) {
        WORLD_DEMO = false;
      }
      profileList.world[worldDb.worldId] = {
        userId: profile.userId || email, // email for roots (may access the world without be personally added to that world)
        administrator: profile.world.data.administrator,
        modeler: profile.world.data.modeler,
      };
    }

    if (worldDb.data.owner === email) {
      profileList.world[worldDb.worldId].owner = true;
      WORLD_DEMO = false;
    }

    profileList.world[worldDb.worldId].rootable = worldDb.data.rootable;

    if (profile && profile.board && Array.isArray(profile.board)) {
      for (let board of profile.board) {
        if (board.data) {
          if (Object.values(board.data).some((item) => item)) {
            WORLD_DEMO = false;
          }
          profileList.board[board.boardId] = {
            worldId: worldDb.worldId,
            animator: board.data.animator,
            observer: board.data.observer,
            participant: board.data.participant,
          };
        }
      }

      if (profile && !profile.world) {
        const boards = await list.alive({
          database: worldDb.worldId,
          collection: "Board",
        });

        for (const board of boards.filter(
          (item) => item && item.private && item.private.templatedBy
        )) {
          if (profileList.board[board._id]) {
            profileList.board[board._id].template = true;
          } else {
            profileList.board[board._id] = {
              template: true,
              worldId: worldDb.worldId,
            };
          }
        }
      }
    }
  }

  if (WORLD_DEMO && !profileList.app.isRoot) {
    profileList.world[CONF.WORLD_DEMO_ID] = {
      demoAdministrator: true,
    };
  }
  return profileList;
};
