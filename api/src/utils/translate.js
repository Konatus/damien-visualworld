import i18n from "i18n";
import { fileURLToPath } from "url";
import path from "path";

const importMetaUrl = import.meta.url;
const filename = fileURLToPath(importMetaUrl);
const dirname = path.dirname(filename);

i18n.configure({
  locales: ["fr" /*, 'en'*/],
  defaultLocale: "fr",
  directory: path.join(dirname, "..", "/locales"),
  objectNotation: true,
  register: global,
  //   api: {
  //   _: '$t', // now request.__ becomes request._
  //   _n: '$tn' // and request.__n can be called as request._tn
  // },
});

export default function (req) {
  const { request = req, me } = req;
  const { locale } = me.identity;
  if (locale) {
    i18n.setLocale(locale);
    return i18n;
  } else {
    i18n.init(request);
    return request;
  }
}
