import Express from "express";

import BoardIo from "../controllers/board-io/index.js";

export default async (express) => {
  express.get(
    "/api/board-io", // ?worldId=:worldId&boardId=:boardId
    function (req, res, next) {
      if (req.me.request.includes("board-io/get")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    async function (req, res) {
      const data = await BoardIo.get(req, req.query);
      res.status(200).send(data[0].data);
    }
  );

  express.post(
    "/api/board-io", // ?worldId=:worldId&boardId=:boardId
    function (req, res, next) {
      if (req.me.request.includes("board-io/set")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    Express.json(),
    async function (req, res) {
      try {
        const success = await BoardIo.set(req, req.query, {
          document: req.body,
        });
        res.status(success ? 200 : 500).send({ success });
      } catch (error) {
        res.status(400).send({ success: false, error });
      }
    }
  );
};
