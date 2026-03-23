import CONF from "../conf.js";
import axios from "axios";
import qs from "qs";

// Obtain access token
export default async () => {
  // Log in on keycloak as admin
  const adminLogin = (
    await axios.post(
      `https://${CONF.KEYCLOAK_URI}/auth/realms/master/protocol/openid-connect/token`,
      qs.stringify({
        grant_type: "password",
        client_id: "admin-cli",
        username: CONF.KEYCLOAK_USERNAME,
        password: CONF.KEYCLOAK_PASSWORD,
      })
    )
  ).data;
  return {
    headers: {
      Authorization: `Bearer ${adminLogin.access_token}`,
    },
  };
};
