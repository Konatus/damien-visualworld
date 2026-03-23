import Identity from "./identity.js";
import Profile from "./profile.js";
import Grant from "./grant.js";
import Request from "./request.js";
import Response from "./response.js";

export default async ({ email, accessToken, userAgent, worldId, boardId }) => {
  const identity = await Identity({ email, accessToken, userAgent }); // { connected, email, firstname, lastname }
  const profile = await Profile({ ...identity }); // { isRoot, world, board }
  const grant = await Grant(profile); //{ app, world, board }
  const request = await Request({ grant, worldId, boardId });
  const response = await Response({ profile, grant, worldId, boardId });

  return {
    identity,
    profile,
    grant,
    request,
    response,
  };
};
