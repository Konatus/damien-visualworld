export default (document) => {
  const users = JSON.parse(JSON.stringify(document));
  for (let user of users) {
    if (user && user.data && user.data.email) {
      user.data.email = user.data.email.toLowerCase();
    }
  }
  return users;
};
