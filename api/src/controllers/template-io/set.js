import room from "../../rooms/index.js";
import log from "../../utils/log.js";
import getUserTag from "../../utils/get-user-tag.js";

import list from "../../services/list.js";
import read from "../../services/read.js";
import upsert from "../../services/upsert.js";
import boardIoSet from "../board-io/set/index.js";

export default async (socket, scope, request) => {
  if (request.error) {
    throw request;
  } // TODO: throw is caught only for REST...

  const { templates } = request.document.VW;
  const currentUserId = getUserTag(socket, scope);

  // Handle transactional behavior
  const session = global.mgo.startSession();
  try {
    // Send data to the database
    let readBackData;
    await session.withTransaction(async () => {
      const promises = [
        await updateTemplate(socket, scope, currentUserId, session, templates),
      ];
      readBackData = await Promise.all(promises);
    });

    // Send sockets
    const responseScope = { boardAlive: { worldId: scope.worldId } };
    if (session.transaction.state === "TRANSACTION_COMMITTED") {
      for (let data of readBackData) {
        for (let key in data) {
          if (data[key].length) {
            room[key].emit(socket, responseScope[key], data[key], {
              me: true,
              others: true,
            });
          }
        }
      }
    }

    room.templateIoSet.emit(socket, scope, [{ data: { success: true } }], {
      me: true,
      others: false,
    });
  } catch (error) {
    log.errorController(
      socket.me.identity.email,
      "template-io/set",
      scope,
      request,
      error
    );
    room.templateIoSet.emit(
      socket,
      scope,
      [{ data: { success: false, error } }],
      { me: true, others: false }
    );
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};

async function updateTemplate(
  socket,
  scope,
  currentUserId,
  session,
  templates = []
) {
  if (!templates || !templates.length) return {};

  let templateToUpsert = {};

  let alreadyExist = (
    (await list.alive({
      database: scope.worldId,
      collection: "Board",
      session,
    })) || []
  )
    .filter((template) => template.state)
    .map((template) => template._id.toString());

  templateToUpsert = templates.filter(
    (template) => !alreadyExist.includes(template._id)
  );
  templateToUpsert = templateToUpsert.map((template) => ({
    _id: template._id,
    private: {
      templatedBy: template.private.templatedBy,
    },
    data: template.data,
    state: template.state,
  }));

  await createTemplatePositionAndLink(socket, scope, templateToUpsert);

  const upsertedTemplate = await upsert.many({
    database: scope.worldId,
    collection: "Board",
    document: templateToUpsert,
    currentUserId,
    session,
  });

  return {
    boardAlive: upsertedTemplate.length
      ? await read.alive({
          database: scope.worldId,
          collection: "Board",
          document: upsertedTemplate,
          session,
        })
      : [],
  };
}
async function createTemplatePositionAndLink(socket, scope, templates) {
  for (const template of templates) {
    scope.boardId = template._id;
    const timestamp = template.state.latest;
    const VW = template.state[timestamp].VW;

    await boardIoSet(socket, scope, {
      document: {
        VW,
        options: {
          flushForeground: false,
          flushBackground: false,
          importForeground: true,
          importBackground: true,
          importLinks: true,
          updateModel: false,
          useNewObjectId: false,
        },
      },
    });
  }
}
