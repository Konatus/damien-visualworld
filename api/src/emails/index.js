import nodemailer from "nodemailer";
import Email from "email-templates";
import inlineBase64 from "nodemailer-plugin-inline-base64";
import { fileURLToPath } from "url";
import path from "path";
import CONF from "../conf.js";
import log from "../utils/log.js";
import read from "../services/read.js";

const importMetaUrl = import.meta.url;
const filename = fileURLToPath(importMetaUrl);
const dirname = path.dirname(filename);

let transport, emailTemplate;
if (CONF.IS_PRODUCTION) {
  //Nodemailer Transporter
  const smtpSettings = {
    host: CONF.SMTP_HOST,
    port: CONF.SMTP_PORT,
    secure: CONF.SMTP_PORT == 465, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  };
  if (CONF.SMTP_USER && CONF.SMTP_PASS) {
    smtpSettings["auth"] = {
      user: CONF.SMTP_USER,
      pass: CONF.SMTP_PASS,
    };
  }
  transport = nodemailer.createTransport(smtpSettings);
  transport.use("compile", inlineBase64({ cidPrefix: "somePrefix_" }));

  // verify connection configuration
  transport.verify(function (error) {
    if (error) {
      return log.error(`Email ${error}`);
    } else {
      log.info("Server mail is ready to take our messages");
    }
  });

  emailTemplate = new Email({
    // <https://github.com/Automattic/juice>
    juice: true,
    // Override juice global settings <https://github.com/Automattic/juice#juicecodeblocks>
    juiceSettings: {
      tableElements: ["TABLE"],
    },
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(dirname, "assets"),
        images: true,
      },
    },
  });
}

export default async function (locals, cb) {
  if (CONF.IS_PRODUCTION) {
    const { $t, email, subject, scope, view } = locals;
    const [world] = await read.alive({
      database: "worlds",
      collection: "Data",
      document: [
        {
          worldId: scope ? scope.worldId : undefined,
        },
      ],
    });
    const [board] = await read.alive({
      database: scope ? scope.worldId : undefined,
      collection: "Board",
      document: [
        {
          _id: scope ? scope.boardId : undefined,
        },
      ],
    });

    //Generate template
    const template = path.join(dirname, "templates/layout", view);

    const html = await emailTemplate.render(template, {
      ...locals,
      worldName: world ? world.data.name : undefined,
      boardName: board ? board.data.name : undefined,
      support: CONF.SUPPORT_MAIL,
    });

    // Send Email
    transport.sendMail(
      {
        from: CONF.SMTP_NO_REPLY,
        to: email,
        subject: $t.__(`email.subject.${subject}`),
        html,
      },
      cb
    );
  }
}
