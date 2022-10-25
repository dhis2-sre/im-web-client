import axios from "axios";
import { InstancesGroup } from "../types";
import { createRefresh } from 'react-auth-kit'

export const IM_HOST = "http://localhost:8010/proxy";

// const TOKEN = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY3MTIzMDEsImlhdCI6MTY2NjcxMjAwMSwidXNlciI6eyJJRCI6OSwiQ3JlYXRlZEF0IjoiMjAyMi0xMC0yNVQxNTozMTo0MC44MDQxNTJaIiwiVXBkYXRlZEF0IjoiMjAyMi0xMC0yNVQxNTozMTo0MC44MDQxNTJaIiwiRGVsZXRlZEF0IjpudWxsLCJFbWFpbCI6ImhhY2thdGhvbkBkaGlzMi5vcmciLCJHcm91cHMiOlt7Ik5hbWUiOiJ3aG9hbWkiLCJIb3N0bmFtZSI6Indob2FtaS5pbS5kZXYudGVzdC5jLmRoaXMyLm9yZyIsIlVzZXJzIjpudWxsLCJjbHVzdGVyQ29uZmlndXJhdGlvbiI6eyJJRCI6MCwiQ3JlYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJVcGRhdGVkQXQiOiIwMDAxLTAxLTAxVDAwOjAwOjAwWiIsIkRlbGV0ZWRBdCI6bnVsbCwiR3JvdXBOYW1lIjoiIiwiS3ViZXJuZXRlc0NvbmZpZ3VyYXRpb24iOm51bGx9LCJDcmVhdGVkQXQiOiIyMDIyLTA3LTE1VDEzOjEyOjE1LjcyMzUxNVoiLCJVcGRhdGVkQXQiOiIyMDIyLTEwLTI1VDE1OjMyOjAwLjc2MDMyNVoiLCJEZWxldGVkQXQiOm51bGx9XSwiQWRtaW5Hcm91cHMiOltdfX0.VYZ3kvwhE9DRZ4vfNT70jUSxyHP7niGitLXYqdJi28ASwIn8zAqD1zqZSmFHN1LMlJALFW58Qyu1nrlWudyEOylN_0bUj_EsDt6zVfKu0g1oJonQnoDgVPzcabAbDxW_USjjPwF0NUcsm5vtv3F3hz8eHxPHe4Au0iVfHKArK2um9z2KEXwJ2Wj5I6C117EqZYeJ-xXnOQYQXyaHaRAUUAzj8sAHJ-PkP7qu9uHmL980_UC0XSswSobie0b-Wzj60HvlpuKQIDGICImhPOZ5fZkjnlp6Mc_4bqmQkM-TwplHIMgxIbA3_veAHrfJYxcZskqbD8TS71TThEPViTxomQ`;

export const getInstances = (authHeader) => {
  console.log('getInstances',authHeader)
  return axios.get<InstancesGroup>("/instances", {
    baseURL: IM_HOST,
    headers: {
      Authorization: authHeader,
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

