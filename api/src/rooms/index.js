// Build name of a room
function name(scope, documentId) {
  if (scope.worldId && scope.boardId)
    return `/${scope.worldId}/${scope.boardId}/${documentId}`;
  if (scope.worldId && !scope.boardId) return `/${scope.worldId}/${documentId}`;
  return `/${documentId}`;
}

// Add socket to the room, after scope grants are checked
async function join(socket, scope) {
  const { filterResponseWithScope } = this.conf;

  // List of room(s) to be joined
  let roomNames = [];
  if (filterResponseWithScope === false || socket.me.response === true) {
    roomNames = [name(scope, "*")];
  } else {
    roomNames = socket.me.response.map((_id) => name(scope, _id));
  }

  // Do join the room(s)
  for (let roomName of roomNames) {
    socket.join(roomName);
  }
}

// Emit data, after scope grants are checked
function emit(
  socket,
  scope,
  document = [],
  { me = false, others = false, volatile = false }
) {
  document.forEach((item) => {
    if (item.ultraPrivate) delete item.ultraPrivate;
  });

  // Emit to the whole room...
  if (others) {
    // if socket request: socket.to
    // if REST request: global.io.in
    const socketIo = socket.to ? socket : global.io;
    const to = socket.to ? "to" : "in";

    // To people allowed on every scopes
    if (volatile) {
      socketIo[to](name(scope, "*")).volatile.emit(this.mesg, {
        document,
        me: false,
      });
    } else {
      socketIo[to](name(scope, "*")).emit(this.mesg, { document, me: false });
    }

    // To people allowed on white-listed scope
    if (volatile) {
      for (let item of document) {
        socketIo[to](name(scope, item._id)).volatile.emit(this.mesg, {
          document: item,
          me: false,
        });
      }
    } else {
      for (let item of document) {
        socketIo[to](name(scope, item._id)).emit(this.mesg, {
          document: item,
          me: false,
        });
      }
    }
  }

  // Emit to sender...
  if (me) {
    // Config of the room determines if the response will be filtered on scope
    const { filterResponseWithScope } = this.conf;

    const filteredDocument =
      filterResponseWithScope === false || socket.me.response === true
        ? document // Response has not to be filtered or socket is allowed to all scope
        : document.filter(
            (x) => x._id && socket.me.response.includes(x._id.toString())
          ); // Filter response on white-listed scopes

    if (socket && socket.emit) {
      // socket may be null in case of REST request
      if (volatile) {
        socket.volatile.emit(this.mesg, {
          document: filteredDocument,
          me: true,
        });
      } else {
        socket.emit(this.mesg, { document: filteredDocument, me: true });
      }
    }

    return filteredDocument; // necessary for REST responses
  }
}

// Build the room
const room = (mesg, conf) => ({
  mesg, // name of socket returned by the room
  conf, // config of the room
  name, // name of the room
  join, // make a socket join the room
  emit, // emit data to sender or the whole room
});

export function transaction(
  socket,
  scopes,
  { me = false, others = false, volatile = false },
  transactionData
) {
  if (Array.isArray(transactionData)) {
    for (let item of transactionData) {
      for (let key in item) {
        if (Array.isArray(item[key]) && item[key].length) {
          roomList[key].emit(socket, scopes[key], item[key], {
            me,
            others,
            volatile,
          });
        }
      }
    }
  }
}

// App scope
export const worldAlive = room("world-alive", {
  filterResponseWithScope: true,
});
export const worldTrash = room("world-trash", {
  filterResponseWithScope: true,
});
export const connectionMe = room("connection-me", {
  filterResponseWithScope: false,
});

// World scope
export const boardAlive = room("board-alive", {
  filterResponseWithScope: true,
});
export const boardTrash = room("board-trash", {
  filterResponseWithScope: true,
});
export const componentAlive = room("component-alive", {
  filterResponseWithScope: false,
});
export const componentTrash = room("component-trash", {
  filterResponseWithScope: false,
});
export const grant = room("grant", { filterResponseWithScope: false });
export const linkModelAlive = room("link-model-alive", {
  filterResponseWithScope: false,
});
export const linkModelTrash = room("link-model-trash", {
  filterResponseWithScope: false,
});
export const templateIoGet = room("template-io-get", {
  filterResponseWithScope: false,
});
export const templateIoSet = room("template-io-set", {
  filterResponseWithScope: false,
});
export const userAlive = room("user-alive", { filterResponseWithScope: false });
export const userTrash = room("user-trash", { filterResponseWithScope: false });
export const worldUse = room("world-use", { filterResponseWithScope: false });

// Board scope
export const boardIoGet = room("board-io-get", {
  filterResponseWithScope: false,
});
export const boardIoSet = room("board-io-set", {
  filterResponseWithScope: false,
});
export const boardShortcut = room("board-shortcut", {
  filterResponseWithScope: false,
});
export const boardComponent = room("board-component", {
  filterResponseWithScope: false,
});
export const boardGrant = room("board-grant", {
  filterResponseWithScope: false,
});
export const object = room("object", { filterResponseWithScope: false });
export const objectSearch = room("object-search", {
  filterResponseWithScope: false,
});
export const connectionAll = room("connection-all", {
  filterResponseWithScope: false,
});
export const linkAlive = room("link-alive", { filterResponseWithScope: false });
export const positionAlive = room("position-alive", {
  filterResponseWithScope: false,
});
export const positionTrash = room("position-trash", {
  filterResponseWithScope: false,
});
export const jiraProject = room("jira-project", {
  filterResponseWithScope: false,
});
export const jiraIssue = room("jira-issue", { filterResponseWithScope: false });

const roomList = {
  transaction,

  // App scope
  worldAlive,
  worldTrash,
  connectionMe,

  // World scope
  boardAlive,
  boardTrash,
  componentAlive,
  componentTrash,
  grant,
  linkModelAlive,
  linkModelTrash,
  templateIoGet,
  templateIoSet,
  userAlive,
  userTrash,
  worldUse,

  // Board scope
  boardIoGet,
  boardIoSet,
  boardShortcut,
  boardComponent,
  boardGrant,
  object,
  objectSearch,
  connectionAll,
  linkAlive,
  positionAlive,
  positionTrash,
  jiraProject,
  jiraIssue,
};
export default roomList;
