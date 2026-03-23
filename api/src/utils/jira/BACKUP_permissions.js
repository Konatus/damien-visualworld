import log from "../log.js";
import apiWrapper from "./api-wrapper.js";

export async function getPermission(data) {
  // check user permissions for Jira project sync
  try {
    data = {
      ...data,
      pathname: "/rest/api/3/mypermissions",
      query: { permissions: "BROWSE_PROJECTS,EDIT_ISSUES,ADMINISTER_PROJECTS" },
    };
    const response = await apiWrapper.get(data);

    if (!response) {
      return {
        permissionError: { "status-code": 400, message: "Invalid URL" },
      };
    }

    const statusCode = await response.status;
    if (statusCode >= 400) {
      return {
        permissionError: {
          "status-code": statusCode,
          message: await response.statusText,
        },
      };
    }

    const { permissions } = await response.json();
    console.log('Permissions response:', JSON.stringify(permissions, null, 2));
    
    // Vérifier chaque permission individuellement
    const permissionStatus = Object.entries(permissions).map(([key, value]) => ({
      permission: key,
      hasPermission: value.havePermission
    }));
    console.log('Permission status:', JSON.stringify(permissionStatus, null, 2));

    if (!Object.keys(permissions).every((item) => permissions[item].havePermission)) {
      const missingPermissions = Object.entries(permissions)
        .filter(([_, value]) => !value.havePermission)
        .map(([key, value]) => value.name)
        .join(' - ');
      
      console.log('Missing permissions:', missingPermissions);
      return { 
        permissionError: {
          message: `Permission to manage project missing: ${missingPermissions}`,
          details: permissions
        }
      };
    } else {
      return { permissions };
    }
  } catch (error) {
    const { scope, socket } = data;
    log.errorJira(socket.me.identity.email, "get/permission", scope, error);
  }
}

export default {
  getPermission,
};
