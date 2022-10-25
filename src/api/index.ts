import axios from "axios";
import { InstancesGroup } from "../types";
import { createRefresh } from 'react-auth-kit'

export const IM_HOST = "http://localhost:8010/proxy";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY3MTM4OTQsImlhdCI6MTY2NjcxMzU5NCwidXNlciI6eyJJRCI6OSwiQ3JlYXRlZEF0IjoiMjAyMi0xMC0yNVQxNTozMTo0MC44MDQxNTJaIiwiVXBkYXRlZEF0IjoiMjAyMi0xMC0yNVQxNTozMTo0MC44MDQxNTJaIiwiRGVsZXRlZEF0IjpudWxsLCJFbWFpbCI6ImhhY2thdGhvbkBkaGlzMi5vcmciLCJHcm91cHMiOlt7Ik5hbWUiOiJ3aG9hbWkiLCJIb3N0bmFtZSI6Indob2FtaS5pbS5kZXYudGVzdC5jLmRoaXMyLm9yZyIsIlVzZXJzIjpudWxsLCJjbHVzdGVyQ29uZmlndXJhdGlvbiI6eyJJRCI6MCwiQ3JlYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJVcGRhdGVkQXQiOiIwMDAxLTAxLTAxVDAwOjAwOjAwWiIsIkRlbGV0ZWRBdCI6bnVsbCwiR3JvdXBOYW1lIjoiIiwiS3ViZXJuZXRlc0NvbmZpZ3VyYXRpb24iOm51bGx9LCJDcmVhdGVkQXQiOiIyMDIyLTA3LTE1VDEzOjEyOjE1LjcyMzUxNVoiLCJVcGRhdGVkQXQiOiIyMDIyLTEwLTI1VDE1OjMyOjAwLjc2MDMyNVoiLCJEZWxldGVkQXQiOm51bGx9XSwiQWRtaW5Hcm91cHMiOltdfX0.p_61lUmFr-R9PNFkJGibiXl0D7qPVCdOav6Ke_fQMQUg3INbnT_vSrERTuNIj42juDjizAdJR2LD1STc3XI96Pqh9z6av8juGiJnsZ1aULuftVrdWtyxZMXVYldFfhW5Cl7nieMWU4ltKNGBCmNgg3cFW3cjaKcPIqJb0pvJ7lDE1sXnGI_qjbSlrDR3ORv4DjWh0fcjKoR_F5cxihz1x4PGA94ZFbrWOBRbIM5zYC39J-w41Wck4bbRnPd5uluYAQ6Uf_UJKciwagDN7PUBwTLxqTkvqQaxv5L7TSM0WS5WH4ygH-5fkhe66oDFE-S1bodWyT-NSjsh9OI3r1plMQ";

export const getInstances = () => {
  return axios.get<InstancesGroup>("/instances", {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
};

export const getToken = (username, password) => {
  return axios.post(`${IM_HOST}/tokens`, {}, {
    auth: {
      username,
      password
    }
  })
}

export const refreshApi = createRefresh({
  interval: 15,   // Refreshs the token in every 15 minutes
  refreshApiCallback: (
    {
      authToken,
      authTokenExpireAt,
      refreshToken,
      refreshTokenExpiresAt,
      authUserState
    }) => {
    return axios.post(`${IM_HOST}/refresh`,
      {
        refreshToken: refreshToken,
        oldAuthToken: authToken,
      }
    ).then(({data})=>{
      return {
        isSuccess: true,  // For successful network request isSuccess is true
        newAuthToken: data.newAuthToken,
        newAuthTokenExpireIn: data.newAuthTokenExpireIn
        // You can also add new refresh token ad new user state
      }
    })
    .catch((e)=>{
      console.error(e)
      return{
        isSuccess:false, // For unsuccessful network request isSuccess is false
        newAuthToken: null,
        newAuthTokenExpireIn: null
      }
    })
  }
})

