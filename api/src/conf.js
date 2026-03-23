import log from "./utils/log.js";

// Read settings from env var & export them
const conf = {
  IS_PRODUCTION: process.env.node_env === "production",
  BASE_URL: process.env.base_url || "http://localhost",
  SELF_PORT: process.env.self_port || 8080, // Port exposed by the API
  ROOT_EMAILS: (process.env.root || "")
    .split(";")
    .map((mail) => mail.toLowerCase()), // Root privileged e-mails
  SOCKET_EXPIRES_AFTER: process.env.socket_expires_after || 60, // After, sockets are considered dead for connectionAll
  SOCKET_MAX_SIZE: process.env.socket_max_size || 1e8, // Default 1e6 is too smal for json import
  MGO_URI: process.env.mgo_uri || "localhost",
  MGO_USERNAME: process.env.mgo_username,
  MGO_PASSWORD: process.env.mgo_password,
  MGO_PORT: process.env.mgo_port || 27017,
  TOKEN_URL: process.env.token_url || "#", // URL where a user can get an offline token
  SIGNOUT_URL: process.env.signout_url || "#",
  RESET_PASSWORD_URL: process.env.reset_password_url || "#",
  HELP_URL: process.env.help_url || "#",
  TERMS_URL: process.env.terms_url || "#",
  SUPPORT_MAIL: process.env.support_mail || "support@visual.world",
  KEYCLOAK_URI: process.env.keycloak_uri || "logindev.visual.world",
  KEYCLOAK_REALM_NAME: process.env.keycloak_realm_name || "visual-world",
  KEYCLOAK_USERNAME: process.env.keycloak_username || "admin",
  KEYCLOAK_PASSWORD: process.env.keycloak_password || "rzBducQGxX9p",
  CIPHER_KEY: process.env.cipher_key || "Ultima-ratio-regum", // Cipher key used to (un)crypt guest link
  CIPHER_IV: process.env.cipher_iv || "Nec-pluribus-impar", // Cipher iv used to (un)crypt guest link
  STRIPE_KEY: process.env.stripe_key,
  STRIPE_WH_SECRET: process.env.stripe_wh_secret, // Stripr webhook secret
  SMTP_HOST: process.env.smtp_host,
  SMTP_PORT: process.env.smtp_port,
  SMTP_USER: process.env.smtp_user,
  SMTP_PASS: process.env.smtp_pass,
  SMTP_NO_REPLY: process.env.smtp_no_reply || "support@visual.world",
  PRICING_URL: process.env.pricing_url || "/",
  WORLD_DEMO_ID: process.env.world_demo_id,
  WORLD_TEMPLATE_ID: process.env.world_template_id, // Customer world template
  DELETE_TRASH_AFTER_DAYS: process.env.delete_trash_after_days || 90,
};
export default { ...conf };

// Log build data
import info from "./info.js";
log.info(`
             ## #
      ###############
    ###    ##     ::###
  ##     ## :::: :  : ##                                               ::                              ##        ##
 ##    ## ::    ::::   ##                                              ::                              ##        ##
 ##   ##  ::    ::     ##      ::    ::  ::   ::::: ::    ::  ::::::   :: #           #   ####     ### ##    ######
 ##  ##    ::::::      ##      ::    ::  ::  ::     ::    ::       ::  :: ##    #    ##  ##  ##  ##    ##  ###  ###
 ## ##  :              ##       ::  ::   ::   ::::  ::    ::  :::::::  ::  ##  ###  ##  ##    ## ##    ##  ##    ##
 ###  :   :  ::::      ##        ::::    ::      :: ::    :: ::    ::  ::   ####  ###    ##  ##  ##    ##  ##    ##
  ##    :    ::::     ##          ::     ::  :::::   :::::::  :::::::  ::    ##   ##      ####   ##    ##   ######
 ## ##               ##
 ##  ################
   ##
${info.branch} - ${info.commit}`);

// Log settings
log.info({
  IS_PRODUCTION: conf.IS_PRODUCTION,
  BASE_URL: conf.BASE_URL,
  SELF_PORT: conf.SELF_PORT,
  ROOT_EMAILS: conf.ROOT_EMAILS,
  SOCKET_EXPIRES_AFTER: conf.SOCKET_EXPIRES_AFTER,
  SOCKET_MAX_SIZE: conf.SOCKET_MAX_SIZE,
  MGO_URI: conf.MGO_URI,
  MGO_USERNAME: conf.MGO_USERNAME,
  MGO_PASSWORD: conf.MGO_PASSWORD ? "*******" : undefined,
  MGO_PORT: conf.MGO_PORT,
  TOKEN_URL: conf.TOKEN_URL,
  SIGNOUT_URL: conf.SIGNOUT_URL,
  RESET_PASSWORD_URL: conf.RESET_PASSWORD_URL,
  HELP_URL: conf.HELP_URL,
  TERMS_URL: conf.TERMS_URL,
  SUPPORT_MAIL: conf.SUPPORT_MAIL,
  KEYCLOAK_URI: conf.KEYCLOAK_URI,
  KEYCLOAK_REALM_NAME: conf.KEYCLOAK_REALM_NAME,
  KEYCLOAK_USERNAME: conf.KEYCLOAK_USERNAME,
  KEYCLOAK_PASSWORD: conf.KEYCLOAK_PASSWORD ? "*******" : undefined,
  CIPHER_KEY: conf.CIPHER_KEY ? "*******" : undefined,
  CIPHER_IV: conf.CIPHER_IV ? "*******" : undefined,
  STRIPE_KEY: conf.STRIPE_KEY ? "*******" : undefined,
  STRIPE_WH_SECRET: conf.STRIPE_WH_SECRET ? "*******" : undefined,
  SMTP_HOST: conf.SMTP_HOST,
  SMTP_PORT: conf.SMTP_PORT,
  SMTP_USER: conf.SMTP_USER,
  SMTP_PASS: conf.SMTP_PASS ? "*******" : undefined,
  SMTP_NO_REPLY: conf.SMTP_NO_REPLY,
  WORLD_DEMO_ID: conf.WORLD_DEMO_ID,
  WORLD_TEMPLATE_ID: conf.WORLD_TEMPLATE_ID,
  PRICING_URL: conf.PRICING_URL,
  DELETE_TRASH_AFTER_DAYS: conf.DELETE_TRASH_AFTER_DAYS,
});
