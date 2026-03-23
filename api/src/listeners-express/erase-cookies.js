export default async (express) => {
  express.get(
    "/api/erase-cookies",
    function (req, res, next) {
      if (req.me.request.includes("erase-cookies")) {
        next();
      } else {
        res.status(401).send();
      }
    },
    function (req, res) {
      try {
        const header = req.headers.cookie;
        if (!header || typeof header !== "string") {
          res.send("No cookie to erase.");
        } else {
          const cookie = header.split(";").map((x) => x.trim());
          const cookieName = cookie.map((x) => x.split("=")[0]);
          cookieName.forEach((x) => {
            res.clearCookie(x);
          });
          const cookieNames = cookieName.map((x) => `"${x}"`).join(", ");
          res.send(`Following cookies have been erased: ${cookieNames}`);
        }
      } catch (e) {
        console.log(e);
        res.send("An error occured when removing the cookies.");
      }
    }
  );
};
