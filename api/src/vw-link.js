/* generateLinkModelId(str) {
    let element = "";
    for (let i = 0; i < 12; i++) {
        element += str[i] || "0";
    }
    return Array.from(element)
        .map((c) =>
            c.charCodeAt(0) < 128
                ? c.charCodeAt(0).toString(16).padStart(2, "0")
                : encodeURIComponent(c).replace(/\%/g, "").toLowerCase()
        )
        .join("");
}, */

// VW_default: 56575f64656661756c743030
// VW_parent:  56575f706172656e74303030
// "jiraParentLinkModel": '6a697261506172656e744c69',
// "jiraIssueLinkModel": '6a69726149737375654c696e'

export default (i18n) => {
  const $t = i18n || { __: (str) => str };
  return [
    {
      _id: "56575f64656661756c743030",
      data: {
        anchors: [
          {
            data: {
              arrowhead: 0,
              type: "none",
            },
          },
          {
            data: {
              arrowhead: 1,
              type: "none",
            },
          },
        ],
        color: "rgba(152, 152, 162, 1)",
        curve: 0,
        dash: 0,
        description: $t.__("vw-links.simple.description"),
        name: $t.__("vw-links.simple.name"),
        size: 2,
        defaultModel: true,
      },
    },
    {
      _id: "6a697261506172656e744c69",
      data: {
        anchors: [
          {
            data: {
              arrowhead: 0,
              type: "square",
            },
          },
          {
            data: {
              arrowhead: 1,
              type: "triangle",
            },
          },
        ],
        color: "rgba(23, 43, 77, 1)",
        curve: 0.2,
        dash: 0,
        description: $t.__("vw-links.jira-parent.description"),
        name: $t.__("vw-links.jira-parent.name"),
        size: 1,
        defaultModel: true,
      },
    },
    {
      _id: "6a69726149737375654c696e",
      data: {
        anchors: [
          {
            data: {
              arrowhead: 0,
              type: "circle",
            },
          },
          {
            data: {
              arrowhead: 1,
              type: "arrow",
            },
          },
        ],
        color: "rgba(0, 82, 204, 1)",
        curve: 0,
        dash: 0,
        description: $t.__("vw-links.jira-issue.description"),
        name: $t.__("vw-links.jira-issue.name"),
        size: 1,
        defaultModel: true,
      },
    },
    {
      _id: "56575f706172656e74303030",
      data: {
        anchors: [
          {
            data: {
              arrowhead: 0,
              type: "none",
            },
          },
          {
            data: {
              arrowhead: 1,
              type: "triangle",
            },
          },
        ],
        color: "rgba(148, 207, 150, 1)",
        curve: 0.2,
        dash: 0,
        description: $t.__("vw-links.parent.description"),
        name: $t.__("vw-links.parent.name"),
        size: 1,
        title: "",
        defaultModel: true,
      },
    },
  ];
};
