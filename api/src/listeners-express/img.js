import MulterModule from "multer";
const Multer = MulterModule();
import Jimp from "jimp";
import getUserTag from "../utils/get-user-tag.js";
export default async (express) => {
  express.get(
    "/api/img/:filename", // ?worldId=:worldId
    function (req, res, next) {
      if (req.me.request.includes("img/read")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    async function (req, res) {
      // read image from mongo
      // TODO: dont use mongo client directly, use service
      const images = await global.mgo
        .db(req.query.worldId)
        .collection("Image")
        .find({
          filename: req.params.filename,
          "private.deletedAt": null,
        })
        .toArray();
      if (!images || !images.length) {
        res.status(404).send();
        return;
      }
      const image = images[0];
      let buffer;

      if (
        // webp & svg image types not supported by Jimp
        image.data.mimetype === "image/webp" ||
        image.data.mimetype === "image/svg+xml"
      ) {
        buffer = image.buffer.buffer;
      } else {
        // resize, if necessary
        const jimp = await Jimp.read(image.buffer.buffer);
        if (req.query.w || req.query.h) {
          jimp.resize(
            1 * req.query.w || Jimp.AUTO,
            1 * req.query.h || Jimp.AUTO
          );
        }
        // send data
        buffer = await jimp.getBufferAsync(image.data.mimetype);
      }

      res.setHeader("Content-Type", image.data.mimetype);
      res.setHeader("Cache-Control", "private, max-age=2592000, immutable"); // Cache for 30 days
      res.status(200).send(buffer);
    }
  );

  express.post(
    "/api/img/:filename", // ?worldId=:worldId
    function (req, res, next) {
      if (req.me.request.includes("img/create")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    Multer.any(),
    function (req, res) {
      // TODO: allow only PNG and JPG files (maybe BMP also, these 3 are readable by Jimp)
      for (let file of req.files) {
        // TODO: break if file is more the 2Mo
        // TODO: dont use mongo client directly, use service
        const currentDate = new Date().toISOString();
        global.mgo
          .db(req.query.worldId)
          .collection("Image")
          .updateOne(
            {
              filename: req.params.filename,
              "private.deletedAt": null,
            },
            {
              $set: {
                filename: req.params.filename,
                buffer: file.buffer,
                "data.originalname": file.originalname,
                "data.mimetype": file.mimetype,
                "data.size": file.size,
                "private.createdBy": getUserTag(req, req.query),
                "private.createdAt": currentDate,
                "private.updatedAt": currentDate,
              },
            },
            {
              upsert: true,
              safe: false,
            }
          );
      }

      // TODO: send right return
      res.send(
        `POST image ${req.params.filename} in world ${req.query.worldId}`
      );
    }
  );
};
