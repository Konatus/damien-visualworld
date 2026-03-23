import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import list from "../../services/list.js";
import read from "../../services/read.js";
import dbSize from "../../services/db-size.js";
import logMaxUse from "./log-max-use.js";

export default async (socket, scope, request) => {
  try {
    const board = await list.alive({
      database: scope.worldId,
      collection: "Board",
    });

    const grant = await list.alive({
      database: scope.worldId,
      collection: "Grant",
    });
    const boardGrant = await list.alive({
      database: scope.worldId,
      collection: "BoardGrant",
    });
    const userList = await list.alive({
      database: scope.worldId,
      collection: "User",
    });
    const [worldData] = await read.alive({
      database: "worlds",
      collection: "Data",
      document: [scope],
    });

    const jiraProject = board.filter((item) => item.data.jira);
    const owner = worldData.data.owner;
    let guest = {};
    let user = owner ? [owner] : [];
    let admin = owner ? [owner] : [];
    const boardGrantLength = {};

    for (const userAlive of userList) {
      const boardLevelGrant = boardGrant.filter((item) => {
        return (
          item.userId.toString() == userAlive._id.toString() &&
          Object.keys(item.data).some((x) => item.data[x])
        );
      });

      const worldLevel = grant.find(
        (grant) => grant.userId.toString() == userAlive._id.toString()
      );
      const worldLevelGrant = worldLevel
        ? worldLevel.data.administrator || worldLevel.data.modeler
        : false;

      if (!userAlive.data.guestUntil) {
        // Boards grant by user
        boardGrantLength[userAlive._id] = boardLevelGrant;
      }

      if (worldLevelGrant && owner != userAlive.data.email) {
        if (worldLevel.data.administrator) {
          admin.push(userAlive.data.email);
        }

        // Count number of users who have world grant
        user.push(userAlive._id);
      } else if (boardLevelGrant.length) {
        if (userAlive.data.guestUntil) {
          let startDay = new Date();
          let endDay = new Date(userAlive.data.guestUntil);
          if (
            Math.ceil(
              (endDay.getTime() - startDay.getTime()) / (1000 * 3600 * 24)
            ) > 0
          ) {
            boardGrant.forEach((item) => {
              if (
                (item.data.observer || item.data.participant) &&
                item.userId.toString() == userAlive._id.toString()
              ) {
                // Count number of users who have guest grant
                if (guest[item.boardId]) {
                  guest[item.boardId] += 1;
                } else {
                  guest[item.boardId] = 1;
                }
              }
            });
          }
        } else {
          // Count number of users who have board grant
          user.push(userAlive._id);
        }
      }
    }
    const db = await dbSize({
      document: [scope],
      scale: 1024 * 1024 * 1024, // Go
    });

    let limitReached = {
      guest: [],
      user: false,
      db: false,
      jiraProjects: false,
    };

    let infoLimit = {
      user: { used: user.length, useMax: worldData.private.useMaxUser },
      guest: { used: guest, useMax: worldData.private.useMaxGuest },
      db: { used: db[0].totalSize, useMax: worldData.private.useMaxDbSize },
      "jira-project": {
        used: jiraProject.length,
        useMax: worldData.private.useMaxJiraProjects,
      },
    };

    Object.keys(guest).forEach(
      (boardId) =>
        guest[boardId] >= worldData.private.useMaxGuest &&
        limitReached.guest.push(boardId)
    );
    if (worldData.private.useMaxUser <= user.length) {
      limitReached.user = true;
    }
    if (worldData.private.useMaxDbSize <= db[0].totalSize) {
      limitReached.db = true;
    }
    if (worldData.private.useMaxJiraProjects <= jiraProject.length) {
      limitReached.jiraProjects = true;
    }

    await logMaxUse(
      socket,
      scope,
      { world: worldData.data.name },
      limitReached,
      admin,
      infoLimit,
      board
    );

    room.worldUse.emit(
      socket,
      scope,
      [
        {
          _id: scope.worldId,
          data: {
            dbSize: db[0].totalSize,
            guest: guest,
            user: user.length,
            jiraProject: jiraProject.length,
          },
          limitReached,
          boardGrantLength,
          private: worldData.private,
        },
      ],
      { me: true, others: false }
    );
  } catch (error) {
    log.errorController(
      socket.handshake.headers["x-forwarded-for"],
      "world-use/get",
      scope,
      request,
      error
    );
  }
};
