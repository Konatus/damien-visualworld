import fetch from "node-fetch";
import log from "../log.js";
import { decipher } from "../cipher.js";

const headers = (board) => {
  console.log("[JIRA AUTH] Board ultraPrivate exists:", !!board.ultraPrivate);
  console.log("[JIRA AUTH] Encrypted token exists:", !!board.ultraPrivate?.jiraApiToken);
  console.log("[JIRA AUTH] Encrypted token:", board.ultraPrivate?.jiraApiToken?.substring(0, 50) + "...");

  const decipheredToken = decipher(board.ultraPrivate?.jiraApiToken || "");
  const authString = `${board.data.jira.username}:${decipheredToken}`;
  const base64Auth = Buffer.from(authString).toString("base64");

  console.log("[JIRA AUTH] Username:", board.data.jira.username);
  console.log("[JIRA AUTH] Deciphered token length:", decipheredToken?.length || 0);
  console.log("[JIRA AUTH] Base64 length:", base64Auth?.length || 0);

  return {
    Authorization: `Basic ${base64Auth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const get = async ({ socket, scope, board, pathname, query }) => {
  try {
    // Construct URL properly - board.data.jira.host already contains protocol
    const baseUrl = board.data.jira.host.replace(/\/$/, ""); // Remove trailing slash
    const queryString = query ? "?" + new URLSearchParams(query).toString() : "";
    const fullUrl = `${baseUrl}${pathname}${queryString}`;

    console.log("[JIRA API GET]", fullUrl); // Debug log

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(board)
    });

    console.log("[JIRA API GET] Status:", response.status); // Debug log

    return response;
  } catch (error) {
    console.error("[JIRA API GET] Error:", error); // Debug log
    log.errorJira(socket.me.identity.email, "api/get", scope, error);
  }
};

const post = async ({ socket, scope, board, pathname, body }) => {
  try {
    // Construct URL properly - board.data.jira.host already contains protocol
    const baseUrl = board.data.jira.host.replace(/\/$/, ""); // Remove trailing slash
    const fullUrl = `${baseUrl}${pathname}`;

    console.log("[JIRA API POST]", fullUrl); // Debug log
    console.log("[JIRA API POST] Body:", body); // Debug log

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(board),
      body
    });

    console.log("[JIRA API POST] Status:", response.status); // Debug log

    return response;
  } catch (error) {
    console.error("[JIRA API POST] Error:", error); // Debug log
    log.errorJira(socket.me.identity.email, "api/post", scope, error);
  }
};

const put = async ({ socket, scope, board, pathname, body }) => {
  try {
    // Construct URL properly - board.data.jira.host already contains protocol
    const baseUrl = board.data.jira.host.replace(/\/$/, ""); // Remove trailing slash
    const fullUrl = `${baseUrl}${pathname}`;

    console.log("[JIRA API PUT]", fullUrl); // Debug log

    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: headers(board),
      body
    });

    console.log("[JIRA API PUT] Status:", response.status); // Debug log

    return response;
  } catch (error) {
    console.error("[JIRA API PUT] Error:", error); // Debug log
    log.errorJira(socket.me.identity.email, "api/put", scope, error);
  }
};

const delete_ = async ({ socket, scope, board, pathname }) => {
  try {
    // Construct URL properly - board.data.jira.host already contains protocol
    const baseUrl = board.data.jira.host.replace(/\/$/, ""); // Remove trailing slash
    const fullUrl = `${baseUrl}${pathname}`;

    console.log("[JIRA API DELETE]", fullUrl); // Debug log

    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(board)
    });

    console.log("[JIRA API DELETE] Status:", response.status); // Debug log

    return response;
  } catch (error) {
    console.error("[JIRA API DELETE] Error:", error); // Debug log
    log.errorJira(socket.me.identity.email, "api/delete", scope, error);
  }
};

export default {
  get,
  post,
  put,
  delete: delete_,
};
