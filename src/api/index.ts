import axios from "axios";
import { InstancesGroup } from "../types";
import { createRefresh } from "react-auth-kit";

export const IM_HOST = "http://localhost:8010/proxy";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY3MTY4MDcsImlhdCI6MTY2NjcxMzgwNywidXNlciI6eyJJRCI6NiwiQ3JlYXRlZEF0IjoiMjAyMi0xMC0yMVQwOTo1OToyMi40OTYzMTNaIiwiVXBkYXRlZEF0IjoiMjAyMi0xMC0yMVQwOTo1OToyMi40OTYzMTNaIiwiRGVsZXRlZEF0IjpudWxsLCJFbWFpbCI6ImhhY2thdGhvbkBkaGlzMi5vcmciLCJHcm91cHMiOlt7Ik5hbWUiOiJ3aG9hbWkiLCJIb3N0bmFtZSI6Indob2FtaS5pbS5wcm9kLnRlc3QuYy5kaGlzMi5vcmciLCJVc2VycyI6bnVsbCwiY2x1c3RlckNvbmZpZ3VyYXRpb24iOnsiSUQiOjAsIkNyZWF0ZWRBdCI6IjAwMDEtMDEtMDFUMDA6MDA6MDBaIiwiVXBkYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJEZWxldGVkQXQiOm51bGwsIkdyb3VwTmFtZSI6IiIsIkt1YmVybmV0ZXNDb25maWd1cmF0aW9uIjpudWxsfSwiQ3JlYXRlZEF0IjoiMjAyMi0wNi0xN1QxMzo0MjoyMC4yMjYxNjFaIiwiVXBkYXRlZEF0IjoiMjAyMi0xMC0yMVQxMDoyNjoyNC43ODE3OTlaIiwiRGVsZXRlZEF0IjpudWxsfSx7Ik5hbWUiOiJoYWNrYXRob24iLCJIb3N0bmFtZSI6ImhhY2thdGhvbi5pbS50b25zLm9zLmMuZGhpczIub3JnIiwiVXNlcnMiOm51bGwsImNsdXN0ZXJDb25maWd1cmF0aW9uIjp7IklEIjowLCJDcmVhdGVkQXQiOiIwMDAxLTAxLTAxVDAwOjAwOjAwWiIsIlVwZGF0ZWRBdCI6IjAwMDEtMDEtMDFUMDA6MDA6MDBaIiwiRGVsZXRlZEF0IjpudWxsLCJHcm91cE5hbWUiOiIiLCJLdWJlcm5ldGVzQ29uZmlndXJhdGlvbiI6bnVsbH0sIkNyZWF0ZWRBdCI6IjIwMjItMTAtMjFUMDk6NTc6MjEuMjA3NDc4WiIsIlVwZGF0ZWRBdCI6IjIwMjItMTAtMjFUMDk6NTk6NTQuNzczNjEzWiIsIkRlbGV0ZWRBdCI6bnVsbH1dLCJBZG1pbkdyb3VwcyI6W119fQ.UKhHq-amvzkKd_u_tTPP3jtGuBuVBrJCj1o-Je_8AedI1hju-cD6shZRNTuh6bYuz9hSX3REsOv_dG4a2PHBZca6fG05iCJS1jL6NmGZb-qcww7P9gpwZm7l0jeCtr5Wsqo0FECdqRDF0uUI54ds6iGDUfcsPL2g0cicGZpukKoEpLcCiXUWS4HyWFvS7YAGlz9CIk6FWIuPWmHy-YDGGHimWBbtwTxUtQHcehMmAs74g6g_IaFArR8Obrw2zjFRbj3RMaBg1dyqZakdGmknDAfrOFIAXlN1PhvXbhwJlM86k4q7gx5dhS1u-ta_eA-7u7oMAcO2h1asuadgA35Uzg";

export const getInstances = () => {
  return axios.get<InstancesGroup>("/instances", {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
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
