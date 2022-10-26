import axios from "axios";
import { InstancesGroup } from "../types";
import { createRefresh } from "react-auth-kit";

export const IM_HOST = "https://api.im.prod.test.c.dhis2.org";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY3NTEzMzIsImlhdCI6MTY2Njc0ODMzMiwidXNlciI6eyJJRCI6NCwiQ3JlYXRlZEF0IjoiMjAyMi0wOC0yOFQxMjo0MzozOS4zOTIxNjJaIiwiVXBkYXRlZEF0IjoiMjAyMi0wOC0yOFQxMjo0MzozOS4zOTIxNjJaIiwiRGVsZXRlZEF0IjpudWxsLCJFbWFpbCI6ImFuZHJlYXNAc29tZXRoaW5nLm9yZyIsIkdyb3VwcyI6W3siTmFtZSI6Indob2FtaSIsIkhvc3RuYW1lIjoid2hvYW1pLmltLnByb2QudGVzdC5jLmRoaXMyLm9yZyIsIlVzZXJzIjpudWxsLCJjbHVzdGVyQ29uZmlndXJhdGlvbiI6eyJJRCI6MCwiQ3JlYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJVcGRhdGVkQXQiOiIwMDAxLTAxLTAxVDAwOjAwOjAwWiIsIkRlbGV0ZWRBdCI6bnVsbCwiR3JvdXBOYW1lIjoiIiwiS3ViZXJuZXRlc0NvbmZpZ3VyYXRpb24iOm51bGx9LCJDcmVhdGVkQXQiOiIyMDIyLTA2LTE3VDEzOjQyOjIwLjIyNjE2MVoiLCJVcGRhdGVkQXQiOiIyMDIyLTEwLTIxVDEwOjI2OjI0Ljc4MTc5OVoiLCJEZWxldGVkQXQiOm51bGx9LHsiTmFtZSI6InBsYXkiLCJIb3N0bmFtZSI6InBsYXkuaW0ub3MuYy5kaGlzMi5vcmciLCJVc2VycyI6bnVsbCwiY2x1c3RlckNvbmZpZ3VyYXRpb24iOnsiSUQiOjAsIkNyZWF0ZWRBdCI6IjAwMDEtMDEtMDFUMDA6MDA6MDBaIiwiVXBkYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJEZWxldGVkQXQiOm51bGwsIkdyb3VwTmFtZSI6IiIsIkt1YmVybmV0ZXNDb25maWd1cmF0aW9uIjpudWxsfSwiQ3JlYXRlZEF0IjoiMjAyMi0wNi0xN1QxMzo0MjoyMC4yMjk1MjVaIiwiVXBkYXRlZEF0IjoiMjAyMi0wOC0zMFQwODoxOTo0Mi44NDc2MjNaIiwiRGVsZXRlZEF0IjpudWxsfV0sIkFkbWluR3JvdXBzIjpbXX19.ENiC1nGvzOhAFlRqFwFRf2fGKF-yp7dessVutloQvfveUYII0t_ynQpQWsTyO3uwxFQojqsaMpaXQlXwzx2d-DMtF0PnnbXe99_D4nMWMqwAaKN0TWeNmZctlaaxVi0RLXgA6sgSrChq14Af8Xz2bsmjrkQ7isoQHB31H17YZkY4s197Sca5_B8-P7CEVM3ebgsvyXZBkOopyUKMi3G9LWE1VIEIEbhqGiOSjkPAywskTj3ZXRGQPRTD6I-po5D6ixB60hc-0IQ5Nym25o5P9FayPAC-7jSP1BqI303mXT6EN40XDT69wg-DmTGUopFw6uCyRCTtWjoJRqup3LkfFg";

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
