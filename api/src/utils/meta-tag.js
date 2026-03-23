import cheerio from "cheerio";
import fetch from "node-fetch";

const isUrl = (string) => {
  try {
    return Boolean(new URL(string));
  } catch (e) {
    return false;
  }
};

export default async (document) => {
  for (let i = 0; i < document.length; i++) {
    if (document[i] && document[i].data && document[i].data.input) {
      // Check if the url is valid
      if (isUrl(document[i].data.input)) {
        try {
          const html = await (await fetch(document[i].data.input)).text();
          let base64Image = "";

          const $ = cheerio.load(html);

          // Set meta tag if they are available
          const metaTag = {
            title:
              $('meta[property="og:title"]').attr("content") ||
              $("title").text() ||
              $('meta[name="title"]').attr("content"),
            description:
              $('meta[property="og:description"]').attr("content") ||
              $('meta[name="description"]').attr("content"),
            image:
              $('meta[property="og:image"]').attr("content") ||
              $('meta[property="og:image:url"]').attr("content"),
            icon:
              $('link[rel="icon"]').attr("href") ||
              $('link[rel="shortcut icon"]').attr("href"),
            url: $('meta[property="og:url"]').attr("content"),
          };

          if (metaTag.image) {
            const response = await fetch(metaTag.image);
            const image = await response.arrayBuffer();
            base64Image = `data:${response.headers.get(
              "content-type"
            )};base64,${Buffer.from(image).toString("base64")}`;
          }

          document[i].data = {
            input: document[i].data.input,
            title: metaTag.title,
            metaTagDescription: metaTag.description,
            imgUrl: [{ url: base64Image }],
          };
        } catch (e) {
          document[i].data = {
            input: document[i].data.input,
            title: "",
            metaTagDescription: "",
            imgUrl: "",
          };
        }
      }
    }
  }

  return document;
};
