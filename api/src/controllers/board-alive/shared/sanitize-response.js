export default (boards) => {
  for (let board in boards) {
    if (board.state) {
      for (let key in board.state) {
        if (key != "latest") {
          board.state[key] = {
            screenshot: board.state[key].screenshot,
          };
        }
      }
    }
  }
  return boards;
};
