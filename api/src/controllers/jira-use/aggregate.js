import { getIssueType } from "../../utils/jira/Issue-type.js";
import { getStatus } from "../../utils/jira/status.js";
import { getField } from "../../utils/jira/field.js";

const CUSTOM_FIELD_BY_STYLE = {
  classic: {
    STORY_POINT: "storyPoint",
  },
  "next-gen": {
    STORY_POINT: "Story point estimate",
  },
};

export default async (settings, project) => {
  return Promise.all([
    getIssueType(settings),
    getStatus(settings, project),
    getField(settings),
  ]).then((results) => {
    const [issueType, status, field] = results;

    project.map((item) => {
      if (issueType["status-code"] && issueType["status-code"] >= 400) {
        item["issueType"] = { error: issueType };
      } else {
        item.issuetype = issueType.projects.find(
          (issuetype) => issuetype.id == item.id
        ).issuetypes;
      }

      if (status["status-code"] && status["status-code"] >= 400) {
        item["status"] = { error: status };
      } else {
        item.status = status[item.id];
      }

      if (field["status-code"] && field["status-code"] >= 400) {
        item["customFieldKey"] = { error: field };
      } else {
        const [storyPoint] = field
          .filter(
            (x) => x.name === CUSTOM_FIELD_BY_STYLE[item.style]["STORY_POINT"]
          )
          .map((x) => x.key);
        
        item["customFieldKey"] = {
          storyPoint,
          epicName: field.find((item) => item.name === "Epic Name").id,
          team: "customfield_10001", // Champ team Jira
        };
      }
    });
    return project.map((item) => ({ data: item }));
  });
};
