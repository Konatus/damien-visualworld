import list from "../services/list.js";
import vwObjects from "../vw-objects.js";
import vwLink from "../vw-link.js";
const vw = {
  Component: vwObjects,
  LinkModel: vwLink,
};
import translate from "./translate.js";

export default async ({ socket, worldId, collection, document }) => {
  // Return original document if name isnt provided
  if (!document || !document.data || !document.data.name) {
    return document;
  }

  // Trim tested name
  document.data.name = document.data.name.trim();

  const allDocuments = await getAllDocuments({
    socket,
    worldId,
    collection,
  });
  const sameNameDocuments = allDocuments.filter((_document) => {
    _document.data.name = _document.data.name.trim();
    return (
      _document.data.name.localeCompare(document.data.name, "fr", {
        sensitivity: "base",
      }) === 0
    );
  });

  // No existing document has that name
  // so a renaming isnt necessary.
  if (sameNameDocuments.length === 0) {
    /* nothing to do */
  }

  // Only one existing document has that name - itself because it has also the same id -
  // so a renaming isnt necessary.
  else if (
    sameNameDocuments.length === 1 &&
    sameNameDocuments[0]._id.toString() === (document._id || "").toString()
  ) {
    /* nothing to do */
  }

  // Another existing document has the given
  // so a renaming is necessary...
  else {
    // Split given name
    const documentSplittedName = splitDocumentNameNum(document.data.name);

    // Existing documents, with another _id but same radical of name
    const sameNameDocumentsExceptHash = allDocuments.filter((_document) => {
      // Same id
      if (document._id) {
        if (_document._id.toString() === document._id.toString()) {
          return false;
        }
      }

      // Same radical of name ?
      _document.splittedName = splitDocumentNameNum(_document.data.name);
      return (
        _document.splittedName.name.localeCompare(
          documentSplittedName.name,
          "fr",
          { sensitivity: "base" }
        ) === 0
      );
    });

    // Add appropriate number to make the name of current document unique
    if (sameNameDocumentsExceptHash.length) {
      let max = Math.max(
        ...sameNameDocumentsExceptHash.map((x) => x.splittedName.number)
      );
      document.data.name = documentSplittedName.name + " #" + (1 + max);
    }
  }

  // Add default values if necessary
  return Object.assign(
    {
      data: {
        name: "untitled",
      },
    },
    document
  );
};

// Util: does a document exist with that name
async function getAllDocuments({ socket, worldId, collection }) {
  let allDocuments = await list.alive({
    database: worldId,
    collection,
  });
  if (vw[collection]) {
    allDocuments = [...allDocuments, ...vw[collection](translate(socket))];
  }
  return allDocuments;
}

// Util: split radical and number in the name
function splitDocumentNameNum(rawname) {
  const name = rawname.trim();
  const match = name.match(/^([^#]+)#(\d+)$/i);
  let splittedName = {
    name: match ? match[1] : name,
    number: match ? parseInt(match[2], 10) : 0,
  };
  // Trim returned name
  splittedName.name = splittedName.name.trim();
  return splittedName;
}
