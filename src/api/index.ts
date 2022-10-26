import axios from "axios";
import { InstancesGroup } from "../types";
import { createRefresh } from "react-auth-kit";

export const IM_HOST = "https://api.im.dev.test.c.dhis2.org";

const getTokenFromLocalStorage = () => {
  return localStorage.getItem("_auth");
};

export const getInstances = () => {
  return axios.get<InstancesGroup>("/instances", {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });
};

export const getToken = (username, password) => {
  return axios.post(
    `${IM_HOST}/tokens`,
    {},
    {
      auth: {
        username,
        password,
      },
    }
  );
};

export const refreshApi = createRefresh({
  interval: 15, // Refreshs the token in every 15 minutes
  refreshApiCallback: ({
    authToken,
    authTokenExpireAt,
    refreshToken,
    refreshTokenExpiresAt,
    authUserState,
  }) => {
    return axios
      .post(`${IM_HOST}/refresh`, {
        refreshToken: refreshToken,
        oldAuthToken: authToken,
      })
      .then(({ data }) => {
        return {
          isSuccess: true, // For successful network request isSuccess is true
          newAuthToken: data.newAuthToken,
          newAuthTokenExpireIn: data.newAuthTokenExpireIn,
          // You can also add new refresh token ad new user state
        };
      })
      .catch((e) => {
        console.error(e);
        return {
          isSuccess: false, // For unsuccessful network request isSuccess is false
          newAuthToken: null,
          newAuthTokenExpireIn: null,
        };
      });
  },
});
