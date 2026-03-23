import {
  boardAlive,
  boardTrash,
  componentAlive,
  componentTrash,
  grant,
  linkModelAlive,
  linkModelTrash,
  userAlive,
  userTrash,
} from "../rooms/index.js";

import BoardAlive from "../controllers/board-alive/index.js";
import BoardTrash from "../controllers/board-trash/index.js";
import BoardShortcut from "../controllers/board-shortcut/index.js";
import ComponentAlive from "../controllers/component-alive/index.js";
import ComponentTrash from "../controllers/component-trash/index.js";
import Grant from "../controllers/grant/index.js";
import LinkModelAlive from "../controllers/link-model-alive/index.js";
import LinkModelTrash from "../controllers/link-model-trash/index.js";
import TemplateIo from "../controllers/template-io/index.js";
import UserAlive from "../controllers/user-alive/index.js";
import UserTrash from "../controllers/user-trash/index.js";
import WorldAlive from "../controllers/world-alive/index.js";
import WorldUse from "../controllers/world-use/index.js";

export default async (socket, scope) => {
  if (socket.me.request.includes(`board-alive/list`)) {
    await boardAlive.join(socket, scope);
    BoardAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`board-alive/list`)) {
    socket.on(`board-alive/list`, (request) =>
      BoardAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/create`)) {
    socket.on(`board-alive/create`, (request) =>
      BoardAlive.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/remove`)) {
    socket.on(`board-alive/remove`, (request) =>
      BoardAlive.remove(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/create-template`)) {
    socket.on(`board-alive/create-template`, (request) =>
      BoardAlive.createTemplate(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-alive/remove-template`)) {
    socket.on(`board-alive/remove-template`, (request) =>
      BoardAlive.removeTemplate(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`board-trash/list`)) {
    await boardTrash.join(socket, scope);
    BoardTrash.list(socket, scope);
  }
  if (socket.me.request.includes(`board-trash/list`)) {
    socket.on(`board-trash/list`, (request) =>
      BoardTrash.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`board-trash/restore`)) {
    socket.on(`board-trash/restore`, (request) =>
      BoardTrash.restore(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`board-shortcut/read-boards`)) {
    socket.on(`board-shortcut/read-boards`, (request) =>
      BoardShortcut.readBoards(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`component-alive/list`)) {
    await componentAlive.join(socket, scope);
    ComponentAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`component-alive/list`)) {
    socket.on(`component-alive/list`, (request) =>
      ComponentAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`component-alive/create`)) {
    socket.on(`component-alive/create`, (request) =>
      ComponentAlive.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`component-alive/update`)) {
    socket.on(`component-alive/update`, (request) =>
      ComponentAlive.update(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`component-alive/check-remove`)) {
    socket.on(`component-alive/check-remove`, (request) =>
      ComponentAlive.checkRemove(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`component-alive/remove`)) {
    socket.on(`component-alive/remove`, (request) =>
      ComponentAlive.remove(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`component-trash/list`)) {
    await componentTrash.join(socket, scope);
    ComponentTrash.list(socket, scope);
  }
  if (socket.me.request.includes(`component-trash/list`)) {
    socket.on(`component-trash/list`, (request) =>
      ComponentTrash.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`component-trash/restore`)) {
    socket.on(`component-trash/restore`, (request) =>
      ComponentTrash.restore(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`grant/list`)) {
    await grant.join(socket, scope);
    Grant.list(socket, scope);
  }
  if (socket.me.request.includes(`grant/list`)) {
    socket.on(`grant/list`, (request) => Grant.list(socket, scope, request));
  }
  if (socket.me.request.includes(`grant/create`)) {
    socket.on(`grant/create`, (request) =>
      Grant.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`grant/update`)) {
    socket.on(`grant/update`, (request) =>
      Grant.update(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`link-model-alive/list`)) {
    await linkModelAlive.join(socket, scope);
    LinkModelAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`link-model-alive/list`)) {
    socket.on(`link-model-alive/list`, (request) =>
      LinkModelAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-model-alive/create`)) {
    socket.on(`link-model-alive/create`, (request) =>
      LinkModelAlive.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-model-alive/update`)) {
    socket.on(`link-model-alive/update`, (request) =>
      LinkModelAlive.update(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-model-alive/check-remove`)) {
    socket.on(`link-model-alive/check-remove`, (request) =>
      LinkModelAlive.checkRemove(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-model-alive/remove`)) {
    socket.on(`link-model-alive/remove`, (request) =>
      LinkModelAlive.remove(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`link-model-trash/list`)) {
    await linkModelTrash.join(socket, scope);
    LinkModelTrash.list(socket, scope);
  }
  if (socket.me.request.includes(`link-model-trash/list`)) {
    socket.on(`link-model-trash/list`, (request) =>
      LinkModelTrash.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`link-model-trash/restore`)) {
    socket.on(`link-model-trash/restore`, (request) =>
      LinkModelTrash.restore(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`template-io/get`)) {
    socket.on(`template-io/get`, (request) =>
      TemplateIo.get(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`template-io/set`)) {
    socket.on(`template-io/set`, (request) =>
      TemplateIo.set(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`user-alive/list`)) {
    await userAlive.join(socket, scope);
    UserAlive.list(socket, scope);
  }
  if (socket.me.request.includes(`user-alive/list`)) {
    socket.on(`user-alive/list`, (request) =>
      UserAlive.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`user-alive/create`)) {
    socket.on(`user-alive/create`, (request) =>
      UserAlive.create(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`user-alive/update`)) {
    socket.on(`user-alive/update`, (request) =>
      UserAlive.update(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`user-alive/remove`)) {
    socket.on(`user-alive/remove`, (request) =>
      UserAlive.remove(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`user-trash/list`)) {
    await userTrash.join(socket, scope);
    UserTrash.list(socket, scope);
  }
  if (socket.me.request.includes(`user-trash/list`)) {
    socket.on(`user-trash/list`, (request) =>
      UserTrash.list(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`user-trash/restore`)) {
    socket.on(`user-trash/restore`, (request) =>
      UserTrash.restore(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`world-alive/update`)) {
    socket.on(`world-alive/update`, (request) =>
      WorldAlive.update(socket, scope, request)
    );
  }

  if (socket.me.request.includes(`world-use/get`)) {
    socket.on(`world-use/get`, (request) =>
      WorldUse.get(socket, scope, request)
    );
  }
  if (socket.me.request.includes(`world-use/set`)) {
    socket.on(`world-use/set`, (request) =>
      WorldUse.set(socket, scope, request)
    );
  }
};
