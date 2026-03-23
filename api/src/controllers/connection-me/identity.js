import CONF from "../../conf.js";
import info from "../../info.js";

export default (socket) => {
  return [
    {
      _id: socket.me.identity.email,
      data: {
        identity: socket.me.identity,
        profile: socket.me.profile,
        grant: socket.me.grant,
        tokenUrl: CONF.TOKEN_URL,
        signoutUrl: CONF.SIGNOUT_URL,
        resetPasswordUrl: CONF.RESET_PASSWORD_URL,
        helpUrl: CONF.HELP_URL,
        termsUrl: CONF.TERMS_URL,
        supportMail: CONF.SUPPORT_MAIL,
        pricingUrl: CONF.PRICING_URL,
        gitInfo: info,
      },
    },
  ];
};
