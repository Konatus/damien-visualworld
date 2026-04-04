import CONF from "../conf.js";

import {
  boardComponent,
  boardGrant,
  object,
  connectionAll,
  linkAlive,
  positionAlive,
} from "../rooms/index.js";

import BoardAlive from "../controllers/board-alive/index.js";
import BoardComponent from "../controllers/board-component/index.js";
import BoardGrant from "../controllers/board-grant/index.js";
import BoardIo from "../controllers/board-io/index.js";
import ConnectionAll from "../controllers/connection-all/index.js";
import JiraUse from "../controllers/jira-use/index.js";
import LinkAlive from "../controllers/link-alive/index.js"; // Links defined at world level, but list provided for a board level
import LinkTrash from "../controllers/link-trash/index.js";
import Object from "../controllers/object/index.js";
import ObjectSearch from "../controllers/object-search/index.js";
import PositionAlive from "../controllers/position-alive/index.js";
import PositionTrash from "../controllers/position-trash/index.js";

export default async (socket, scope) => {
  if (socket.me.request.includes(`connection-all/list-board`)) {
    ConnectionAll.create(socket, scope);
    const checkIfSocketIsStillAlive = setInterval(async function () {
      if (socket && socket.connected) {
        ConnectionAll.update(socket, scope);
      } else {
        ConnectionAll.remove(socket, scope);
        clearInterval(checkIfSocketIsStillAlive);
      }
    }, CONF.SOCKET_EXPIRES_AFTER * 0.8 * 1000); // 80% of timeout, converted from seconds to milliseconds
    socket.on(`disconnect`, () => ConnectionAll.remove(socket, scope));
  }

  if (socket.me.request.includes(`board-alive/update`)) {
    socket.on(`board-alive/update`, (request) =>
      BoardAlive.update(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/save-state`)) {
    socket.on(`board-alive/save-state`, (request) =>
      BoardAlive.saveState(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/load-state`)) {
    socket.on(`board-alive/load-state`, (request) =>
      BoardAlive.loadState(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/add-state`)) {
    socket.on(`board-alive/add-state`, (request) =>
      BoardAlive.addState(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`board-component/list`)) {
    await boardComponent.join(socket, scope);
    BoardComponent.list(socket, scope);
  }
  if (socket.me.request.includes(`board-component/list`)) {
    socket.on(`board-component/list`, (request) =>
      BoardComponent.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-component/set`)) {
    socket.on(`board-component/set`, (request) =>
      BoardComponent.set(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`board-grant/list`)) {
    await boardGrant.join(socket, scope);
    BoardGrant.list(socket, scope);
  }
  if (socket.me.request.includes(`board-grant/list`)) {
    socket.on(`board-grant/list`, (request) =>
      BoardGrant.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-grant/create`)) {
    socket.on(`board-grant/create`, (request) =>
      BoardGrant.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-grant/update`)) {
    socket.on(`board-grant/update`, (request) =>
      BoardGrant.update(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`board-io/set`)) {
    socket.on(`board-io/set`, (request) => BoardIo.set(socket, scope, request));
  }
  if (socket.me.request.includes(`board-io/get`)) {
    socket.on(`board-io/get`, (request) => BoardIo.get(socket, scope, request));
  }

  if (socket.me.request.includes(`connection-all/list-board`)) {
    await connectionAll.join(socket, scope);
    ConnectionAll.listBoard(socket, scope);
  }
  if (socket.me.request.includes(`connection-all/list-board`)) {
    socket.on(`connection-all/list-board`, (request) =>
      ConnectionAll.listBoard(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`connection-all/get-screen`)) {
    socket.on(`connection-all/get-screen`, (request) =>
      ConnectionAll.getScreen(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`connection-all/set-screen`)) {
    socket.on(`connection-all/set-screen`, (request) =>
      ConnectionAll.setScreen(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`link-alive/list`)) {
    await linkAlive.join(socket, scope);
    LinkAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`link-alive/list`)) {
    socket.on(`link-alive/list`, (request) =>
      LinkAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-alive/create`)) {
    socket.on(`link-alive/create`, (request) =>
      LinkAlive.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-alive/read`)) {
    socket.on(`link-alive/read`, (request) =>
      LinkAlive.read(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-alive/update`)) {
    socket.on(`link-alive/update`, (request) =>
      LinkAlive.update(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-alive/remove`)) {
    socket.on(`link-alive/remove`, (request) =>
      LinkAlive.remove(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`link-trash/restore`)) {
    socket.on(`link-trash/restore`, (request) =>
      LinkTrash.restore(socket, scope, request)
    );
  }

  // Await object, before sending position, avoid rerender
  if (socket.me.request.includes(`object/list`)) {
    await object.join(socket, scope);
    await Object.list(socket, scope);
  }
  if (socket.me.request.includes(`object/list`)) {
    socket.on(`object/list`, (request) => Object.list(socket, scope, request));
  }
  if (socket.me.request.includes(`object/read`)) {
    socket.on(`object/read`, (request) => Object.read(socket, scope, request));
  }
  if (socket.me.request.includes(`object/update`)) {
    socket.on(`object/update`, (request) =>
      Object.update(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`object-search`)) {
    socket.on(`object-search`, (request) =>
      ObjectSearch.search(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`jira-project/get`)) {
    socket.on(`jira-project/get`, (request) =>
      JiraUse.project(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`jira-issue/get`)) {
    socket.on(`jira-issue/get`, (request) =>
      JiraUse.issue(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`jira-issue/create`)) {
    socket.on(`jira-issue/create`, (request) =>
      JiraUse.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`jira-team/get`)) {
    socket.on(`jira-team/get`, (request) =>
      JiraUse.team(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`position-alive/list`)) {
    await positionAlive.join(socket, scope);
    PositionAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`position-alive/list`)) {
    socket.on(`position-alive/list`, (request) =>
      PositionAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/create-front`)) {
    socket.on(`position-alive/create-front`, (request) =>
      PositionAlive.createFront(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/update-front`)) {
    socket.on(`position-alive/update-front`, (request) =>
      PositionAlive.updateFront(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/remove-front`)) {
    socket.on(`position-alive/remove-front`, (request) =>
      PositionAlive.removeFront(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/create-back`)) {
    socket.on(`position-alive/create-back`, (request) =>
      PositionAlive.createBack(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/update-back`)) {
    socket.on(`position-alive/update-back`, (request) =>
      PositionAlive.updateBack(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/remove-back`)) {
    socket.on(`position-alive/remove-back`, (request) =>
      PositionAlive.removeBack(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/remove-completely`)) {
    socket.on(`position-alive/remove-completely`, (request) =>
      PositionAlive.removeCompletely(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/set-back`)) {
    socket.on(`position-alive/set-back`, (request) =>
      PositionAlive.setBack(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/unset-back`)) {
    socket.on(`position-alive/unset-back`, (request) =>
      PositionAlive.unsetBack(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`position-alive/transmute`)) {
    socket.on(`position-alive/transmute`, (request) =>
      PositionAlive.transmute(socket, scope, request)
    );
  }

  // Not used yet, dont send those data improve perfs
  // if( socket.me.request.includes(  `position-trash/list`         ) ) { await positionTrash.join( socket, scope );            PositionTrash.list       ( socket, scope )            }
  // if( socket.me.request.includes(  `position-trash/list`         ) ) { socket.on( `position-trash/list`         , request => PositionTrash.list       ( socket, scope, request ) ) }
  if (socket.me.request.includes(`position-trash/restore`)) {
    socket.on(`position-trash/restore`, (request) =>
      PositionTrash.restore(socket, scope, request)
    );
  }
};
