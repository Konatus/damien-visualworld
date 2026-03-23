import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });
const schema = {
  type: "object",
  properties: {
    objects: {
      type: "array",
      items: {
        $ref: "#/definitions/Object",
      },
    },
    components: {
      type: "array",
      items: {
        $ref: "#/definitions/Component",
      },
    },
    boardComponents: {
      type: "array",
      items: {
        $ref: "#/definitions/BoardComponent",
      },
    },
    links: {
      type: "array",
      items: {
        $ref: "#/definitions/Link",
      },
    },
    linkModels: {
      type: "array",
      items: {
        $ref: "#/definitions/LinkModel",
      },
    },
    error: {
      type: "object",
    },
  },
  title: "VM",
  definitions: {
    BoardComponent: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        data: {
          $ref: "#/definitions/BoardComponentData",
        },
      },
      required: ["data"],
      title: "BoardComponent",
    },
    BoardComponentData: {
      type: "object",
      properties: {
        background: {
          type: "array",
          items: {
            $ref: "#/definitions/Ground",
          },
        },
        foreground: {
          type: "array",
          items: {
            $ref: "#/definitions/Ground",
          },
        },
      },
      title: "BoardComponentData",
    },
    Ground: {
      type: "object",
      properties: {
        componentId: {
          type: "string",
        },
        rank: {
          type: "integer",
        },
      },
      required: ["componentId", "rank"],
      title: "Ground",
    },
    Object: {
      type: "object",
      properties: {
        objectId: {
          type: "string",
        },
        componentId: {
          type: "string",
        },
        object: {
          $ref: "#/definitions/ObjectObject",
        },
        position: {
          $ref: "#/definitions/Position",
        },
      },
      required: ["object", "position"],
      title: "Object",
    },
    ObjectObject: {
      type: "object",
      properties: {
        data: {
          $ref: "#/definitions/ObjectData",
        },
        protect: {
          $ref: "#/definitions/ObjectProtect",
        },
      },
      required: ["data"],
      title: "ObjectObject",
    },
    ObjectData: {
      type: "object",
      properties: {},
      title: "ObjectData",
    },
    ObjectProtect: {
      type: "object",
      properties: {
        styleBackgroundColor: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        styleOutlineColor: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        styleColor: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
      },
      title: "ObjectProtect",
    },
    Position: {
      type: "object",
      properties: {
        data: {
          $ref: "#/definitions/PositionData",
        },
        protect: {
          $ref: "#/definitions/PositionProtect",
        },
      },
      required: ["data", "protect"],
      title: "Position",
    },
    PositionData: {
      type: "object",
      properties: {
        height: {
          type: "number",
        },
        left: {
          type: "number",
        },
        top: {
          type: "number",
        },
        width: {
          type: "number",
        },
        zIndex: {
          type: "integer",
        },
      },
      required: ["height", "left", "top", "width", "zIndex"],
      title: "PositionData",
    },
    PositionProtect: {
      type: "object",
      properties: {
        isBackground: {
          type: "boolean",
        },
      },
      required: ["isBackground"],
      title: "PositionProtect",
    },
    Component: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        data: {
          $ref: "#/definitions/ComponentData",
        },
      },
      required: ["_id", "data"],
      title: "Component",
    },
    ComponentData: {
      type: "object",
      properties: {
        defaultHeight: {
          type: "number",
        },
        defaultWidth: {
          type: "number",
        },
        description: {
          type: "string",
        },
        name: {
          type: "string",
        },
        schemaForm: {
          type: "string",
        },
        styleBackgroundColor: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        styleOutlineColor: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        styleColor: {
          anyOf: [
            {
              type: "string",
            },
            {
              type: "null",
            },
          ],
        },
        styleCss: {
          type: "string",
        },
        templateGraphical: {
          type: "array",
          items: {},
        },
        templateGraphicalStyle: {
          $ref: "#/definitions/TemplateGraphicalStyle",
        },
        templateHtml: {
          type: "string",
        },
        templateUseHtml: {
          type: "boolean",
        },
      },
      required: [
        "defaultHeight",
        "defaultWidth",
        "description",
        "name",
        "schemaForm",
        "styleBackgroundColor",
        "styleOutlineColor",
        "styleColor",
        "styleCss",
        "templateUseHtml",
      ],
      title: "ComponentData",
    },
    TemplateGraphicalStyle: {
      type: "object",
      title: "TemplateGraphicalStyle",
    },
    Link: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        data: {
          $ref: "#/definitions/LinkData",
          $comment: "Is required only for generic links (no linkModelId)",
        },
        objects: {
          type: "array",
          items: {
            $ref: "#/definitions/LinkObject",
          },
        },
        linkModelId: {
          type: "string",
          $comment: "Is required only for spcific links (no data)",
        },
        linkModelName: {
          type: "string",
          readOnly: true,
          $comment:
            "is provided in order to ease the understanding, but is not required for import",
        },
      },
      required: ["_id", "objects"],
      anyOf: [
        {
          required: ["data"],
        },
        {
          required: ["linkModelId"],
        },
        {
          required: ["data", "linkModelId"],
        },
      ],
      title: "Link",
    },
    LinkObject: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        linkId: {
          type: "string",
          $comment:
            "TODO: remove because linkId is provided at parent level (#/definitions/Link)",
        },
        objectId: {
          type: "string",
        },
        data: {
          $ref: "#/definitions/LinkObjectData",
        },
      },
      required: ["_id", "objectId", "data"],
      title: "LinkObject",
    },
    LinkObjectData: {
      type: "object",
      properties: {
        arrowhead: {
          type: "integer",
        },
        type: {
          type: "string",
        },
      },
      required: ["arrowhead", "type"],
      title: "LinkObjectData",
    },
    LinkData: {
      type: "object",
      properties: {
        color: {
          type: "string",
        },
        curve: {
          type: "number",
        },
        dash: {
          type: "integer",
        },
        size: {
          type: "integer",
        },
        title: {
          type: "string",
        },
      },
      required: ["color", "curve", "dash", "size"],
      title: "LinkData",
    },
    LinkModel: {
      type: "object",
      properties: {
        _id: {
          type: "string",
        },
        data: {
          $ref: "#/definitions/LinkModelData",
        },
      },
      required: ["_id", "data"],
      title: "LinkModel",
    },
    LinkModelData: {
      type: "object",
      properties: {
        anchors: {
          type: "array",
          items: {
            $ref: "#/definitions/Anchor",
          },
        },
        color: {
          type: "string",
        },
        curve: {
          type: "number",
        },
        dash: {
          type: "number",
        },
        description: {
          type: "string",
        },
        name: {
          type: "string",
        },
        size: {
          type: "number",
        },
      },
      required: [
        "anchors",
        "color",
        "curve",
        "dash",
        "description",
        "name",
        "size",
      ],
      title: "LinkModelData",
    },
    Anchor: {
      type: "object",
      properties: {
        data: {
          $ref: "#/definitions/AnchorData",
        },
      },
      required: ["data"],
      title: "Anchor",
    },
    AnchorData: {
      type: "object",
      properties: {
        arrowhead: {
          type: "integer",
        },
        type: {
          type: "string",
        },
      },
      required: ["arrowhead", "type"],
      title: "AnchorData",
    },
  },
};
const checkRequestSchema = ajv.compile(schema);

export default (VW) => {
  const isValid = checkRequestSchema(VW);
  return isValid ? {} : checkRequestSchema;
};
