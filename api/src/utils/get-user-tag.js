export default (socketOrRequest, scope) => {
  if (
    scope &&
    scope.worldId &&
    socketOrRequest.me &&
    socketOrRequest.me.profile &&
    socketOrRequest.me.profile.world[scope.worldId]
  ) {
    return socketOrRequest.me.profile.world[scope.worldId].userId;
  } else {
    return (
      socketOrRequest.me.identity.terms || socketOrRequest.me.identity.email
    );
  }
};
